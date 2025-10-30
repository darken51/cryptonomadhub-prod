"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { AppHeader } from "@/components/AppHeader";
import { TrendingUp, TrendingDown, DollarSign, Activity, AlertTriangle, Calendar, Droplet, Award } from "lucide-react";

// Force dynamic rendering for authenticated pages
export const dynamic = 'force-dynamic'

interface YieldPosition {
  id: number;
  position_type: string;
  protocol_name: string;
  chain: string;
  pool_name?: string;
  token_a?: string;
  token_b?: string;
  amount_a?: number;
  amount_b?: number;
  single_token?: string;
  single_amount?: number;
  deposit_value_usd?: number;
  current_value_usd?: number;
  total_rewards_usd: number;
  rewards_claimed_usd: number;
  rewards_unclaimed_usd: number;
  reward_tokens?: string[];
  apy_at_deposit?: number;
  current_apy?: number;
  impermanent_loss_usd?: number;
  impermanent_loss_pct?: number;
  status: string;
  is_active: boolean;
  opened_at: string;
  closed_at?: string;
  holding_period_days?: number;
  total_gain_loss_usd?: number;
}

interface YieldStats {
  total_positions: number;
  active_positions: number;
  closed_positions: number;
  total_deposited_usd: number;
  total_current_value_usd: number;
  total_rewards_usd: number;
  total_unclaimed_rewards_usd: number;
  total_impermanent_loss_usd: number;
  total_pnl_usd: number;
}

export default function YieldFarmingPage() {
  const { user, token, isLoading } = useAuth();
  const [positions, setPositions] = useState<YieldPosition[]>([]);
  const [stats, setStats] = useState<YieldStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("active");
  const [filterProtocol, setFilterProtocol] = useState<string>("");
  const [filterChain, setFilterChain] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    } else if (user && token) {
      fetchPositions();
    }
  }, [user, isLoading, token, router]);

  const fetchPositions = async () => {
    try {
      // Note: This endpoint needs to be created in the backend
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/yield/positions`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setPositions(data);
        calculateStats(data);
      } else if (res.status === 401) {
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Failed to fetch positions:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (positionsData: YieldPosition[]) => {
    const stats: YieldStats = {
      total_positions: positionsData.length,
      active_positions: positionsData.filter(p => p.is_active).length,
      closed_positions: positionsData.filter(p => !p.is_active).length,
      total_deposited_usd: positionsData.reduce((sum, p) => sum + (p.deposit_value_usd || 0), 0),
      total_current_value_usd: positionsData.filter(p => p.is_active).reduce((sum, p) => sum + (p.current_value_usd || 0), 0),
      total_rewards_usd: positionsData.reduce((sum, p) => sum + p.total_rewards_usd, 0),
      total_unclaimed_rewards_usd: positionsData.filter(p => p.is_active).reduce((sum, p) => sum + p.rewards_unclaimed_usd, 0),
      total_impermanent_loss_usd: positionsData.reduce((sum, p) => sum + (p.impermanent_loss_usd || 0), 0),
      total_pnl_usd: positionsData.reduce((sum, p) => sum + (p.total_gain_loss_usd || 0), 0),
    };
    setStats(stats);
  };

  const filteredPositions = positions.filter(position => {
    if (filterStatus === "active" && !position.is_active) return false;
    if (filterStatus === "closed" && position.is_active) return false;
    if (filterProtocol && position.protocol_name !== filterProtocol) return false;
    if (filterChain && position.chain !== filterChain) return false;
    return true;
  });

  const protocols = Array.from(new Set(positions.map(p => p.protocol_name)));

  if (loading) {
    return (
      <>
        <AppHeader />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeader />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Yield Farming Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your liquidity pools, staking positions, and yield farming rewards
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
              <Activity size={20} />
              <span className="text-sm">Active Positions</span>
            </div>
            <p className="text-3xl font-bold text-green-600">{stats.active_positions}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Deposited</div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              ${stats.total_deposited_usd.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Current Value</div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              ${stats.total_current_value_usd.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
              <Award size={20} />
              <span className="text-sm">Total Rewards</span>
            </div>
            <p className="text-3xl font-bold text-purple-600">
              ${stats.total_rewards_usd.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total P&L</div>
            <p className={`text-3xl font-bold ${stats.total_pnl_usd >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.total_pnl_usd >= 0 ? '+' : ''}${stats.total_pnl_usd.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 mb-8">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus("active")}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filterStatus === "active"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterStatus("closed")}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filterStatus === "closed"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              Closed
            </button>
            <button
              onClick={() => setFilterStatus("")}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filterStatus === ""
                  ? "bg-gray-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              All
            </button>
          </div>

          <select
            value={filterProtocol}
            onChange={(e) => setFilterProtocol(e.target.value)}
            className="bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white flex-1 min-w-[200px]"
          >
            <option value="">All Protocols</option>
            {protocols.map(protocol => (
              <option key={protocol} value={protocol}>
                {protocol}
              </option>
            ))}
          </select>

          <select
            value={filterChain}
            onChange={(e) => setFilterChain(e.target.value)}
            className="bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white"
          >
            <option value="">All Chains</option>
            <option value="ethereum">Ethereum</option>
            <option value="polygon">Polygon</option>
            <option value="arbitrum">Arbitrum</option>
            <option value="optimism">Optimism</option>
            <option value="base">Base</option>
          </select>

          {(filterProtocol || filterChain) && (
            <button
              onClick={() => { setFilterProtocol(""); setFilterChain(""); }}
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Positions List */}
      {filteredPositions.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
          <Droplet size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            No Yield Positions Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {positions.length === 0
              ? "Run a DeFi audit to import your yield farming positions"
              : "No positions match your current filters"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPositions.map((position) => (
            <div
              key={position.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-xl transition"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {position.protocol_name}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      position.is_active
                        ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    }`}>
                      {position.is_active ? "Active" : "Closed"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {position.position_type} • {position.chain}
                  </p>
                  {position.pool_name && (
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-1">
                      {position.pool_name}
                    </p>
                  )}
                </div>

                {position.current_apy && (
                  <div className="text-right">
                    <div className="text-sm text-gray-600 dark:text-gray-400">APY</div>
                    <div className="text-2xl font-bold text-green-600">
                      {position.current_apy.toFixed(2)}%
                    </div>
                  </div>
                )}
              </div>

              {/* Assets */}
              <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 mb-4">
                {position.token_a && position.token_b ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Token A</p>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {position.amount_a?.toLocaleString()} {position.token_a}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Token B</p>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {position.amount_b?.toLocaleString()} {position.token_b}
                      </p>
                    </div>
                  </div>
                ) : position.single_token ? (
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Staked</p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {position.single_amount?.toLocaleString()} {position.single_token}
                    </p>
                  </div>
                ) : null}
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <DollarSign size={14} />
                    <span>Deposited</span>
                  </div>
                  <p className="font-bold text-gray-900 dark:text-white">
                    ${position.deposit_value_usd?.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                  </p>
                </div>

                {position.is_active && position.current_value_usd && (
                  <div>
                    <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-1">
                      <TrendingUp size={14} />
                      <span>Current Value</span>
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white">
                      ${position.current_value_usd.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                    </p>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <Award size={14} />
                    <span>Total Rewards</span>
                  </div>
                  <p className="font-bold text-purple-600">
                    ${position.total_rewards_usd.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                  </p>
                </div>

                {position.is_active && (
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Unclaimed</div>
                    <p className="font-bold text-orange-600">
                      ${position.rewards_unclaimed_usd.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                    </p>
                  </div>
                )}
              </div>

              {/* Reward Tokens */}
              {position.reward_tokens && position.reward_tokens.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Reward Tokens</p>
                  <div className="flex flex-wrap gap-2">
                    {position.reward_tokens.map((token, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs font-semibold rounded-full"
                      >
                        {token}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Impermanent Loss Warning */}
              {position.impermanent_loss_pct && Math.abs(position.impermanent_loss_pct) > 5 && (
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} className="text-orange-600" />
                    <div>
                      <p className="text-xs font-semibold text-orange-900 dark:text-orange-200">
                        Impermanent Loss: {position.impermanent_loss_pct.toFixed(2)}%
                      </p>
                      <p className="text-xs text-orange-700 dark:text-orange-300">
                        ${Math.abs(position.impermanent_loss_usd || 0).toLocaleString(undefined, { minimumFractionDigits: 0 })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* P&L */}
              {position.total_gain_loss_usd !== null && position.total_gain_loss_usd !== undefined && (
                <div className="pt-4 border-t dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total P&L</span>
                    <div className="flex items-center gap-1">
                      {position.total_gain_loss_usd >= 0 ? (
                        <TrendingUp size={18} className="text-green-600" />
                      ) : (
                        <TrendingDown size={18} className="text-red-600" />
                      )}
                      <span className={`text-lg font-bold ${position.total_gain_loss_usd >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {position.total_gain_loss_usd >= 0 ? '+' : ''}${position.total_gain_loss_usd.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t dark:border-gray-700 text-xs text-gray-500 dark:text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>Opened: {new Date(position.opened_at).toLocaleDateString()}</span>
                </div>
                {position.closed_at && (
                  <div>
                    <span>Closed: {new Date(position.closed_at).toLocaleDateString()}</span>
                  </div>
                )}
                {position.holding_period_days && (
                  <div>
                    <span>({position.holding_period_days} days)</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Alert */}
      {stats && stats.total_impermanent_loss_usd < 0 && (
        <div className="mt-8 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 flex gap-3">
          <AlertTriangle size={20} className="text-orange-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-orange-900 dark:text-orange-200">
            <p className="font-bold mb-1">Impermanent Loss Detected</p>
            <p>
              Total impermanent loss across all positions: ${Math.abs(stats.total_impermanent_loss_usd).toLocaleString(undefined, { minimumFractionDigits: 0 })}.
              This occurs when the price ratio of your LP tokens changes compared to when you deposited them.
              Make sure to factor this into your tax calculations.
            </p>
          </div>
        </div>
      )}
      </div>
    </>
  );
}

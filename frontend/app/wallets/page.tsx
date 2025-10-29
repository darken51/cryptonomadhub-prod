"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { AppHeader } from "@/components/AppHeader";
import {
  Plus, Trash2, RefreshCw, ChevronDown, ChevronUp,
  TrendingUp, TrendingDown, Wallet, Copy, Check
} from "lucide-react";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";

interface UserWallet {
  id: number;
  wallet_address: string;
  chain: string;
  wallet_name: string | null;
  is_primary: boolean;
  is_active: boolean;
  created_at: string;
}

interface WalletPortfolio {
  id: number;
  name: string | null;
  address: string;
  chain: string;
  total_value_usd: number;
  total_cost_basis: number;
  total_unrealized_gain_loss: number;
  unrealized_gain_loss_percent: number;
  change_24h_usd: number | null;
  change_24h_percent: number | null;
  total_tokens: number;
  total_chains: number;
  last_updated: string | null;
}

interface TokenPosition {
  token: string;
  token_address: string | null;
  chain: string;
  amount: number;
  price_usd: number;
  value_usd: number;
  cost_basis: number;
  unrealized_gain_loss: number;
}

interface ConsolidatedPortfolio {
  total_value_usd: number;
  total_cost_basis: number;
  total_unrealized_gain_loss: number;
  unrealized_gain_loss_percent: number;
  change_24h_usd: number | null;
  change_24h_percent: number | null;
  total_wallets: number;
  total_tokens: number;
  total_chains: number;
  wallets: WalletPortfolio[];
}

interface ChainDetectionResult {
  blockchain_type: string;
  possible_chains: string[];
  suggested_chain: string | null;
  is_valid: boolean;
  error_message: string | null;
}

export default function WalletsPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  const [wallets, setWallets] = useState<UserWallet[]>([]);
  const [portfolio, setPortfolio] = useState<ConsolidatedPortfolio | null>(null);
  const [expandedWallets, setExpandedWallets] = useState<Set<number>>(new Set());
  const [walletPositions, setWalletPositions] = useState<Record<number, TokenPosition[]>>({});
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const [newWallet, setNewWallet] = useState({
    wallet_address: "",
    chain: "ethereum",
    wallet_name: "",
    is_primary: false
  });
  const [detectedChain, setDetectedChain] = useState<ChainDetectionResult | null>(null);
  const [detectingChain, setDetectingChain] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    } else if (user && token) {
      // Fetch in parallel for better performance
      Promise.all([fetchWallets(), fetchPortfolio()]);
    }
  }, [user, isLoading, token, router]);

  const fetchWallets = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wallets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setWallets(data);
    } catch (error) {
      console.error("Failed to fetch wallets:", error);
    }
  };

  const fetchPortfolio = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wallet-portfolio/overview`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch portfolio: ${res.status}`);
      }

      const data = await res.json();
      setPortfolio(data);
    } catch (error) {
      console.error("Failed to fetch portfolio:", error);
      // Initialize with empty data if error
      setPortfolio({
        total_value_usd: 0,
        total_cost_basis: 0,
        total_unrealized_gain_loss: 0,
        unrealized_gain_loss_percent: 0,
        change_24h_usd: null,
        change_24h_percent: null,
        total_wallets: 0,
        total_tokens: 0,
        total_chains: 0,
        wallets: []
      });
    } finally {
      setLoading(false);
    }
  };

  const syncAllWallets = async () => {
    setSyncing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wallet-portfolio/sync`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        // Wait a bit for sync to process
        setTimeout(() => {
          fetchPortfolio();
          setSyncing(false);
        }, 3000);
      } else {
        setSyncing(false);
      }
    } catch (error) {
      console.error("Failed to sync wallets:", error);
      setSyncing(false);
    }
  };

  const toggleWalletExpand = async (walletId: number) => {
    const newExpanded = new Set(expandedWallets);

    if (newExpanded.has(walletId)) {
      newExpanded.delete(walletId);
      setExpandedWallets(newExpanded);
    } else {
      newExpanded.add(walletId);
      setExpandedWallets(newExpanded);

      // Fetch positions if not already loaded
      if (!walletPositions[walletId]) {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/wallet-portfolio/${walletId}/portfolio`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (res.ok) {
            const data = await res.json();
            setWalletPositions({
              ...walletPositions,
              [walletId]: data.positions
            });
          }
        } catch (error) {
          console.error("Failed to fetch wallet positions:", error);
        }
      }
    }
  };

  const detectChainFromAddress = async (address: string) => {
    if (!address || address.length < 10) {
      setDetectedChain(null);
      return;
    }

    setDetectingChain(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/wallet-portfolio/detect-chain?address=${encodeURIComponent(address)}`
      );

      if (res.ok) {
        const data: ChainDetectionResult = await res.json();
        setDetectedChain(data);

        // Auto-select suggested chain
        if (data.suggested_chain && data.is_valid) {
          setNewWallet({ ...newWallet, wallet_address: address, chain: data.suggested_chain });
        }
      }
    } catch (error) {
      console.error("Failed to detect chain:", error);
    } finally {
      setDetectingChain(false);
    }
  };

  const addWallet = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wallets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newWallet)
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewWallet({
          wallet_address: "",
          chain: "ethereum",
          wallet_name: "",
          is_primary: false
        });
        setDetectedChain(null);
        fetchWallets();
        fetchPortfolio();
      }
    } catch (error) {
      console.error("Failed to add wallet:", error);
    }
  };

  const deleteWallet = async (id: number) => {
    if (!confirm("Delete this wallet?")) return;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wallets/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchWallets();
      fetchPortfolio();
    } catch (error) {
      console.error("Failed to delete wallet:", error);
    }
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Wallet Portfolio</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Track your crypto wallets with real-time values and 24h changes
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={syncAllWallets}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 border dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
            >
              <RefreshCw size={20} className={syncing ? "animate-spin" : ""} />
              {syncing ? "Syncing..." : "Sync"}
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={20} />
              Add Wallet
            </button>
          </div>
        </div>

        {/* Portfolio Overview */}
        {portfolio && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Total Value */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Value</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                <CurrencyDisplay amountUsd={portfolio.total_value_usd} mode="dual" />
              </div>
              {portfolio.change_24h_usd !== null && (
                <div className={`flex items-center gap-1 text-sm ${portfolio.change_24h_usd >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {portfolio.change_24h_usd >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  <span>
                    {portfolio.change_24h_usd >= 0 ? "+" : ""}
                    ${Math.abs(portfolio.change_24h_usd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    {portfolio.change_24h_percent !== null && ` (${portfolio.change_24h_percent >= 0 ? "+" : ""}${portfolio.change_24h_percent.toFixed(2)}%)`}
                  </span>
                  <span className="text-gray-500">24h</span>
                </div>
              )}
            </div>

            {/* Unrealized P&L */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Unrealized P&L</div>
              <div className={`text-2xl font-bold mb-1 ${portfolio.total_unrealized_gain_loss >= 0 ? "text-green-600" : "text-red-600"}`}>
                {portfolio.total_unrealized_gain_loss >= 0 ? "+" : ""}
                <CurrencyDisplay amountUsd={portfolio.total_unrealized_gain_loss} mode="dual" />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {portfolio.unrealized_gain_loss_percent >= 0 ? "+" : ""}
                {portfolio.unrealized_gain_loss_percent.toFixed(2)}% gain
              </div>
            </div>

            {/* Total Wallets */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                <Wallet size={20} />
                <span className="text-sm">Total Wallets</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {portfolio.total_wallets}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {portfolio.total_tokens} tokens · {portfolio.total_chains} chains
              </div>
            </div>

            {/* Cost Basis */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Cost Basis</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                <CurrencyDisplay amountUsd={portfolio.total_cost_basis} mode="dual" />
              </div>
            </div>
          </div>
        )}

        {/* Wallets List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="px-6 py-4 border-b dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Wallets</h2>
          </div>

          {!portfolio || portfolio.wallets.length === 0 ? (
            <div className="p-12 text-center">
              <Wallet size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">No wallets added yet</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Add Your First Wallet
              </button>
            </div>
          ) : (
            <div className="divide-y dark:divide-gray-700">
              {portfolio.wallets.map((wallet) => {
                const isExpanded = expandedWallets.has(wallet.id);
                const positions = walletPositions[wallet.id] || [];

                return (
                  <div key={wallet.id} className="transition">
                    {/* Wallet Header */}
                    <div className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-750">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <button
                              onClick={() => copyAddress(wallet.address)}
                              className="font-mono text-sm text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2"
                              title="Click to copy"
                            >
                              {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                              {copiedAddress === wallet.address ? (
                                <Check size={14} className="text-green-600" />
                              ) : (
                                <Copy size={14} />
                              )}
                            </button>
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full capitalize">
                              {wallet.chain}
                            </span>
                          </div>
                          {wallet.name && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{wallet.name}</p>
                          )}

                          {/* Wallet Stats */}
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Value: </span>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                <CurrencyDisplay amountUsd={wallet.total_value_usd} mode="dual" />
                              </span>
                            </div>
                            {wallet.change_24h_usd !== null && (
                              <div className={wallet.change_24h_usd >= 0 ? "text-green-600" : "text-red-600"}>
                                24h: {wallet.change_24h_usd >= 0 ? "+" : ""}
                                ${Math.abs(wallet.change_24h_usd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                {wallet.change_24h_percent !== null && ` (${wallet.change_24h_percent >= 0 ? "+" : ""}${wallet.change_24h_percent.toFixed(2)}%)`}
                              </div>
                            )}
                            <div className={wallet.total_unrealized_gain_loss >= 0 ? "text-green-600" : "text-red-600"}>
                              P&L: {wallet.total_unrealized_gain_loss >= 0 ? "+" : ""}
                              <CurrencyDisplay amountUsd={wallet.total_unrealized_gain_loss} mode="dual" />
                            </div>
                            <div className="text-gray-600 dark:text-gray-400">
                              {wallet.total_tokens} tokens
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => toggleWalletExpand(wallet.id)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                          title={isExpanded ? "Collapse" : "Expand positions"}
                        >
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                      </div>
                    </div>

                    {/* Wallet Positions (Expanded) */}
                    {isExpanded && positions.length > 0 && (
                      <div className="px-6 pb-4 bg-gray-50 dark:bg-gray-750">
                        <div className="space-y-2">
                          {positions.map((position, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-gray-900 dark:text-white">
                                    {position.token}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                    {position.chain}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {position.amount.toLocaleString(undefined, { maximumFractionDigits: 6 })} @ ${position.price_usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-gray-900 dark:text-white">
                                  <CurrencyDisplay amountUsd={position.value_usd} mode="dual" />
                                </div>
                                <div className={`text-sm ${position.unrealized_gain_loss >= 0 ? "text-green-600" : "text-red-600"}`}>
                                  {position.unrealized_gain_loss >= 0 ? "+" : ""}
                                  ${Math.abs(position.unrealized_gain_loss).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add Wallet Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add New Wallet</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Wallet Address *
                  </label>
                  <input
                    type="text"
                    value={newWallet.wallet_address}
                    onChange={(e) => {
                      const address = e.target.value;
                      setNewWallet({ ...newWallet, wallet_address: address });
                      detectChainFromAddress(address);
                    }}
                    placeholder="0x... or bc1... or base58..."
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                  {detectingChain && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      Detecting blockchain...
                    </div>
                  )}
                  {detectedChain && (
                    <div className="mt-2">
                      {detectedChain.is_valid ? (
                        <div className="space-y-2">
                          {detectedChain.blockchain_type === 'evm' && (
                            <div className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-900/30 dark:to-fuchsia-900/30 text-violet-700 dark:text-fuchsia-300 rounded-lg text-sm font-semibold border border-violet-200 dark:border-violet-800">
                              <Check size={16} />
                              <span>✓ EVM address detected - {detectedChain.possible_chains.length} compatible chains</span>
                            </div>
                          )}
                          {detectedChain.blockchain_type === 'solana' && (
                            <div className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-pink-300 rounded-lg text-sm font-semibold border border-purple-200 dark:border-purple-800">
                              <Check size={16} />
                              <span>✓ Solana address detected - blockchain auto-selected</span>
                            </div>
                          )}
                          {detectedChain.blockchain_type === 'bitcoin' && (
                            <div className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 text-orange-700 dark:text-amber-300 rounded-lg text-sm font-semibold border border-orange-200 dark:border-orange-800">
                              <Check size={16} />
                              <span>✓ Bitcoin address detected</span>
                            </div>
                          )}
                          {detectedChain.blockchain_type === 'unknown' && (
                            <div className="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-semibold border border-gray-200 dark:border-gray-700">
                              <span>⚠️ Unknown address format</span>
                            </div>
                          )}
                          {detectedChain.suggested_chain && (
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              Suggested: <span className="font-semibold text-blue-600 dark:text-blue-400">{detectedChain.suggested_chain}</span> (auto-selected below)
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm font-semibold border border-red-200 dark:border-red-800">
                          <span>❌ {detectedChain.error_message || "Invalid address format"}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Blockchain *
                  </label>
                  <select
                    value={newWallet.chain}
                    onChange={(e) => setNewWallet({ ...newWallet, chain: e.target.value })}
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <optgroup label="EVM Chains">
                      <option value="ethereum">Ethereum</option>
                      <option value="polygon">Polygon</option>
                      <option value="bsc">BNB Chain (BSC)</option>
                      <option value="arbitrum">Arbitrum</option>
                      <option value="optimism">Optimism</option>
                      <option value="base">Base</option>
                      <option value="avalanche">Avalanche C-Chain</option>
                      <option value="fantom">Fantom</option>
                      <option value="cronos">Cronos</option>
                      <option value="gnosis">Gnosis</option>
                      <option value="celo">Celo</option>
                      <option value="moonbeam">Moonbeam</option>
                      <option value="moonriver">Moonriver</option>
                      <option value="aurora">Aurora</option>
                    </optgroup>
                    <optgroup label="Other Chains">
                      <option value="solana">Solana</option>
                      <option value="bitcoin">Bitcoin</option>
                    </optgroup>
                  </select>
                  {detectedChain && detectedChain.possible_chains.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Compatible chains ({detectedChain.possible_chains.length}):
                      </div>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                        {detectedChain.possible_chains.slice(0, 10).map((chain) => (
                          <span
                            key={chain}
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              chain === newWallet.chain
                                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600'
                            }`}
                          >
                            {chain}
                          </span>
                        ))}
                        {detectedChain.possible_chains.length > 10 && (
                          <span className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                            +{detectedChain.possible_chains.length - 10} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Wallet Name (optional)
                  </label>
                  <input
                    type="text"
                    value={newWallet.wallet_name}
                    onChange={(e) => setNewWallet({ ...newWallet, wallet_name: e.target.value })}
                    placeholder="My Hardware Wallet"
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_primary"
                    checked={newWallet.is_primary}
                    onChange={(e) => setNewWallet({ ...newWallet, is_primary: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="is_primary" className="text-sm text-gray-700 dark:text-gray-300">
                    Set as primary wallet for this chain
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setDetectedChain(null);
                  }}
                  className="flex-1 px-4 py-2 border dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={addWallet}
                  disabled={!newWallet.wallet_address || !newWallet.chain || (detectedChain ? !detectedChain.is_valid : false)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Wallet
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

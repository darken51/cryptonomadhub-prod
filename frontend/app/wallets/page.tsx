"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { AppHeader } from "@/components/AppHeader";
import { Plus, Trash2, Check, AlertCircle, Wallet } from "lucide-react";

interface UserWallet {
  id: number;
  wallet_address: string;
  chain: string;
  wallet_name: string | null;
  is_primary: boolean;
  is_active: boolean;
  total_transactions: number;
  created_at: string;
}

interface ConsolidatedPortfolio {
  total_wallets: number;
  total_value_usd: number;
  total_cost_basis: number;
  total_unrealized_gain_loss: number;
  wallets: Array<{
    address: string;
    chain: string;
    name: string | null;
    is_primary: boolean;
  }>;
  by_chain: Record<string, {
    value_usd: number;
    cost_basis: number;
    gain_loss: number;
    lots_count: number;
  }>;
}

export default function WalletsPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [wallets, setWallets] = useState<UserWallet[]>([]);
  const [portfolio, setPortfolio] = useState<ConsolidatedPortfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWallet, setNewWallet] = useState({
    wallet_address: "",
    chain: "ethereum",
    wallet_name: "",
    is_primary: false
  });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    } else if (user && token) {
      fetchWallets();
      fetchPortfolio();
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wallets/consolidated-portfolio`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setPortfolio(data);
    } catch (error) {
      console.error("Failed to fetch portfolio:", error);
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Multi-Wallet Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage multiple wallets with consolidated portfolio tracking
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          Add Wallet
        </button>
      </div>

      {/* Consolidated Portfolio Summary */}
      {portfolio && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
              <Wallet size={20} />
              <span className="text-sm">Total Wallets</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {portfolio.total_wallets || 0}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Value</div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              ${(portfolio.total_value_usd || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Cost Basis</div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              ${(portfolio.total_cost_basis || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Unrealized P&L</div>
            <p className={`text-3xl font-bold ${(portfolio.total_unrealized_gain_loss || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {(portfolio.total_unrealized_gain_loss || 0) >= 0 ? '+' : ''}${(portfolio.total_unrealized_gain_loss || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      )}

      {/* By Chain Breakdown */}
      {portfolio && portfolio.by_chain && Object.keys(portfolio.by_chain).length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Portfolio by Chain</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(portfolio.by_chain).map(([chain, data]) => (
              <div key={chain} className="border dark:border-gray-700 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900 dark:text-white capitalize">{chain}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{data.lots_count} lots</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Value:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ${data.value_usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">P&L:</span>
                    <span className={`font-medium ${data.gain_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {data.gain_loss >= 0 ? '+' : ''}${data.gain_loss.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wallets List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="px-6 py-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Wallets</h2>
        </div>

        {wallets.length === 0 ? (
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
            {wallets.map((wallet) => (
              <div key={wallet.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-sm text-gray-900 dark:text-white">
                        {wallet.wallet_address.slice(0, 6)}...{wallet.wallet_address.slice(-4)}
                      </span>
                      {wallet.is_primary && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                          <Check size={12} />
                          Primary
                        </span>
                      )}
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full capitalize">
                        {wallet.chain}
                      </span>
                    </div>
                    {wallet.wallet_name && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{wallet.wallet_name}</p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Added {new Date(wallet.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteWallet(wallet.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                    title="Delete wallet"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
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
                  onChange={(e) => setNewWallet({ ...newWallet, wallet_address: e.target.value })}
                  placeholder="0x..."
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
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
                  <option value="ethereum">Ethereum</option>
                  <option value="polygon">Polygon</option>
                  <option value="bsc">BNB Chain</option>
                  <option value="arbitrum">Arbitrum</option>
                  <option value="optimism">Optimism</option>
                  <option value="avalanche">Avalanche</option>
                  <option value="base">Base</option>
                  <option value="fantom">Fantom</option>
                </select>
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
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={addWallet}
                disabled={!newWallet.wallet_address || !newWallet.chain}
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

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { AppHeader } from "@/components/AppHeader";
import { Image as ImageIcon, TrendingUp, TrendingDown, Filter, Download, Grid, List } from "lucide-react";

interface NFTTransaction {
  id: number;
  user_id: number;
  audit_id?: number;
  contract_address: string;
  token_id: string;
  collection_name?: string;
  token_standard: "ERC-721" | "ERC-1155";
  transaction_type: "mint" | "purchase" | "sale" | "transfer";
  marketplace?: string;
  from_address?: string;
  to_address?: string;
  quantity: number;
  price_eth?: number;
  price_usd?: number;
  gas_fee_eth?: number;
  gas_fee_usd?: number;
  cost_basis_usd?: number;
  gain_loss_usd?: number;
  transaction_date: string;
  tx_hash: string;
  chain: string;
  metadata_uri?: string;
  image_url?: string;
  holding_period_days?: number;
  term_type?: "short" | "long";
  created_at: string;
}

interface NFTStats {
  total_nfts: number;
  total_collections: number;
  total_cost_basis: number;
  total_realized_gain_loss: number;
  minted_count: number;
  purchased_count: number;
  sold_count: number;
}

export default function NFTPortfolioPage() {
  const { user, token, isLoading } = useAuth();
  const [nfts, setNfts] = useState<NFTTransaction[]>([]);
  const [stats, setStats] = useState<NFTStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterType, setFilterType] = useState<string>("");
  const [filterCollection, setFilterCollection] = useState<string>("");
  const [filterChain, setFilterChain] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    } else if (user && token) {
      fetchNFTs();
    }
  }, [user, isLoading, token, router]);

  const fetchNFTs = async () => {
    try {
      // Note: This endpoint needs to be created in the backend
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/nft/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setNfts(data);
        calculateStats(data);
      } else if (res.status === 401) {
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Failed to fetch NFTs:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (nftData: NFTTransaction[]) => {
    const stats: NFTStats = {
      total_nfts: nftData.length,
      total_collections: new Set(nftData.map(nft => nft.collection_name || nft.contract_address)).size,
      total_cost_basis: nftData
        .filter(nft => ["mint", "purchase"].includes(nft.transaction_type))
        .reduce((sum, nft) => sum + (nft.cost_basis_usd || 0), 0),
      total_realized_gain_loss: nftData
        .filter(nft => nft.transaction_type === "sale")
        .reduce((sum, nft) => sum + (nft.gain_loss_usd || 0), 0),
      minted_count: nftData.filter(nft => nft.transaction_type === "mint").length,
      purchased_count: nftData.filter(nft => nft.transaction_type === "purchase").length,
      sold_count: nftData.filter(nft => nft.transaction_type === "sale").length,
    };
    setStats(stats);
  };

  const filteredNfts = nfts.filter(nft => {
    if (filterType && nft.transaction_type !== filterType) return false;
    if (filterCollection && nft.collection_name !== filterCollection) return false;
    if (filterChain && nft.chain !== filterChain) return false;
    return true;
  });

  const collections = Array.from(new Set(nfts.map(nft => nft.collection_name || nft.contract_address)));

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            NFT Portfolio
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your NFT purchases, sales, and capital gains
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          <Download size={20} />
          Export Tax Report
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total NFTs</div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total_nfts}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Collections</div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total_collections}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Cost Basis</div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              ${stats.total_cost_basis.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Realized P&L</div>
            <p className={`text-3xl font-bold ${stats.total_realized_gain_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.total_realized_gain_loss >= 0 ? '+' : ''}${stats.total_realized_gain_loss.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Minted</div>
            <p className="text-3xl font-bold text-purple-600">{stats.minted_count}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Sold</div>
            <p className="text-3xl font-bold text-blue-600">{stats.sold_count}</p>
          </div>
        </div>
      )}

      {/* Filters & View Toggle */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 mb-8">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-blue-600" />
            <span className="text-gray-700 dark:text-gray-300 font-semibold">Filters:</span>
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white"
          >
            <option value="">All Types</option>
            <option value="mint">Mint</option>
            <option value="purchase">Purchase</option>
            <option value="sale">Sale</option>
            <option value="transfer">Transfer</option>
          </select>

          <select
            value={filterCollection}
            onChange={(e) => setFilterCollection(e.target.value)}
            className="bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white flex-1 min-w-[200px]"
          >
            <option value="">All Collections</option>
            {collections.map(collection => (
              <option key={collection} value={collection}>
                {collection}
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
            <option value="base">Base</option>
          </select>

          {(filterType || filterCollection || filterChain) && (
            <button
              onClick={() => { setFilterType(""); setFilterCollection(""); setFilterChain(""); }}
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
            >
              Clear
            </button>
          )}

          <div className="ml-auto flex gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition ${viewMode === "grid" ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition ${viewMode === "list" ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* NFTs Display */}
      {filteredNfts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
          <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            No NFTs Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {nfts.length === 0
              ? "Run a DeFi audit to import your NFT transactions"
              : "No NFTs match your current filters"}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredNfts.map((nft) => (
            <div
              key={nft.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition"
            >
              {/* NFT Image */}
              <div className="aspect-square bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 flex items-center justify-center">
                {nft.image_url ? (
                  <img src={nft.image_url} alt={`${nft.collection_name} #${nft.token_id}`} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={48} className="text-gray-400" />
                )}
              </div>

              {/* NFT Details */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white truncate">
                      {nft.collection_name || `Token #${nft.token_id}`}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">#{nft.token_id}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    nft.transaction_type === "sale"
                      ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                      : nft.transaction_type === "purchase"
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                      : nft.transaction_type === "mint"
                      ? "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  }`}>
                    {nft.transaction_type}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Chain:</span>
                    <span className="font-semibold text-gray-900 dark:text-white capitalize">{nft.chain}</span>
                  </div>

                  {nft.marketplace && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Marketplace:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{nft.marketplace}</span>
                    </div>
                  )}

                  {nft.price_usd && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Price:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        ${nft.price_usd.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                      </span>
                    </div>
                  )}

                  {nft.gain_loss_usd !== null && nft.gain_loss_usd !== undefined && (
                    <div className="flex justify-between items-center pt-2 border-t dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">P&L:</span>
                      <div className="flex items-center gap-1">
                        {nft.gain_loss_usd >= 0 ? (
                          <TrendingUp size={16} className="text-green-600" />
                        ) : (
                          <TrendingDown size={16} className="text-red-600" />
                        )}
                        <span className={`font-bold ${nft.gain_loss_usd >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {nft.gain_loss_usd >= 0 ? '+' : ''}${nft.gain_loss_usd.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 pt-2">
                    <span>{new Date(nft.transaction_date).toLocaleDateString()}</span>
                    {nft.term_type && (
                      <span className="font-semibold uppercase">{nft.term_type}-term</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Collection / Token</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Chain</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">Price (USD)</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">P&L</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Marketplace</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {filteredNfts.map((nft) => (
                  <tr key={nft.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {nft.collection_name || `Token #${nft.token_id}`}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">#{nft.token_id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                        nft.transaction_type === "sale"
                          ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                          : nft.transaction_type === "purchase"
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                          : nft.transaction_type === "mint"
                          ? "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      }`}>
                        {nft.transaction_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white capitalize">{nft.chain}</td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-white">
                      {nft.price_usd ? `$${nft.price_usd.toLocaleString(undefined, { minimumFractionDigits: 0 })}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {nft.gain_loss_usd !== null && nft.gain_loss_usd !== undefined ? (
                        <span className={`font-bold ${nft.gain_loss_usd >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {nft.gain_loss_usd >= 0 ? '+' : ''}${nft.gain_loss_usd.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(nft.transaction_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {nft.marketplace || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>
    </>
  );
}

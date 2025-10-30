"use client";

// Force dynamic rendering for authenticated pages
export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { AppHeader } from "@/components/AppHeader";
import { Save, X, AlertCircle, CheckCircle, Edit2, Calendar, DollarSign } from "lucide-react";

interface UnverifiedLot {
  id: number;
  token: string;
  chain: string;
  acquisition_date: string;
  acquisition_method: string;
  acquisition_price_usd: number;
  original_amount: number;
  remaining_amount: number;
  manually_added: boolean;
  verified: boolean;
  notes?: string;
  tx_hash?: string;
}

export default function CostBasisReviewPage() {
  const { user, token, isLoading } = useAuth();
  const [lots, setLots] = useState<UnverifiedLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    acquisition_price_usd: "",
    acquisition_date: "",
    notes: ""
  });
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    } else if (user && token) {
      fetchUnverifiedLots();
    }
  }, [user, isLoading, token, router]);

  const fetchUnverifiedLots = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cost-basis/lots/unverified`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setLots(data);
      } else if (res.status === 401) {
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Failed to fetch unverified lots:", error);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (lot: UnverifiedLot) => {
    setEditingId(lot.id);
    setEditForm({
      acquisition_price_usd: lot.acquisition_price_usd.toString(),
      acquisition_date: lot.acquisition_date.split("T")[0],
      notes: lot.notes || ""
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({ acquisition_price_usd: "", acquisition_date: "", notes: "" });
  };

  const saveLot = async (lotId: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cost-basis/lots/${lotId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          acquisition_price_usd: parseFloat(editForm.acquisition_price_usd),
          acquisition_date: editForm.acquisition_date,
          notes: editForm.notes,
          verified: true
        })
      });

      if (res.ok) {
        setEditingId(null);
        fetchUnverifiedLots();
      } else {
        alert("Failed to save changes");
      }
    } catch (error) {
      console.error("Failed to save lot:", error);
      alert("Failed to save changes");
    }
  };

  const markAsVerified = async (lotId: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cost-basis/lots/${lotId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ verified: true })
      });

      if (res.ok) {
        fetchUnverifiedLots();
      }
    } catch (error) {
      console.error("Failed to verify lot:", error);
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Cost Basis Review
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Review and verify unverified cost basis lots from automatic imports
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
            <AlertCircle size={20} />
            <span className="text-sm">Unverified Lots</span>
          </div>
          <p className="text-3xl font-bold text-orange-600">{lots.length}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Value</div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            ${lots.reduce((sum, lot) => sum + (lot.remaining_amount * lot.acquisition_price_usd), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Unique Tokens</div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {new Set(lots.map(l => l.token)).size}
          </p>
        </div>
      </div>

      {/* Lots List */}
      {lots.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
          <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            All Caught Up!
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            All cost basis lots have been reviewed and verified
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Unverified Lots
            </h2>
          </div>

          <div className="divide-y dark:divide-gray-700">
            {lots.map((lot) => (
              <div key={lot.id} className="p-6">
                {editingId === lot.id ? (
                  /* Edit Mode */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {lot.token}
                        </span>
                        <span className="ml-3 text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {lot.chain}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {lot.remaining_amount.toLocaleString()} {lot.token}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <DollarSign size={16} className="inline mr-1" />
                          Acquisition Price (USD)
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={editForm.acquisition_price_usd}
                          onChange={(e) => setEditForm({ ...editForm, acquisition_price_usd: e.target.value })}
                          className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <Calendar size={16} className="inline mr-1" />
                          Acquisition Date
                        </label>
                        <input
                          type="date"
                          value={editForm.acquisition_date}
                          onChange={(e) => setEditForm({ ...editForm, acquisition_date: e.target.value })}
                          className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Notes
                      </label>
                      <textarea
                        value={editForm.notes}
                        onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                        className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white h-20 resize-none"
                        placeholder="Add verification notes..."
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => saveLot(lot.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        <Save size={18} />
                        Save & Verify
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                      >
                        <X size={18} />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            {lot.token}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full capitalize">
                            {lot.chain}
                          </span>
                          <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-xs rounded-full capitalize">
                            {lot.acquisition_method}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">Amount</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {lot.remaining_amount.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">Price (USD)</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              ${lot.acquisition_price_usd.toLocaleString(undefined, { minimumFractionDigits: 4 })}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">Total Value</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              ${(lot.remaining_amount * lot.acquisition_price_usd).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">Date</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {new Date(lot.acquisition_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {lot.tx_hash && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-3 font-mono">
                            TX: {lot.tx_hash.slice(0, 10)}...{lot.tx_hash.slice(-8)}
                          </p>
                        )}

                        {lot.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                            {lot.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => startEditing(lot)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                          title="Edit lot"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => markAsVerified(lot.id)}
                          className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition"
                          title="Mark as verified"
                        >
                          <CheckCircle size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Alert */}
      {lots.length > 0 && (
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex gap-3">
          <AlertCircle size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900 dark:text-blue-200">
            <p className="font-bold mb-1">Review Required</p>
            <p>
              These lots were automatically imported or detected from blockchain transactions.
              Please verify the acquisition price and date are correct before using them for tax calculations.
            </p>
          </div>
        </div>
      )}
      </div>
    </>
  );
}

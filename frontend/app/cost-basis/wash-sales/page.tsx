"use client";

// Force dynamic rendering for authenticated pages
export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { AppHeader } from "@/components/AppHeader";
import { AlertTriangle, AlertCircle, Info, TrendingDown, Calendar, DollarSign, Filter } from "lucide-react";

interface WashSaleWarning {
  id: number;
  token: string;
  chain: string;
  sale_date: string;
  sale_amount: number;
  loss_amount_usd: number;
  repurchase_date: string;
  repurchase_amount: number;
  days_between: number;
  severity: "HIGH" | "MEDIUM" | "INFO";
  message: string;
  sale_tx_hash?: string;
  repurchase_tx_hash?: string;
}

export default function WashSalesPage() {
  const { user, token, isLoading } = useAuth();
  const [warnings, setWarnings] = useState<WashSaleWarning[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<string>("");
  const [filterToken, setFilterToken] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    } else if (user && token) {
      fetchWashSaleWarnings();
    }
  }, [user, isLoading, token, router]);

  const fetchWashSaleWarnings = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cost-basis/wash-sale-warnings`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setWarnings(data);
      } else if (res.status === 401) {
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Failed to fetch wash sale warnings:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "HIGH":
        return <AlertTriangle size={20} className="text-red-600" />;
      case "MEDIUM":
        return <AlertCircle size={20} className="text-orange-600" />;
      case "INFO":
        return <Info size={20} className="text-blue-600" />;
      default:
        return <Info size={20} className="text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "HIGH":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200";
      case "MEDIUM":
        return "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-900 dark:text-orange-200";
      case "INFO":
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-200";
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case "HIGH":
        return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
      case "MEDIUM":
        return "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200";
      case "INFO":
        return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
      default:
        return "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200";
    }
  };

  const filteredWarnings = warnings.filter(warning => {
    if (filterSeverity && warning.severity !== filterSeverity) return false;
    if (filterToken && !warning.token.toLowerCase().includes(filterToken.toLowerCase())) return false;
    return true;
  });

  const highSeverityCount = warnings.filter(w => w.severity === "HIGH").length;
  const mediumSeverityCount = warnings.filter(w => w.severity === "MEDIUM").length;
  const totalLossAmount = warnings.reduce((sum, w) => sum + w.loss_amount_usd, 0);

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
          Wash Sale Warnings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Review potential wash sales under the IRS 30-day rule
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
            <AlertTriangle size={20} />
            <span className="text-sm">Total Warnings</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{warnings.length}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <AlertTriangle size={20} />
            <span className="text-sm">High Severity</span>
          </div>
          <p className="text-3xl font-bold text-red-600">{highSeverityCount}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-2 text-orange-600 mb-2">
            <AlertCircle size={20} />
            <span className="text-sm">Medium Severity</span>
          </div>
          <p className="text-3xl font-bold text-orange-600">{mediumSeverityCount}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Loss Amount</div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            ${totalLossAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 mb-8">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-blue-600" />
            <span className="text-gray-700 dark:text-gray-300 font-semibold">Filters:</span>
          </div>

          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white"
          >
            <option value="">All Severities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="INFO">Info</option>
          </select>

          <input
            type="text"
            placeholder="Token symbol..."
            value={filterToken}
            onChange={(e) => setFilterToken(e.target.value)}
            className="bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white flex-1 min-w-[200px]"
          />

          {(filterSeverity || filterToken) && (
            <button
              onClick={() => { setFilterSeverity(""); setFilterToken(""); }}
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Warnings List */}
      {filteredWarnings.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
          <Info size={48} className="mx-auto text-green-500 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            No Wash Sale Warnings
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {warnings.length === 0
              ? "No potential wash sales detected in your transactions"
              : "No warnings match your current filters"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredWarnings.map((warning) => (
            <div
              key={warning.id}
              className={`rounded-lg border p-6 ${getSeverityColor(warning.severity)}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getSeverityIcon(warning.severity)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">{warning.token}</span>
                      <span className="text-sm opacity-75 capitalize">({warning.chain})</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSeverityBadgeColor(warning.severity)}`}>
                        {warning.severity}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-75">Days Between</p>
                  <p className="text-2xl font-bold">{warning.days_between}</p>
                </div>
              </div>

              <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium">{warning.message}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sale Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold opacity-75">
                    <TrendingDown size={16} />
                    <span>Sale Transaction</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="opacity-75">Date:</span>
                      <span className="font-semibold">
                        {new Date(warning.sale_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="opacity-75">Amount:</span>
                      <span className="font-semibold">
                        {warning.sale_amount.toLocaleString()} {warning.token}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="opacity-75">Loss:</span>
                      <span className="font-semibold text-red-600 dark:text-red-400">
                        -${warning.loss_amount_usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    {warning.sale_tx_hash && (
                      <p className="text-xs font-mono opacity-60 truncate">
                        {warning.sale_tx_hash}
                      </p>
                    )}
                  </div>
                </div>

                {/* Repurchase Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold opacity-75">
                    <Calendar size={16} />
                    <span>Repurchase Transaction</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="opacity-75">Date:</span>
                      <span className="font-semibold">
                        {new Date(warning.repurchase_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="opacity-75">Amount:</span>
                      <span className="font-semibold">
                        {warning.repurchase_amount.toLocaleString()} {warning.token}
                      </span>
                    </div>
                    {warning.repurchase_tx_hash && (
                      <p className="text-xs font-mono opacity-60 truncate mt-3">
                        {warning.repurchase_tx_hash}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Alert */}
      {warnings.length > 0 && (
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex gap-3">
          <Info size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900 dark:text-blue-200">
            <p className="font-bold mb-1">IRS Wash Sale Rule (30-Day Window)</p>
            <p className="mb-2">
              A wash sale occurs when you sell a security at a loss and repurchase the same or substantially
              identical security within 30 days before or after the sale. The loss may be disallowed for tax purposes.
            </p>
            <p className="font-semibold">
              Severity Levels:
            </p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li><span className="font-semibold text-red-600">HIGH:</span> Within 7 days - Strong wash sale indicator</li>
              <li><span className="font-semibold text-orange-600">MEDIUM:</span> 8-20 days - Potential wash sale</li>
              <li><span className="font-semibold text-blue-600">INFO:</span> 21-30 days - Monitor closely</li>
            </ul>
          </div>
        </div>
      )}
      </div>
    </>
  );
}

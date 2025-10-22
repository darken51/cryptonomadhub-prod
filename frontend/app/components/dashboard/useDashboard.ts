"use client";

import { useState, useEffect } from "react";
import { DashboardOverview } from "./types";

interface UseDashboardResult {
  data: DashboardOverview | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

interface UseDashboardOptions {
  token: string | null;
  enabled?: boolean;
}

/**
 * Custom hook for fetching dashboard data
 *
 * Fetches data from /dashboard/overview endpoint and provides:
 * - data: The dashboard overview
 * - loading: Loading state
 * - error: Error message if any
 * - refresh: Function to manually refresh data
 */
export function useDashboard({ token, enabled = true }: UseDashboardOptions): UseDashboardResult {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    if (!enabled || !token) {
      console.log("[useDashboard] Skipping fetch - enabled:", enabled, "token:", !!token);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const apiUrl = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : 'http://backend:8000';
      console.log("[useDashboard] Fetching from:", `${apiUrl}/dashboard/overview`);

      const response = await fetch(`${apiUrl}/dashboard/overview`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      console.log("[useDashboard] Response status:", response.status);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Session expired. Please log in again.");
        }
        const errorText = await response.text();
        console.error("[useDashboard] Error response:", errorText);
        throw new Error(`Failed to load dashboard: ${response.statusText}`);
      }

      const dashboardData = await response.json();
      console.log("[useDashboard] Data received:", dashboardData);
      setData(dashboardData);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
      console.error("[useDashboard] Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [token, enabled]);

  return {
    data,
    loading,
    error,
    refresh: fetchDashboard
  };
}

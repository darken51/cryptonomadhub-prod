/**
 * Dashboard TypeScript Types
 *
 * Type definitions for dashboard data structures.
 * These match the backend Pydantic schemas.
 */

export type AlertType = "critical" | "warning" | "info" | "success";
export type AlertCategory = "tax" | "compliance" | "portfolio" | "opportunity" | "system";
export type ActivityType = "chat" | "defi_audit" | "simulation" | "cost_basis" | "tax_opportunity" | "settings";
export type DashboardTab = "overview" | "tax-planning" | "portfolio" | "alerts";

export interface DashboardAlert {
  id: string;
  type: AlertType;
  category: AlertCategory;
  title: string;
  message: string;
  action_label?: string;
  action_url?: string;
  dismissible: boolean;
  created_at?: string;
}

export interface DashboardActivity {
  id: number;
  activity_type: ActivityType;
  activity_id?: string;
  title: string;
  subtitle?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface DashboardStats {
  total_simulations: number;
  active_simulations: number;
  total_audits: number;
  last_audit_date?: string;
  total_portfolio_value: number;
  portfolio_cost_basis: number;
  unrealized_gains: number;
  unrealized_gains_percentage: number;
  potential_tax_savings: number;
  tax_loss_harvesting_opportunities: number;
  unverified_lots_count: number;
  wash_sale_warnings_count: number;
  tax_jurisdiction?: string;
  has_wallets: boolean;
  onboarding_complete: boolean;
}

export interface TokenHolding {
  token: string;
  chain: string;
  amount: number;
  value_usd: number;
  cost_basis: number;
  unrealized_gain_loss: number;
  percentage_of_portfolio: number;
}

export interface PortfolioSummary {
  total_value_usd: number;
  total_cost_basis: number;
  total_unrealized_gains: number;
  unrealized_gains_percentage: number;
  top_holdings: TokenHolding[];
  chains_count: number;
  tokens_count: number;
  last_updated?: string;
}

export interface TaxOpportunity {
  id: number;
  opportunity_type: string;
  title: string;
  description: string;
  potential_savings: number;
  status: string;
  token: string;
  chain: string;
  amount: number;
  current_gain_loss: number;
  recommended_action: string;
  deadline?: string;
  created_at: string;
}

export interface DashboardOverview {
  stats: DashboardStats;
  alerts: DashboardAlert[];
  activities: DashboardActivity[];
  tax_opportunities: TaxOpportunity[];
  portfolio?: PortfolioSummary;
}

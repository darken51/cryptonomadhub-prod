"use client";

import { motion } from "framer-motion";
import { LayoutDashboard, TrendingUp, Wallet, Bell } from "lucide-react";

export type DashboardTab = "overview" | "tax-planning" | "portfolio" | "alerts";

interface Tab {
  id: DashboardTab;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

interface TabNavigationProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  alertCount?: number;
}

export function TabNavigation({ activeTab, onTabChange, alertCount = 0 }: TabNavigationProps) {
  const tabs: Tab[] = [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutDashboard
    },
    {
      id: "tax-planning",
      label: "Tax Planning",
      icon: TrendingUp
    },
    {
      id: "portfolio",
      label: "Portfolio",
      icon: Wallet
    },
    {
      id: "alerts",
      label: "Alerts",
      icon: Bell,
      badge: alertCount
    }
  ];

  return (
    <div className="border-b border-slate-200 dark:border-slate-700">
      <nav className="flex gap-1 px-6" aria-label="Dashboard tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative flex items-center gap-2 px-4 py-3
                text-sm font-medium transition-colors
                ${
                  isActive
                    ? "text-violet-600 dark:text-violet-400"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                }
              `}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>

              {/* Badge */}
              {tab.badge && tab.badge > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] text-center">
                  {tab.badge > 99 ? "99+" : tab.badge}
                </span>
              )}

              {/* Active Indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 dark:bg-violet-400"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

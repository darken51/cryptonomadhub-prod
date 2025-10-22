"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  MessageSquare,
  Search,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Wallet,
  Home
} from "lucide-react";

interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  isNew?: boolean;
}

interface DashboardSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function DashboardSidebar({ collapsed: controlledCollapsed, onToggle }: DashboardSidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const pathname = usePathname();

  // Use controlled or internal state
  const collapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
  const isExpanded = !collapsed || isHovered;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalCollapsed(!internalCollapsed);
    }
  };

  const sidebarItems: SidebarItem[] = [
    {
      id: "home",
      label: "Home",
      href: "/",
      icon: Home
    },
    {
      id: "dashboard",
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard
    },
    {
      id: "chat",
      label: "Chat AI",
      href: "/chat",
      icon: MessageSquare,
      badge: 0,
      isNew: false
    },
    {
      id: "defi-audit",
      label: "DeFi Audit",
      href: "/defi-audit",
      icon: Search
    },
    {
      id: "cost-basis",
      label: "Cost Basis",
      href: "/cost-basis",
      icon: FileText
    },
    {
      id: "tax-optimizer",
      label: "Tax Optimizer",
      href: "/tax-optimizer",
      icon: TrendingUp
    },
    {
      id: "wallets",
      label: "Wallets",
      href: "/wallets",
      icon: Wallet
    },
    {
      id: "settings",
      label: "Settings",
      href: "/settings",
      icon: Settings
    }
  ];

  return (
    <motion.aside
      className="fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 z-40 flex flex-col"
      initial={{ width: 64 }}
      animate={{ width: isExpanded ? 240 : 64 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700">
        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">CN</span>
              </div>
              <span className="text-white font-semibold text-sm">CryptoNomad</span>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center"
            >
              <span className="text-white font-bold text-sm">CN</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`
                    group relative flex items-center gap-3 px-3 py-2.5 rounded-lg
                    transition-all duration-150
                    ${
                      isActive
                        ? "bg-violet-600 text-white"
                        : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                    }
                  `}
                >
                  {/* Icon */}
                  <div className="relative flex-shrink-0">
                    <Icon className="w-5 h-5" />
                    {item.badge && item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  {/* Label */}
                  <AnimatePresence mode="wait">
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center gap-2 flex-1 min-w-0"
                      >
                        <span className="text-sm font-medium truncate">{item.label}</span>
                        {item.isNew && (
                          <span className="px-1.5 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded uppercase">
                            New
                          </span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Active Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer - Toggle Button */}
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={handleToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all duration-150"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <AnimatePresence mode="wait">
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm font-medium"
                  >
                    Collapse
                  </motion.span>
                )}
              </AnimatePresence>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}

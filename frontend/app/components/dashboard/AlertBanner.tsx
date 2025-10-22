"use client";

import { AlertCircle, AlertTriangle, Info, CheckCircle, X } from "lucide-react";
import Link from "next/link";
import { DashboardAlert, AlertType } from "./types";

interface AlertBannerProps {
  alert: DashboardAlert;
  onDismiss?: (alertId: string) => void;
}

const alertConfig: Record<AlertType, { icon: React.ElementType; bgClass: string; textClass: string; borderClass: string }> = {
  critical: {
    icon: AlertCircle,
    bgClass: "bg-red-50 dark:bg-red-950/30",
    textClass: "text-red-800 dark:text-red-200",
    borderClass: "border-red-200 dark:border-red-800"
  },
  warning: {
    icon: AlertTriangle,
    bgClass: "bg-orange-50 dark:bg-orange-950/30",
    textClass: "text-orange-800 dark:text-orange-200",
    borderClass: "border-orange-200 dark:border-orange-800"
  },
  info: {
    icon: Info,
    bgClass: "bg-blue-50 dark:bg-blue-950/30",
    textClass: "text-blue-800 dark:text-blue-200",
    borderClass: "border-blue-200 dark:border-blue-800"
  },
  success: {
    icon: CheckCircle,
    bgClass: "bg-green-50 dark:bg-green-950/30",
    textClass: "text-green-800 dark:text-green-200",
    borderClass: "border-green-200 dark:border-green-800"
  }
};

export function AlertBanner({ alert, onDismiss }: AlertBannerProps) {
  const config = alertConfig[alert.type];
  const Icon = config.icon;

  return (
    <div
      className={`
        relative flex items-start gap-3 p-4 rounded-lg border
        ${config.bgClass} ${config.borderClass}
      `}
      role="alert"
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">
        <Icon className={`w-5 h-5 ${config.textClass}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className={`text-sm font-semibold ${config.textClass}`}>
          {alert.title}
        </h3>
        <p className={`mt-1 text-sm ${config.textClass} opacity-90`}>
          {alert.message}
        </p>

        {/* Action Button */}
        {alert.action_url && alert.action_label && (
          <Link
            href={alert.action_url}
            className={`
              inline-flex items-center mt-3 px-3 py-1.5 text-xs font-medium rounded-md
              transition-colors
              ${
                alert.type === "critical"
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : alert.type === "warning"
                  ? "bg-orange-600 text-white hover:bg-orange-700"
                  : alert.type === "success"
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }
            `}
          >
            {alert.action_label}
          </Link>
        )}
      </div>

      {/* Dismiss Button */}
      {alert.dismissible && onDismiss && (
        <button
          onClick={() => onDismiss(alert.id)}
          className={`
            flex-shrink-0 p-1 rounded-md transition-colors
            ${config.textClass} opacity-60 hover:opacity-100
          `}
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

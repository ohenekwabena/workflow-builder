"use client";

import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";

interface ExecutionStatusBadgeProps {
  status: "queued" | "running" | "success" | "completed" | "failed";
  size?: "sm" | "md" | "lg";
}

export function ExecutionStatusBadge({ status, size = "md" }: ExecutionStatusBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  const iconSize = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const config = {
    queued: {
      icon: <Clock className={iconSize[size]} />,
      label: "Queued",
      className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    },
    running: {
      icon: <Loader2 className={`${iconSize[size]} animate-spin`} />,
      label: "Running",
      className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    },
    success: {
      icon: <CheckCircle2 className={iconSize[size]} />,
      label: "Success",
      className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    },
    completed: {
      icon: <CheckCircle2 className={iconSize[size]} />,
      label: "Completed",
      className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    },
    failed: {
      icon: <XCircle className={iconSize[size]} />,
      label: "Failed",
      className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    },
  };

  const { icon, label, className } = config[status];

  return (
    <Badge variant="outline" className={`${className} ${sizeClasses[size]} flex items-center gap-1.5`}>
      {icon}
      <span>{label}</span>
    </Badge>
  );
}

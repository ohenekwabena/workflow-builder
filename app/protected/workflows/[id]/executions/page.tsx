"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WorkflowExecution } from "@/lib/workflow/types";
import { formatDistanceToNow, format } from "date-fns";

export default function WorkflowExecutionsPage() {
  const params = useParams();
  const router = useRouter();
  const workflowId = params.id as string;

  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchExecutions();
    const interval = setInterval(fetchExecutions, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [workflowId]);

  const fetchExecutions = async () => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}/executions`);
      if (!response.ok) throw new Error("Failed to fetch executions");

      const data = await response.json();
      setExecutions(data.executions || []);
    } catch (error) {
      console.error("Error fetching executions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "running":
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case "queued":
        return <Clock className="w-5 h-5 text-gray-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      success: "default",
      failed: "destructive",
      running: "default",
      queued: "secondary",
    };

    return (
      <Badge variant={variants[status] || "secondary"} className="capitalize">
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 sm:py-8 px-2 sm:px-4">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-8">
        <Button variant="ghost" size="icon" onClick={() => router.push(`/protected/workflows/${workflowId}`)}>
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
        <div>
          <h1 className="text-xl sm:text-3xl font-bold">Workflow Executions</h1>
          <p className="text-xs sm:text-base text-gray-500 mt-1">View execution history and results</p>
        </div>
      </div>

      {/* Executions List */}
      {executions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 sm:py-20 px-4"
        >
          <div className="text-4xl sm:text-6xl mb-4">📊</div>
          <h3 className="text-xl sm:text-2xl font-bold mb-2">No executions yet</h3>
          <p className="text-sm sm:text-base text-gray-500 mb-6">Run your workflow to see execution history here</p>
          <Button onClick={() => router.push(`/protected/workflows/${workflowId}`)}>Go to Workflow</Button>
        </motion.div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {executions.map((execution, index) => (
            <motion.div
              key={execution.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className="p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/protected/executions/${execution.id}`)}
              >
                <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-0">
                  {/* Left side */}
                  <div className="flex items-start gap-3 sm:gap-4 flex-1 w-full">
                    <div className="mt-1">{getStatusIcon(execution.status)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="font-semibold text-sm sm:text-base truncate">
                          Execution #{execution.id.slice(0, 8)}
                        </h3>
                        {getStatusBadge(execution.status)}
                      </div>

                      <div className="space-y-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Trigger:</span>
                          <span className="capitalize">{execution.trigger_type}</span>
                        </div>

                        {execution.started_at && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">Started:</span>
                            <span className="truncate">{format(new Date(execution.started_at), "PPp")}</span>
                          </div>
                        )}

                        {execution.completed_at && execution.duration_ms && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">Duration:</span>
                            <span>{execution.duration_ms}ms</span>
                          </div>
                        )}

                        {execution.error_message && (
                          <div className="mt-2 p-2 sm:p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                            <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 break-words">
                              {execution.error_message}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right side */}
                  <div className="text-left sm:text-right text-xs sm:text-sm text-gray-500 w-full sm:w-auto">
                    {execution.started_at && (
                      <span>
                        {formatDistanceToNow(new Date(execution.started_at), {
                          addSuffix: true,
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

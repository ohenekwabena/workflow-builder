"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowDown } from "lucide-react";
import { ExecutionStatusBadge } from "./execution-status-badge";
import { getRealtimeSubscription, ExecutionUpdate, StepUpdate } from "@/lib/execution/realtime";
import { Button } from "@/components/ui/button";

interface LiveExecutionPanelProps {
  executionId: string;
  workflowNodes: any[];
  onClose: () => void;
}

interface StepStatus {
  node_id: string;
  status: "pending" | "running" | "completed" | "failed";
  output?: any;
  error?: string;
}

export function LiveExecutionPanel({ executionId, workflowNodes, onClose }: LiveExecutionPanelProps) {
  const [executionStatus, setExecutionStatus] = useState<ExecutionUpdate["status"]>("running");
  const [stepStatuses, setStepStatuses] = useState<Map<string, StepStatus>>(new Map());
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const realtime = getRealtimeSubscription();

    const unsubscribe = realtime.subscribeToExecution(executionId, {
      onExecutionUpdate: (update) => {
        setExecutionStatus(update.status);
        if (update.error) setError(update.error);
        if (update.result) setResult(update.result);
      },
      onStepUpdate: (update) => {
        setStepStatuses((prev) => {
          const next = new Map(prev);
          next.set(update.node_id, {
            node_id: update.node_id,
            status: update.status,
            output: update.output,
            error: update.error,
          });
          return next;
        });
      },
      onComplete: (result) => {
        setResult(result);
      },
      onError: (error) => {
        setError(error);
      },
    });

    return () => {
      unsubscribe();
    };
  }, [executionId]);

  const getNodeStatus = (nodeId: string): StepStatus["status"] => {
    return stepStatuses.get(nodeId)?.status || "pending";
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-2xl z-50 overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Live Execution</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <ExecutionStatusBadge status={executionStatus} size="md" />
        </div>

        {/* Step Progress */}
        <div className="p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Execution Steps</h3>

          <div className="space-y-3">
            {workflowNodes.map((node, index) => {
              const stepStatus = getNodeStatus(node.id);
              const stepData = stepStatuses.get(node.id);

              return (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative"
                >
                  <div
                    className={`p-4 rounded-lg border-2 transition-all ${
                      stepStatus === "running"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : stepStatus === "completed"
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : stepStatus === "failed"
                        ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                        : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{node.data.icon || "📦"}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{node.data.label}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">{node.data.nodeType}</p>

                        {stepStatus === "running" && (
                          <div className="mt-2">
                            <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-blue-500"
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 2, repeat: Infinity }}
                              />
                            </div>
                          </div>
                        )}

                        {stepData?.output && (
                          <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-x-auto">
                            {JSON.stringify(stepData.output, null, 2)}
                          </pre>
                        )}

                        {stepData?.error && (
                          <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded text-xs text-red-700 dark:text-red-300">
                            {stepData.error}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {index < workflowNodes.length - 1 && (
                    <div className="flex justify-center py-2">
                      <ArrowDown className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Final Result */}
          {result && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-semibold text-sm text-green-900 dark:text-green-100 mb-2">Execution Result</h4>
              <pre className="text-xs text-green-800 dark:text-green-200 overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <h4 className="font-semibold text-sm text-red-900 dark:text-red-100 mb-2">Execution Error</h4>
              <p className="text-xs text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

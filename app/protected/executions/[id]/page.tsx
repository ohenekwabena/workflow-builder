"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface ExecutionStep {
  id: string;
  node_id: string;
  node_type: string;
  status: string;
  input_data: any;
  output_data: any;
  error_message?: string;
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
}

interface ExecutionDetail {
  id: string;
  workflow_id: string;
  status: string;
  trigger_type: string;
  started_at: string;
  completed_at?: string;
  error_message?: string;
  duration_ms?: number;
  steps: ExecutionStep[];
}

export default function ExecutionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const executionId = params.id as string;

  const [execution, setExecution] = useState<ExecutionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchExecution();
  }, [executionId]);

  const fetchExecution = async () => {
    try {
      const response = await fetch(`/api/executions/${executionId}`);
      if (!response.ok) throw new Error("Failed to fetch execution");

      const data = await response.json();
      setExecution(data.execution);
    } catch (error) {
      console.error("Error fetching execution:", error);
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
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!execution) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Execution not found</h2>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 sm:py-8 px-2 sm:px-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-8">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-3xl font-bold truncate">Execution Details</h1>
          <p className="text-xs sm:text-base text-gray-500 mt-1">#{execution.id.slice(0, 8)}</p>
        </div>
        <Badge
          variant={
            execution.status === "success" ? "default" : execution.status === "failed" ? "destructive" : "secondary"
          }
          className="capitalize text-xs sm:text-sm"
        >
          {execution.status}
        </Badge>
      </div>

      {/* Summary Card */}
      <Card className="p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
          <div>
            <span className="text-gray-500">Trigger Type:</span>
            <p className="font-medium capitalize">{execution.trigger_type}</p>
          </div>
          <div>
            <span className="text-gray-500">Started At:</span>
            <p className="font-medium break-words">{format(new Date(execution.started_at), "PPp")}</p>
          </div>
          {execution.completed_at && (
            <>
              <div>
                <span className="text-gray-500">Completed At:</span>
                <p className="font-medium break-words">{format(new Date(execution.completed_at), "PPp")}</p>
              </div>
              <div>
                <span className="text-gray-500">Duration:</span>
                <p className="font-medium">{execution.duration_ms ? `${execution.duration_ms}ms` : "N/A"}</p>
              </div>
            </>
          )}
        </div>

        {execution.error_message && (
          <div className="mt-4 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <h3 className="font-semibold text-sm sm:text-base text-red-600 dark:text-red-400 mb-2">Error</h3>
            <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 break-words">{execution.error_message}</p>
          </div>
        )}
      </Card>

      {/* Execution Steps */}
      <div className="space-y-3 sm:space-y-4">
        <h2 className="text-base sm:text-lg font-semibold">Execution Steps</h2>

        {execution.steps && execution.steps.length > 0 ? (
          execution.steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-4 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="mt-1">{getStatusIcon(step.status)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                      <h3 className="font-semibold text-sm sm:text-base">Step {index + 1}</h3>
                      <Badge variant="outline" className="text-xs">
                        {step.node_type}
                      </Badge>
                    </div>

                    <div className="space-y-3 text-xs sm:text-sm">
                      {step.duration_ms && (
                        <div>
                          <span className="text-gray-500">Duration: </span>
                          <span>{step.duration_ms}ms</span>
                        </div>
                      )}

                      {step.input_data && (
                        <div>
                          <h4 className="text-gray-500 mb-1">Input:</h4>
                          <pre className="bg-gray-50 dark:bg-gray-800 p-2 sm:p-3 rounded-lg overflow-x-auto text-[10px] sm:text-xs max-w-full">
                            {JSON.stringify(step.input_data, null, 2)}
                          </pre>
                        </div>
                      )}

                      {step.output_data && (
                        <div>
                          <h4 className="text-gray-500 mb-1">Output:</h4>
                          <pre className="bg-gray-50 dark:bg-gray-800 p-2 sm:p-3 rounded-lg overflow-x-auto text-[10px] sm:text-xs max-w-full">
                            {JSON.stringify(step.output_data, null, 2)}
                          </pre>
                        </div>
                      )}

                      {step.error_message && (
                        <div className="p-2 sm:p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <p className="text-red-600 dark:text-red-400 break-words">{step.error_message}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        ) : (
          <Card className="p-6 sm:p-8 text-center text-gray-500 text-sm sm:text-base">
            <p>No execution steps available</p>
          </Card>
        )}
      </div>
    </div>
  );
}

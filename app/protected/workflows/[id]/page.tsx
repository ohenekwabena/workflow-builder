"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { WorkflowCanvas } from "@/components/workflow/workflow-canvas";
import { useWorkflowStore } from "@/lib/workflow/store";
import { LiveExecutionPanel } from "@/components/execution/live-execution-panel";
import { ScheduleTriggerModal } from "@/components/workflow/schedule-trigger-modal";
import { WebhookTestingModal } from "@/components/workflow/webhook-testing-modal";
import { Loader2, ArrowLeft, Clock, Webhook, Play, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export default function WorkflowEditorPage() {
  const params = useParams();
  const router = useRouter();
  const workflowId = params.id as string;

  const { workflow, setWorkflow, resetWorkflow, nodes } = useWorkflowStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [workflowName, setWorkflowName] = useState("");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState<string | null>(null);
  const [activeExecutionId, setActiveExecutionId] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkflow();
    fetchWebhook();

    return () => {
      resetWorkflow();
    };
  }, [workflowId]);

  const fetchWorkflow = async () => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}`);
      if (!response.ok) throw new Error("Failed to fetch workflow");

      const data = await response.json();
      setWorkflow(data.workflow);
      setWorkflowName(data.workflow.name);
    } catch (error) {
      console.error("Error fetching workflow:", error);
      router.push("/protected/workflows");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWebhook = async () => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}/webhook`);
      if (!response.ok) return;

      const data = await response.json();
      if (data.webhook_url) {
        setWebhookUrl(data.webhook_url);
      }
    } catch (error) {
      console.error("Error fetching webhook:", error);
    }
  };

  const handleCreateWebhook = async () => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}/webhook`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to create webhook");

      const data = await response.json();
      setWebhookUrl(data.webhook_url);
      setShowWebhookModal(true);
    } catch (error) {
      console.error("Error creating webhook:", error);
    }
  };

  const handleUpdateName = async () => {
    if (!workflow || workflowName === workflow.name) {
      setIsEditingName(false);
      return;
    }

    try {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: workflowName }),
      });

      if (!response.ok) throw new Error("Failed to update workflow name");

      const data = await response.json();
      setWorkflow(data.workflow);
      setIsEditingName(false);
    } catch (error) {
      console.error("Error updating workflow name:", error);
    }
  };

  const handleSaveSchedule = async (cronExpression: string) => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trigger_config: { schedule: cronExpression },
        }),
      });

      if (!response.ok) throw new Error("Failed to save schedule");

      const data = await response.json();
      setWorkflow(data.workflow);
    } catch (error) {
      console.error("Error saving schedule:", error);
      throw error;
    }
  };

  const handleToggleActive = async () => {
    try {
      const newActiveState = !workflow?.is_active;
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: newActiveState }),
      });

      if (!response.ok) throw new Error("Failed to update workflow");

      const data = await response.json();
      setWorkflow(data.workflow);
    } catch (error) {
      console.error("Error toggling workflow active state:", error);
    }
  };

  const handleExecuteWorkflow = async () => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: {} }),
      });

      if (!response.ok) throw new Error("Failed to execute workflow");

      const data = await response.json();
      setActiveExecutionId(data.execution_id);
    } catch (error) {
      console.error("Error executing workflow:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Top navbar */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/protected/workflows")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>

          {isEditingName ? (
            <Input
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              onBlur={handleUpdateName}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleUpdateName();
                if (e.key === "Escape") {
                  setWorkflowName(workflow?.name || "");
                  setIsEditingName(false);
                }
              }}
              autoFocus
              className="w-64"
            />
          ) : (
            <h1
              className="text-xl font-semibold cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => setIsEditingName(true)}
            >
              {workflow?.name}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={workflow?.is_active ? "default" : "outline"}
            size="sm"
            onClick={handleToggleActive}
            className={workflow?.is_active ? "gap-2 bg-green-500 hover:bg-green-600" : "gap-2"}
          >
            <Power className="w-4 h-4" />
            {workflow?.is_active ? "Active" : "Inactive"}
          </Button>

          <Button variant="outline" size="sm" onClick={() => setShowScheduleModal(true)} className="gap-2">
            <Clock className="w-4 h-4" />
            Schedule
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => (webhookUrl ? setShowWebhookModal(true) : handleCreateWebhook())}
            className="gap-2"
          >
            <Webhook className="w-4 h-4" />
            {webhookUrl ? "Test Webhook" : "Create Webhook"}
          </Button>

          <Button variant="outline" size="sm" onClick={handleExecuteWorkflow} className="gap-2">
            <Play className="w-4 h-4" />
            Run Now
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/protected/workflows/${workflowId}/executions`)}
          >
            View Executions
          </Button>
        </div>
      </motion.div>

      {/* Canvas */}
      <div className="flex-1">
        <WorkflowCanvas />
      </div>

      {/* Modals */}
      {showScheduleModal && (
        <ScheduleTriggerModal
          workflowId={workflowId}
          currentSchedule={workflow?.trigger_config?.schedule}
          onClose={() => setShowScheduleModal(false)}
          onSave={handleSaveSchedule}
        />
      )}

      {showWebhookModal && webhookUrl && (
        <WebhookTestingModal webhookUrl={webhookUrl} onClose={() => setShowWebhookModal(false)} />
      )}

      {activeExecutionId && (
        <LiveExecutionPanel
          executionId={activeExecutionId}
          workflowNodes={nodes}
          onClose={() => setActiveExecutionId(null)}
        />
      )}
    </div>
  );
}

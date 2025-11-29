"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Play, Trash2, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Workflow } from "@/lib/workflow/types";
import { TemplateLibraryModal } from "./template-library-modal";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export function WorkflowList() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; workflowId: string | null }>({
    isOpen: false,
    workflowId: null,
  });

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const response = await fetch("/api/workflows");
      if (!response.ok) throw new Error("Failed to fetch workflows");
      const data = await response.json();
      setWorkflows(data.workflows || []);
    } catch (error) {
      console.error("Error fetching workflows:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWorkflow = async () => {
    setIsCreating(true);
    try {
      const response = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Untitled Workflow",
          description: "",
          nodes: [],
          edges: [],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create workflow");
      }

      router.push(`/protected/workflows/${data.workflow.id}`);
    } catch (error) {
      console.error("Error creating workflow:", error);
      toast.error("Failed to create workflow", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateFromTemplate = async (nodes: any[], edges: any[]) => {
    setIsCreating(true);
    try {
      const response = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "New Workflow from Template",
          description: "",
          nodes,
          edges,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create workflow");
      }

      router.push(`/protected/workflows/${data.workflow.id}`);
    } catch (error) {
      console.error("Error creating workflow:", error);
      alert(error instanceof Error ? error.message : "Failed to create workflow");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteWorkflow = async (id: string) => {
    try {
      const response = await fetch(`/api/workflows/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete workflow");

      setWorkflows(workflows.filter((w) => w.id !== id));
      toast.success("Workflow deleted successfully");
    } catch (error) {
      console.error("Error deleting workflow:", error);
      toast.error("Failed to delete workflow", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setDeleteDialog({ isOpen: false, workflowId: null });
    }
  };

  const confirmDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteDialog({ isOpen: true, workflowId: id });
  };

  const handleExecuteWorkflow = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      console.log("Executing workflow:", id);

      const response = await fetch(`/api/workflows/${id}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to execute workflow");
      }

      toast.success("Workflow execution started!", {
        description: `Execution ID: ${data.execution_id}`,
        duration: 5000,
        action: {
          label: "View",
          onClick: () => router.push(`/protected/executions/${data.execution_id}`),
        },
      });
    } catch (error) {
      console.error("Error executing workflow:", error);
      toast.error("Failed to execute workflow", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Workflows</h1>
          <p className="text-gray-500 mt-1">Create and manage your automation workflows</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowTemplates(true)} variant="outline" className="gap-2">
            <Sparkles className="w-4 h-4" />
            Templates
          </Button>
          <Button onClick={handleCreateWorkflow} disabled={isCreating} className="gap-2">
            {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            New Workflow
          </Button>
        </div>
      </div>

      {/* Workflows Grid */}
      {workflows.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
          <div className="text-6xl mb-4">🚀</div>
          <h3 className="text-2xl font-bold mb-2">No workflows yet</h3>
          <p className="text-gray-500 mb-6">Create your first workflow to start automating tasks</p>
          <Button onClick={handleCreateWorkflow} disabled={isCreating}>
            {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            Create Your First Workflow
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflows.map((workflow, index) => (
            <motion.div
              key={workflow.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => router.push(`/protected/workflows/${workflow.id}`)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1 group-hover:text-blue-600 transition-colors">
                      {workflow.name}
                    </h3>
                    {workflow.description && (
                      <p className="text-sm text-gray-500 line-clamp-2">{workflow.description}</p>
                    )}
                  </div>
                  <Badge
                    variant={workflow.is_active ? "default" : "secondary"}
                    className={workflow.is_active ? "bg-green-500 hover:bg-green-600" : ""}
                  >
                    {workflow.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>{workflow.nodes?.length || 0} nodes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>{workflow.edges?.length || 0} connections</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>
                      {formatDistanceToNow(new Date(workflow.updated_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => handleExecuteWorkflow(workflow.id, e)}
                      className="gap-1"
                    >
                      <Play className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => confirmDelete(workflow.id, e)}
                      className="gap-1 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Template Library Modal */}
      {showTemplates && (
        <TemplateLibraryModal onClose={() => setShowTemplates(false)} onSelectTemplate={handleCreateFromTemplate} />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, workflowId: null })}
        onConfirm={() => deleteDialog.workflowId && handleDeleteWorkflow(deleteDialog.workflowId)}
        title="Delete Workflow"
        description="Are you sure you want to delete this workflow? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}

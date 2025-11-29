"use client";

import React, { useCallback, useState } from "react";
import ReactFlow, { Background, Controls, MiniMap, BackgroundVariant, Panel } from "reactflow";
import "reactflow/dist/style.css";
import { useWorkflowStore } from "@/lib/workflow/store";
import { CustomNode } from "./custom-node";
import { NodeConfigPanel } from "./node-config-panel";
import { NodeLibrary } from "./node-library";
import { OnboardingTooltip } from "./onboarding-tooltip";
import { Button } from "@/components/ui/button";
import { Plus, Play, Save, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const nodeTypes = {
  customNode: CustomNode,
};

export function WorkflowCanvas() {
  const [showNodeLibrary, setShowNodeLibrary] = useState(false);

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    saveWorkflow,
    executeWorkflow,
    isSaving,
    isExecuting,
    setSelectedNode,
  } = useWorkflowStore();

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: any) => {
      setSelectedNode(node);
    },
    [setSelectedNode]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  const handleSave = async () => {
    try {
      await saveWorkflow();
      // You can add a toast notification here
      console.log("Workflow saved successfully");
    } catch (error) {
      console.error("Failed to save:", error);
    }
  };

  const handleExecute = async () => {
    try {
      console.log("Starting workflow execution...");
      const result = await executeWorkflow();
      console.log("Execution started:", result);

      // Show success feedback
      if (result?.execution_id) {
        alert(
          `Workflow execution queued!\n\nExecution ID: ${result.execution_id}\n\nThe workflow will be processed in the background. Check the Executions page to see the results.\n\nNote: You need to run the queue processor (npm run process-queue) to execute queued workflows.`
        );
      }
    } catch (error) {
      console.error("Failed to execute:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to execute workflow:\n\n${errorMessage}`);
    }
  };

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges as any}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gray-50 dark:bg-gray-950"
        defaultEdgeOptions={{
          type: "smoothstep",
          animated: true,
          style: { strokeWidth: 2 },
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} className="bg-gray-50 dark:bg-gray-950" />
        <Controls className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg" />
        <MiniMap
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
          nodeColor={(node) => {
            switch (node.data.category) {
              case "trigger":
                return "#3b82f6";
              case "data":
                return "#10b981";
              case "action":
                return "#a855f7";
              case "logic":
                return "#f97316";
              default:
                return "#6b7280";
            }
          }}
        />

        {/* Top toolbar */}
        <Panel position="top-center" className="flex gap-2 z-10 isolate">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center gap-3"
          >
            <Button
              onClick={() => {
                console.log("Add node button clicked");
                setShowNodeLibrary(true);
              }}
              size="sm"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Node
            </Button>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

            <Button onClick={handleSave} size="sm" variant="outline" disabled={isSaving} className="gap-2">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? "Saving..." : "Save"}
            </Button>

            <Button
              onClick={handleExecute}
              size="sm"
              variant="default"
              disabled={isExecuting || nodes.length === 0}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              {isExecuting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {isExecuting ? "Running..." : "Run Workflow"}
            </Button>
          </motion.div>
        </Panel>

        {/* Empty state */}
        {nodes.length === 0 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-32 text-center"
            >
              <div className="text-6xl mb-4">🎨</div>
              <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Start Building Your Workflow</h3>
              <p className="text-gray-500 mb-6">Click "Add Node" to begin creating your automation</p>
            </motion.div>
          </div>
        )}
      </ReactFlow>

      {/* Node Library Modal */}
      <AnimatePresence>{showNodeLibrary && <NodeLibrary onClose={() => setShowNodeLibrary(false)} />}</AnimatePresence>

      {/* Node Config Panel */}
      <NodeConfigPanel />

      {/* Onboarding Tooltip */}
      <OnboardingTooltip />
    </div>
  );
}

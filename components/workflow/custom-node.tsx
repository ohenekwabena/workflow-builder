"use client";

import React from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { motion } from "framer-motion";
import { WorkflowNode } from "@/lib/workflow/types";
import { getNodeTypeDefinition } from "@/lib/workflow/node-types";
import { Settings, Trash2, Play } from "lucide-react";
import { useWorkflowStore } from "@/lib/workflow/store";

export function CustomNode({ id, data, selected }: NodeProps<WorkflowNode["data"]>) {
  const setSelectedNode = useWorkflowStore((state) => state.setSelectedNode);
  const deleteNode = useWorkflowStore((state) => state.deleteNode);
  const nodes = useWorkflowStore((state) => state.nodes);

  const nodeDefinition = getNodeTypeDefinition(data.nodeType);
  const currentNode = nodes.find((n) => n.id === id);

  const handleConfigClick = () => {
    if (currentNode) {
      setSelectedNode(currentNode);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNode(id);
  };

  const getCategoryColor = () => {
    switch (data.category) {
      case "trigger":
        return "from-blue-500 to-blue-600";
      case "data":
        return "from-green-500 to-green-600";
      case "action":
        return "from-purple-500 to-purple-600";
      case "logic":
        return "from-orange-500 to-orange-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="relative"
    >
      {/* Input handle - hidden for trigger nodes */}
      {data.category !== "trigger" && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white dark:!border-gray-800"
        />
      )}

      <div
        className={`
          min-w-[220px] rounded-lg shadow-lg border-2 transition-all
          ${selected ? "border-blue-500 shadow-blue-500/50" : "border-gray-200 dark:border-gray-700"}
          bg-white dark:bg-gray-800
        `}
      >
        {/* Header */}
        <div className={`px-4 py-3 rounded-t-md bg-gradient-to-r ${getCategoryColor()}`}>
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <span className="text-xl">{nodeDefinition?.icon || "⚙️"}</span>
              <span className="font-semibold text-sm">{data.label}</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={handleConfigClick} className="p-1 hover:bg-white/20 rounded transition-colors">
                <Settings className="w-4 h-4" />
              </button>
              <button onClick={handleDelete} className="p-1 hover:bg-white/20 rounded transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-4 py-3">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{nodeDefinition?.description}</p>

          {/* Configuration preview */}
          {Object.keys(data.config || {}).length > 0 && (
            <div className="mt-2 space-y-1">
              {Object.entries(data.config)
                .slice(0, 2)
                .map(([key, value]) => (
                  <div key={key} className="text-xs">
                    <span className="text-gray-500 dark:text-gray-500">{key}: </span>
                    <span className="text-gray-700 dark:text-gray-300 truncate">
                      {typeof value === "string" && value.length > 30 ? `${value.slice(0, 30)}...` : String(value)}
                    </span>
                  </div>
                ))}
            </div>
          )}

          {/* Status badge */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Output handle - hidden for final action nodes can be customized later */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white dark:!border-gray-800"
      />
    </motion.div>
  );
}

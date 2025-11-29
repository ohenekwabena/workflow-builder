"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useWorkflowStore } from "@/lib/workflow/store";
import { getNodeTypeDefinition } from "@/lib/workflow/node-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfigField } from "@/lib/workflow/types";

export function NodeConfigPanel() {
  const selectedNode = useWorkflowStore((state) => state.selectedNode);
  const updateNodeConfig = useWorkflowStore((state) => state.updateNodeConfig);
  const setSelectedNode = useWorkflowStore((state) => state.setSelectedNode);
  const showNodePanel = useWorkflowStore((state) => state.showNodePanel);

  if (!selectedNode || !showNodePanel) return null;

  const nodeDefinition = getNodeTypeDefinition(selectedNode.data.nodeType);
  if (!nodeDefinition) return null;

  const handleConfigChange = (fieldName: string, value: any) => {
    if (!selectedNode) return;

    const updatedConfig = {
      ...(selectedNode.data.config || {}),
      [fieldName]: value,
    };
    updateNodeConfig(selectedNode.id, updatedConfig);
  };

  const handleClose = () => {
    setSelectedNode(null);
  };

  const renderField = (field: ConfigField) => {
    const value = selectedNode.data.config?.[field.name] ?? field.defaultValue ?? "";

    switch (field.type) {
      case "text":
      case "email":
      case "number":
        return (
          <Input
            type={field.type}
            value={value}
            onChange={(e) => handleConfigChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        );

      case "textarea":
        return (
          <textarea
            value={value}
            onChange={(e) => handleConfigChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            rows={4}
          />
        );

      case "select":
        return (
          <select
            value={value}
            onChange={(e) => handleConfigChange(field.name, e.target.value)}
            required={field.required}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleConfigChange(field.name, e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
          </div>
        );

      default:
        return null;
    }
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
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{nodeDefinition.icon}</span>
            <div>
              <h2 className="text-lg font-semibold">{nodeDefinition.label}</h2>
              <p className="text-xs text-gray-500">{nodeDefinition.description}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose} className="shrink-0">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Configuration form */}
        <div className="p-6 space-y-6">
          {/* Node Label */}
          <div className="space-y-2">
            <Label htmlFor="node-label">Node Label</Label>
            <Input
              id="node-label"
              value={selectedNode.data.label}
              onChange={(e) => {
                const newLabel = e.target.value;
                // Update the node in the nodes array
                const nodes = useWorkflowStore.getState().nodes;
                const updatedNodes = nodes.map((node) =>
                  node.id === selectedNode.id ? { ...node, data: { ...node.data, label: newLabel } } : node
                );
                const updatedNode = updatedNodes.find((n) => n.id === selectedNode.id);
                useWorkflowStore.setState({
                  nodes: updatedNodes,
                  selectedNode: updatedNode || null,
                });
              }}
              placeholder="Enter node label"
            />
          </div>

          {/* Configuration Fields */}
          {nodeDefinition.config.fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {renderField(field)}
              {field.description && <p className="text-xs text-gray-500">{field.description}</p>}
            </div>
          ))}

          {/* Help text */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-sm mb-2 text-blue-900 dark:text-blue-100">💡 Dynamic Variables</h3>
            <p className="text-xs text-blue-800 dark:text-blue-200">
              Use <code className="bg-blue-100 dark:bg-blue-800 px-1 py-0.5 rounded">{"{{variable}}"}</code> syntax to
              reference data from previous nodes. For example:{" "}
              <code className="bg-blue-100 dark:bg-blue-800 px-1 py-0.5 rounded">{"{{temperature}}"}</code>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <Button onClick={handleClose} className="w-full">
            Done
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

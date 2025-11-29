"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, X } from "lucide-react";
import { NODE_TYPE_DEFINITIONS, getNodeTypesByCategory } from "@/lib/workflow/node-types";
import { useWorkflowStore } from "@/lib/workflow/store";
import { WorkflowNode } from "@/lib/workflow/types";
import { Input } from "@/components/ui/input";
import { nanoid } from "nanoid";

interface NodeLibraryProps {
  onClose: () => void;
}

export function NodeLibrary({ onClose }: NodeLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const addNode = useWorkflowStore((state) => state.addNode);
  const nodes = useWorkflowStore((state) => state.nodes);

  const categories = [
    { id: "trigger", label: "Triggers", icon: "⚡", color: "bg-blue-500" },
    { id: "data", label: "Data Sources", icon: "📊", color: "bg-green-500" },
    { id: "action", label: "Actions", icon: "🎯", color: "bg-purple-500" },
    { id: "logic", label: "Logic", icon: "🧠", color: "bg-orange-500" },
  ];

  const filteredNodes = Object.values(NODE_TYPE_DEFINITIONS).filter((node) => {
    const matchesSearch =
      node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || node.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddNode = (nodeType: string) => {
    const definition = NODE_TYPE_DEFINITIONS[nodeType];

    // Calculate position (stagger nodes)
    const existingNodesCount = nodes.length;
    const xOffset = 100 + (existingNodesCount % 3) * 280;
    const yOffset = 100 + Math.floor(existingNodesCount / 3) * 200;

    const newNode: WorkflowNode = {
      id: nanoid(),
      type: "customNode",
      position: { x: xOffset, y: yOffset },
      data: {
        label: definition.label,
        nodeType: definition.type,
        config: {},
        category: definition.category,
        icon: definition.icon,
        color: definition.color,
      },
    };

    addNode(newNode);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-4xl max-h-[90vh] sm:max-h-[80vh] bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Add Node</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Choose a node type to add to your workflow</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 sm:pl-10 text-sm"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                selectedCategory === null
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                  : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 sm:gap-2 ${
                  selectedCategory === category.id
                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                    : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                <span className="text-sm sm:text-base">{category.icon}</span>
                <span className="hidden xs:inline">{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Node Grid */}
        <div className="px-4 sm:px-6 py-4 overflow-y-auto max-h-[calc(90vh-16rem)] sm:max-h-[50vh] pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {filteredNodes.map((node) => (
              <motion.button
                key={node.type}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAddNode(node.type)}
                className="p-3 sm:p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl hover:border-gray-400 dark:hover:border-gray-500 transition-all text-left group"
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${node.color} flex items-center justify-center text-xl sm:text-2xl shrink-0 group-hover:scale-110 transition-transform`}
                  >
                    {node.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-1">{node.label}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2">{node.description}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {filteredNodes.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <p className="text-sm sm:text-base text-gray-500">No nodes found matching your search</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

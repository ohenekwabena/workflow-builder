"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WORKFLOW_TEMPLATES, createWorkflowFromTemplate, WorkflowTemplate } from "@/lib/workflow/templates";
import { Badge } from "@/components/ui/badge";

interface TemplateLibraryModalProps {
  onClose: () => void;
  onSelectTemplate: (nodes: any[], edges: any[]) => void;
}

export function TemplateLibraryModal({ onClose, onSelectTemplate }: TemplateLibraryModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<WorkflowTemplate["category"] | null>(null);

  const categories = [
    { id: "automation" as const, label: "Automation", icon: "⚡" },
    { id: "data-processing" as const, label: "Data Processing", icon: "📊" },
    { id: "integration" as const, label: "Integration", icon: "🔗" },
    { id: "monitoring" as const, label: "Monitoring", icon: "👁️" },
  ];

  const filteredTemplates = WORKFLOW_TEMPLATES.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelectTemplate = (template: WorkflowTemplate) => {
    const { nodes, edges } = createWorkflowFromTemplate(template);
    onSelectTemplate(nodes, edges);
    onClose();
  };

  return (
    <AnimatePresence>
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
          className="w-full max-w-5xl max-h-[90vh] sm:max-h-[85vh] bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Workflow Templates</h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 hidden md:block">Start with a pre-built workflow</p>
              </div>
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
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 sm:pl-10 text-sm"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === null
                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                    : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                All Templates
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${
                    selectedCategory === category.id
                      ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                      : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  <span className="text-sm sm:text-base">{category.icon}</span>
                  <span className="hidden md:inline">{category.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Templates Grid */}
          <div className="px-4 sm:px-6 py-4 overflow-y-auto max-h-[calc(90vh-16rem)] sm:max-h-[50vh]">
            {filteredTemplates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {filteredTemplates.map((template) => (
                  <motion.div
                    key={template.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="border-2 border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl p-4 sm:p-5 hover:border-purple-500 dark:hover:border-purple-500 transition-all cursor-pointer group"
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl sm:text-3xl shrink-0 group-hover:scale-110 transition-transform">
                        {template.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base mb-1">{template.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3 line-clamp-2">
                          {template.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {template.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="mt-2 sm:mt-3 text-xs text-gray-400">{template.nodes.length} nodes</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <p className="text-sm sm:text-base text-gray-500">No templates found matching your search</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-2">
            <p className="text-xs sm:text-sm text-gray-500">{filteredTemplates.length} templates available</p>
            <Button variant="outline" onClick={onClose} size="sm" className="w-full md:w-auto">
              Close
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

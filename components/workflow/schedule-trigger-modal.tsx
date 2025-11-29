"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import cronstrue from "cronstrue";
import parser from "cron-parser";

interface ScheduleTriggerModalProps {
  workflowId: string;
  currentSchedule?: string;
  onClose: () => void;
  onSave: (cronExpression: string) => Promise<void>;
}

export function ScheduleTriggerModal({ workflowId, currentSchedule, onClose, onSave }: ScheduleTriggerModalProps) {
  const [cronExpression, setCronExpression] = useState(currentSchedule || "0 9 * * *");
  const [isValid, setIsValid] = useState(true);
  const [humanReadable, setHumanReadable] = useState("");
  const [nextRuns, setNextRuns] = useState<Date[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const presets = [
    { label: "Every minute", value: "* * * * *" },
    { label: "Every hour", value: "0 * * * *" },
    { label: "Every day at 9 AM", value: "0 9 * * *" },
    { label: "Every Monday at 9 AM", value: "0 9 * * 1" },
    { label: "Every month on 1st", value: "0 9 1 * *" },
  ];

  const validateAndParse = (expression: string) => {
    try {
      // Validate cron expression
      const interval = parser.parse(expression);

      // Get human-readable description
      const description = cronstrue.toString(expression);
      setHumanReadable(description);

      // Calculate next 5 runs
      const runs: Date[] = [];
      for (let i = 0; i < 5; i++) {
        runs.push(interval.next().toDate());
      }
      setNextRuns(runs);
      setIsValid(true);
    } catch (error) {
      setIsValid(false);
      setHumanReadable("Invalid cron expression");
      setNextRuns([]);
    }
  };

  const handleCronChange = (value: string) => {
    setCronExpression(value);
    validateAndParse(value);
  };

  const handlePresetClick = (value: string) => {
    handleCronChange(value);
  };

  const handleSave = async () => {
    if (!isValid) return;

    setIsSaving(true);
    try {
      await onSave(cronExpression);
      onClose();
    } catch (error) {
      console.error("Failed to save schedule:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Initial validation
  React.useEffect(() => {
    validateAndParse(cronExpression);
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden mx-4 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-bold">Schedule Workflow</h2>
                <p className="text-sm text-gray-500 mt-0.5">Configure when this workflow should run</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Cron Expression Input */}
            <div className="space-y-2">
              <Label htmlFor="cron">Cron Expression</Label>
              <Input
                id="cron"
                value={cronExpression}
                onChange={(e) => handleCronChange(e.target.value)}
                placeholder="* * * * *"
                className={!isValid ? "border-red-500" : ""}
              />
              <p className={`text-sm ${isValid ? "text-gray-600" : "text-red-600"}`}>{humanReadable}</p>
            </div>

            {/* Quick Presets */}
            <div className="space-y-2">
              <Label>Quick Presets</Label>
              <div className="grid grid-cols-2 gap-2">
                {presets.map((preset) => (
                  <Button
                    key={preset.value}
                    variant="outline"
                    size="sm"
                    onClick={() => handlePresetClick(preset.value)}
                    className="justify-start"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Next Runs Preview */}
            {isValid && nextRuns.length > 0 && (
              <div className="space-y-2">
                <Label>Next 5 Scheduled Runs</Label>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                  {nextRuns.map((date, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {date.toLocaleString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cron Help */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-2">Cron Expression Format</h4>
              <div className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                <p>
                  <code className="bg-blue-100 dark:bg-blue-800 px-1 py-0.5 rounded">* * * * *</code>
                </p>
                <p>minute (0-59) | hour (0-23) | day (1-31) | month (1-12) | weekday (0-6)</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2 flex-shrink-0">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!isValid || isSaving}>
              {isSaving ? "Saving..." : "Save Schedule"}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

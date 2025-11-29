"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OnboardingTooltip() {
  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    // Check if user has seen the tooltip
    const hasSeenTip = localStorage.getItem("workflow-builder-onboarding");
    if (!hasSeenTip) {
      setTimeout(() => setShowTip(true), 1000);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("workflow-builder-onboarding", "true");
    setShowTip(false);
  };

  return (
    <AnimatePresence>
      {showTip && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-8 right-8 max-w-md z-50"
        >
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-1 rounded-2xl shadow-2xl">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">Welcome to Workflow Builder! 🎉</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Click <strong>"Add Node"</strong> to start building your automation. Connect nodes by dragging from
                    the right handle to the left handle of another node.
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={handleDismiss} size="sm">
                      Got it!
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleDismiss}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

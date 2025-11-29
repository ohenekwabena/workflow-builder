"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Editor from "@monaco-editor/react";
import copy from "copy-to-clipboard";

interface WebhookTestingModalProps {
  webhookUrl: string;
  onClose: () => void;
}

export function WebhookTestingModal({ webhookUrl, onClose }: WebhookTestingModalProps) {
  const [payload, setPayload] = useState('{\n  "message": "Hello, World!",\n  "timestamp": "2024-01-01T00:00:00Z"\n}');
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCopyUrl = () => {
    copy(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCurl = () => {
    const curlCommand = `curl -X POST '${webhookUrl}' \\
  -H 'Content-Type: application/json' \\
  -d '${payload.replace(/\n/g, "")}'`;
    copy(curlCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendRequest = async () => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const parsedPayload = JSON.parse(payload);
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsedPayload),
      });

      const data = await res.json();
      setResponse({
        status: res.status,
        statusText: res.statusText,
        data,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

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
          className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden mx-4 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Test Webhook</h2>
              <p className="text-sm text-gray-500 mt-0.5">Send test requests to your webhook endpoint</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Webhook URL */}
            <div className="space-y-2">
              <Label>Webhook URL</Label>
              <div className="flex gap-2">
                <div className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 font-mono text-sm overflow-x-auto">
                  {webhookUrl}
                </div>
                <Button variant="outline" size="icon" onClick={handleCopyUrl}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Request Payload */}
            <div className="space-y-2">
              <Label>Request Payload (JSON)</Label>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <Editor
                  height="200px"
                  defaultLanguage="json"
                  value={payload}
                  onChange={(value) => setPayload(value || "")}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
              </div>
            </div>

            {/* cURL Example */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs">cURL Example</Label>
                <Button variant="ghost" size="sm" onClick={handleCopyCurl} className="h-7 text-xs">
                  {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                  Copy
                </Button>
              </div>
              <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-x-auto">
                {`curl -X POST '${webhookUrl}' \\
  -H 'Content-Type: application/json' \\
  -d '${payload.replace(/\n/g, " ")}'`}
              </pre>
            </div>

            {/* Response */}
            {response && (
              <div className="space-y-2">
                <Label>Response</Label>
                <div
                  className={`p-4 rounded-lg border-2 ${
                    response.status >= 200 && response.status < 300
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                      : "border-red-500 bg-red-50 dark:bg-red-900/20"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold">Status:</span>
                    <span className="text-sm">
                      {response.status} {response.statusText}
                    </span>
                  </div>
                  <pre className="text-xs overflow-x-auto">{JSON.stringify(response.data, null, 2)}</pre>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={handleSendRequest} disabled={isLoading} className="gap-2">
              {isLoading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Request
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

import { WorkflowNode, WorkflowEdge } from "./types";
import { nanoid } from "nanoid";

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: "automation" | "data-processing" | "integration" | "monitoring";
  icon: string;
  nodes: Omit<WorkflowNode, "id">[];
  edges: Omit<WorkflowEdge, "id">[];
  tags: string[];
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: "daily-weather-email",
    name: "Daily Weather Email",
    description: "Get daily weather updates sent to your email every morning",
    category: "automation",
    icon: "☀️",
    tags: ["email", "weather", "daily"],
    nodes: [
      {
        type: "customNode",
        position: { x: 100, y: 100 },
        data: {
          label: "Daily Trigger",
          nodeType: "trigger:schedule",
          config: {
            schedule: "0 9 * * *",
          },
          category: "trigger",
          icon: "⏰",
          color: "bg-blue-500",
        },
      },
      {
        type: "customNode",
        position: { x: 100, y: 250 },
        data: {
          label: "Get Weather",
          nodeType: "data:weather",
          config: {
            city: "San Francisco",
          },
          category: "data",
          icon: "🌤️",
          color: "bg-green-500",
        },
      },
      {
        type: "customNode",
        position: { x: 100, y: 400 },
        data: {
          label: "Send Email",
          nodeType: "action:email",
          config: {
            to: "user@example.com",
            subject: "Your Daily Weather Report",
            body: "Temperature: {{temperature}}°C\nConditions: {{conditions}}",
          },
          category: "action",
          icon: "📧",
          color: "bg-purple-500",
        },
      },
    ],
    edges: [
      {
        source: "",
        target: "",
        type: "smoothstep",
        animated: true,
      },
    ],
  },
  {
    id: "github-slack-notification",
    name: "GitHub to Slack",
    description: "Get notified in Slack when new GitHub issues are created",
    category: "integration",
    icon: "🔔",
    tags: ["github", "slack", "notifications"],
    nodes: [
      {
        type: "customNode",
        position: { x: 100, y: 100 },
        data: {
          label: "GitHub Webhook",
          nodeType: "trigger:webhook",
          config: {},
          category: "trigger",
          icon: "🪝",
          color: "bg-blue-500",
        },
      },
      {
        type: "customNode",
        position: { x: 100, y: 250 },
        data: {
          label: "Transform Data",
          nodeType: "logic:transform",
          config: {
            template: '{"text": "New issue: {{title}} by {{user}}"}',
          },
          category: "logic",
          icon: "🔄",
          color: "bg-orange-500",
        },
      },
      {
        type: "customNode",
        position: { x: 100, y: 400 },
        data: {
          label: "HTTP Request to Slack",
          nodeType: "action:http_request",
          config: {
            url: "https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
            method: "POST",
            body: "{{output}}",
          },
          category: "action",
          icon: "🌐",
          color: "bg-purple-500",
        },
      },
    ],
    edges: [],
  },
  {
    id: "ai-content-generator",
    name: "AI Content Generator",
    description: "Generate content with AI and send via email on schedule",
    category: "automation",
    icon: "🤖",
    tags: ["ai", "content", "email"],
    nodes: [
      {
        type: "customNode",
        position: { x: 100, y: 100 },
        data: {
          label: "Weekly Trigger",
          nodeType: "trigger:schedule",
          config: {
            schedule: "0 9 * * 1",
          },
          category: "trigger",
          icon: "⏰",
          color: "bg-blue-500",
        },
      },
      {
        type: "customNode",
        position: { x: 100, y: 250 },
        data: {
          label: "Generate Content",
          nodeType: "logic:ai_summarizer",
          config: {
            prompt: "Generate a weekly newsletter about technology trends",
            model: "gpt-4",
          },
          category: "logic",
          icon: "🧠",
          color: "bg-orange-500",
        },
      },
      {
        type: "customNode",
        position: { x: 100, y: 400 },
        data: {
          label: "Send Newsletter",
          nodeType: "action:email",
          config: {
            to: "subscribers@example.com",
            subject: "Your Weekly Tech Newsletter",
            body: "{{content}}",
          },
          category: "action",
          icon: "📧",
          color: "bg-purple-500",
        },
      },
    ],
    edges: [],
  },
  {
    id: "data-sync-workflow",
    name: "Database Sync",
    description: "Sync data between systems using HTTP requests",
    category: "data-processing",
    icon: "🔄",
    tags: ["sync", "api", "data"],
    nodes: [
      {
        type: "customNode",
        position: { x: 100, y: 100 },
        data: {
          label: "Hourly Trigger",
          nodeType: "trigger:schedule",
          config: {
            schedule: "0 * * * *",
          },
          category: "trigger",
          icon: "⏰",
          color: "bg-blue-500",
        },
      },
      {
        type: "customNode",
        position: { x: 100, y: 250 },
        data: {
          label: "Fetch Data",
          nodeType: "action:http_request",
          config: {
            url: "https://api.example.com/data",
            method: "GET",
          },
          category: "action",
          icon: "🌐",
          color: "bg-purple-500",
        },
      },
      {
        type: "customNode",
        position: { x: 100, y: 400 },
        data: {
          label: "Transform",
          nodeType: "logic:transform",
          config: {
            template: '{"records": {{data}}}',
          },
          category: "logic",
          icon: "🔄",
          color: "bg-orange-500",
        },
      },
      {
        type: "customNode",
        position: { x: 100, y: 550 },
        data: {
          label: "Sync to Destination",
          nodeType: "action:http_request",
          config: {
            url: "https://destination.example.com/sync",
            method: "POST",
            body: "{{output}}",
          },
          category: "action",
          icon: "🌐",
          color: "bg-purple-500",
        },
      },
    ],
    edges: [],
  },
];

export function createWorkflowFromTemplate(template: WorkflowTemplate): {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
} {
  // Generate IDs for all nodes
  const nodeIdMap = new Map<number, string>();
  const nodes: WorkflowNode[] = template.nodes.map((node, index) => {
    const id = nanoid();
    nodeIdMap.set(index, id);
    return {
      ...node,
      id,
    };
  });

  // Create edges connecting consecutive nodes
  const edges: WorkflowEdge[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    edges.push({
      id: nanoid(),
      source: nodes[i].id,
      target: nodes[i + 1].id,
      type: "smoothstep",
      animated: true,
    });
  }

  return { nodes, edges };
}

export function getTemplatesByCategory(category: WorkflowTemplate["category"]) {
  return WORKFLOW_TEMPLATES.filter((t) => t.category === category);
}

export function searchTemplates(query: string) {
  const lowerQuery = query.toLowerCase();
  return WORKFLOW_TEMPLATES.filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

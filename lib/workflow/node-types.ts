import { NodeTypeDefinition } from "./types";

export const NODE_TYPE_DEFINITIONS: Record<string, NodeTypeDefinition> = {
  // ===== TRIGGERS =====
  "trigger:schedule": {
    type: "trigger:schedule",
    category: "trigger",
    label: "Schedule Trigger",
    description: "Run workflow on a schedule",
    icon: "⏰",
    color: "bg-blue-500",
    config: {
      fields: [
        {
          name: "schedule",
          label: "Schedule",
          type: "select",
          required: true,
          options: [
            { label: "Every minute", value: "* * * * *" },
            { label: "Every hour", value: "0 * * * *" },
            { label: "Daily at 9am", value: "0 9 * * *" },
            { label: "Weekly on Monday", value: "0 9 * * 1" },
            { label: "Monthly on 1st", value: "0 9 1 * *" },
          ],
        },
      ],
    },
  },
  "trigger:webhook": {
    type: "trigger:webhook",
    category: "trigger",
    label: "Webhook Trigger",
    description: "Start workflow from HTTP webhook",
    icon: "🔗",
    color: "bg-blue-500",
    config: {
      fields: [],
    },
  },

  // ===== DATA SOURCES =====
  "data:weather": {
    type: "data:weather",
    category: "data",
    label: "Weather Data",
    description: "Fetch weather information",
    icon: "🌤️",
    color: "bg-green-500",
    config: {
      fields: [
        {
          name: "city",
          label: "City",
          type: "text",
          placeholder: "e.g., London",
          required: true,
        },
        {
          name: "units",
          label: "Units",
          type: "select",
          options: [
            { label: "Celsius", value: "metric" },
            { label: "Fahrenheit", value: "imperial" },
          ],
          defaultValue: "metric",
        },
      ],
    },
  },
  "data:github": {
    type: "data:github",
    category: "data",
    label: "GitHub Data",
    description: "Fetch data from GitHub",
    icon: "🐙",
    color: "bg-green-500",
    config: {
      fields: [
        {
          name: "owner",
          label: "Repository Owner",
          type: "text",
          placeholder: "e.g., facebook",
          required: true,
        },
        {
          name: "repo",
          label: "Repository Name",
          type: "text",
          placeholder: "e.g., react",
          required: true,
        },
        {
          name: "dataType",
          label: "Data Type",
          type: "select",
          options: [
            { label: "Commits", value: "commits" },
            { label: "Issues", value: "issues" },
            { label: "Pull Requests", value: "prs" },
          ],
          defaultValue: "commits",
        },
      ],
    },
  },

  // ===== ACTIONS =====
  "action:email": {
    type: "action:email",
    category: "action",
    label: "Send Email",
    description: "Send an email notification",
    icon: "📧",
    color: "bg-purple-500",
    config: {
      fields: [
        {
          name: "to",
          label: "To",
          type: "email",
          placeholder: "recipient@example.com",
          required: true,
        },
        {
          name: "subject",
          label: "Subject",
          type: "text",
          placeholder: "Email subject",
          required: true,
          description: "Use {{variable}} for dynamic values",
        },
        {
          name: "body",
          label: "Body",
          type: "textarea",
          placeholder: "Email content...",
          required: true,
          description: "Supports HTML and {{variable}} syntax",
        },
      ],
    },
  },
  "action:http_request": {
    type: "action:http_request",
    category: "action",
    label: "HTTP Request",
    description: "Make an HTTP request",
    icon: "🌐",
    color: "bg-purple-500",
    config: {
      fields: [
        {
          name: "url",
          label: "URL",
          type: "text",
          placeholder: "https://api.example.com/endpoint",
          required: true,
        },
        {
          name: "method",
          label: "Method",
          type: "select",
          options: [
            { label: "GET", value: "GET" },
            { label: "POST", value: "POST" },
            { label: "PUT", value: "PUT" },
            { label: "DELETE", value: "DELETE" },
          ],
          defaultValue: "GET",
        },
      ],
    },
  },

  // ===== LOGIC =====
  "logic:ai_summarizer": {
    type: "logic:ai_summarizer",
    category: "logic",
    label: "AI Summarizer",
    description: "Summarize text with AI",
    icon: "🤖",
    color: "bg-orange-500",
    config: {
      fields: [
        {
          name: "prompt",
          label: "Prompt",
          type: "textarea",
          placeholder: "Summarize this in 3 bullet points...",
          required: true,
        },
        {
          name: "textToSummarize",
          label: "Text to Summarize",
          type: "textarea",
          placeholder: "Use {{variable}} to reference previous data",
          required: true,
        },
      ],
    },
  },
  "logic:transform": {
    type: "logic:transform",
    category: "logic",
    label: "Transform Data",
    description: "Transform and manipulate data",
    icon: "🔄",
    color: "bg-orange-500",
    config: {
      fields: [
        {
          name: "transformType",
          label: "Transform Type",
          type: "select",
          options: [
            { label: "Uppercase", value: "uppercase" },
            { label: "Lowercase", value: "lowercase" },
            { label: "Extract Number", value: "extract_number" },
          ],
          required: true,
        },
        {
          name: "field",
          label: "Field to Transform",
          type: "text",
          placeholder: "e.g., text",
          required: true,
        },
      ],
    },
  },
};

export const getNodeTypesByCategory = (category: string) => {
  return Object.values(NODE_TYPE_DEFINITIONS).filter((node) => node.category === category);
};

export const getNodeTypeDefinition = (type: string) => {
  return NODE_TYPE_DEFINITIONS[type];
};

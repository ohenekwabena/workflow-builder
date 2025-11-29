import { NodeHandler, NodeExecutionContext } from "./types";

// ===== TRIGGER HANDLERS =====

export const scheduleTrigerHandler: NodeHandler = {
  type: "trigger:schedule",
  execute: async (config, input, context) => {
    // Triggers are handled by cron system
    // This just returns trigger data
    return {
      triggered_at: new Date().toISOString(),
      trigger_type: "schedule",
      ...input,
    };
  },
};

export const webhookTriggerHandler: NodeHandler = {
  type: "trigger:webhook",
  execute: async (config, input, context) => {
    return {
      triggered_at: new Date().toISOString(),
      trigger_type: "webhook",
      payload: input,
    };
  },
};

// ===== DATA SOURCE HANDLERS =====

export const weatherDataHandler: NodeHandler = {
  type: "data:weather",
  execute: async (config, input, context) => {
    const { city, units = "metric" } = config;
    const apiKey = process.env.OPENWEATHER_API_KEY;

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${units}&appid=${apiKey}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch weather data");
    }

    const data = await response.json();

    return {
      temperature: data.main.temp,
      description: data.weather[0].description,
      humidity: data.main.humidity,
      city: data.name,
      country: data.sys.country,
    };
  },
};

export const githubDataHandler: NodeHandler = {
  type: "data:github",
  execute: async (config, input, context) => {
    const { repo, owner, dataType = "commits" } = config;

    // Get user's GitHub token from integrations
    const githubToken = context.integrations.github?.access_token;

    if (!githubToken) {
      throw new Error("GitHub integration not connected");
    }

    let url = `https://api.github.com/repos/${owner}/${repo}`;

    switch (dataType) {
      case "commits":
        url += "/commits";
        break;
      case "issues":
        url += "/issues";
        break;
      case "prs":
        url += "/pulls";
        break;
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch GitHub data");
    }

    return await response.json();
  },
};

// ===== ACTION HANDLERS =====

export const emailActionHandler: NodeHandler = {
  type: "action:email",
  execute: async (config, input, context) => {
    const { to, subject, body } = config;

    // Use template variables from input
    const processedBody = replaceTemplateVars(body, input);
    const processedSubject = replaceTemplateVars(subject, input);

    // Send via Resend
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "workflows@yourdomain.com",
        to,
        subject: processedSubject,
        html: processedBody,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send email");
    }

    const result = await response.json();

    return {
      email_id: result.id,
      sent_to: to,
      sent_at: new Date().toISOString(),
    };
  },
};

export const httpRequestHandler: NodeHandler = {
  type: "action:http_request",
  execute: async (config, input, context) => {
    const { url, method = "GET", headers = {}, body } = config;

    if (!url) {
      throw new Error("HTTP Request node requires a URL");
    }

    const processedUrl = replaceTemplateVars(url, input);
    const processedBody = body ? replaceTemplateVars(JSON.stringify(body), input) : undefined;

    const response = await fetch(processedUrl, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: processedBody,
    });

    const data = await response.json();

    return {
      status: response.status,
      data,
    };
  },
};

// ===== LOGIC HANDLERS =====

export const aiSummarizerHandler: NodeHandler = {
  type: "logic:ai_summarizer",
  execute: async (config, input, context) => {
    const { prompt, textToSummarize } = config;
    const Anthropic = require("@anthropic-ai/sdk");

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // If textToSummarize is a template, use it; otherwise use the entire input data
    let textContent = textToSummarize ? replaceTemplateVars(textToSummarize, input) : JSON.stringify(input, null, 2);

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `${prompt}\n\nText to summarize:\n${textContent}`,
        },
      ],
    });

    return {
      summary: message.content[0].text,
    };
  },
};

export const transformHandler: NodeHandler = {
  type: "logic:transform",
  execute: async (config, input, context) => {
    const { transformType, field } = config;

    switch (transformType) {
      case "uppercase":
        return { result: input[field]?.toString().toUpperCase() };
      case "lowercase":
        return { result: input[field]?.toString().toLowerCase() };
      case "extract_number":
        return { result: parseFloat(input[field]) };
      default:
        return input;
    }
  },
};

// ===== HELPER FUNCTIONS =====

function replaceTemplateVars(template: string, data: any): string {
  if (!template || typeof template !== "string") {
    return template || "";
  }
  return template.replace(/\{\{(.+?)\}\}/g, (match, path) => {
    const value = path.split(".").reduce((obj: any, key: string) => obj?.[key], data);
    return value !== undefined ? String(value) : match;
  });
}

// ===== REGISTRY =====

export const NODE_HANDLERS: Record<string, NodeHandler> = {
  "trigger:schedule": scheduleTrigerHandler,
  "trigger:webhook": webhookTriggerHandler,
  "data:weather": weatherDataHandler,
  "data:github": githubDataHandler,
  "action:email": emailActionHandler,
  "action:http_request": httpRequestHandler,
  "logic:ai_summarizer": aiSummarizerHandler,
  "logic:transform": transformHandler,
};

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

    if (!to) {
      throw new Error("Email node requires a 'to' address");
    }

    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }

    // Use template variables from input
    const processedBody = replaceTemplateVars(body, input);
    const processedSubject = replaceTemplateVars(subject, input);

    // Wrap body in styled email template
    const styledHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
            .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .email-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center; }
            .email-header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; }
            .email-body { padding: 40px 30px; color: #374151; line-height: 1.6; }
            .email-footer { background-color: #f9fafb; padding: 20px 30px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
            h2 { color: #1f2937; margin-top: 0; }
            p { margin: 12px 0; }
            a { color: #667eea; text-decoration: none; }
            .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <h1>🔄 Workflow Notification</h1>
            </div>
            <div class="email-body">
              ${processedBody}
            </div>
            <div class="email-footer">
              <p>This email was sent by your automated workflow.</p>
              <p style="margin-top: 8px;">Powered by Workflow Builder</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send via Resend
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Workflow Notifications <workflows@notifications.ohenekwabena.xyz>",
        to,
        subject: processedSubject,
        html: styledHtml,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Failed to send email: ${errorData.message || response.statusText} (Status: ${response.status})`);
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

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Try to parse as JSON, fall back to text if it fails
    const contentType = response.headers.get("content-type") || "";
    let data;

    if (contentType.includes("application/json")) {
      try {
        data = await response.json();
      } catch (error) {
        // If JSON parsing fails, get text instead
        data = await response.text();
      }
    } else {
      // Non-JSON response, return as text
      data = await response.text();
    }

    return {
      status: response.status,
      statusText: response.statusText,
      contentType: contentType,
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

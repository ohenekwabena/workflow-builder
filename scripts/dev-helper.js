#!/usr/bin/env node

/**
 * Development Helper Script
 *
 * Quick commands for workflow builder development
 */

const commands = {
  dev: "npm run dev",
  build: "npm run build",
  start: "npm start",
  test: "npm run test:workflow",
};

const help = `
🎨 Workflow Builder - Dev Commands
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 Development:
  npm run dev          Start development server
  npm run build        Build for production
  npm run start        Start production server

🧪 Testing:
  npm run test:workflow    Test workflow execution

📚 Documentation:
  - WORKFLOW_BUILDER.md       Complete features documentation
  - QUICK_START.md            Step-by-step user guide
  - IMPLEMENTATION_SUMMARY.md Technical implementation details

🚀 Quick Start:
  1. npm run dev
  2. Navigate to http://localhost:3000
  3. Sign up / Login
  4. Go to /protected/workflows
  5. Click "New Workflow"
  6. Start building!

🔑 Environment Variables Required:
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY
  - RESEND_API_KEY (for email)
  - OPENWEATHER_API_KEY (for weather)
  - ANTHROPIC_API_KEY (for AI)

🎯 Example Workflows:
  1. Daily Weather Email
     Schedule → Weather → Email
  
  2. GitHub Weekly Digest
     Schedule → GitHub → AI Summarizer → Email
  
  3. HTTP Monitor
     Schedule → HTTP Request → Transform → Email

📖 Node Types Available:
  Triggers:  ⏰ Schedule, 🔗 Webhook
  Data:      🌤️ Weather, 🐙 GitHub
  Actions:   📧 Email, 🌐 HTTP
  Logic:     🤖 AI Summarizer, 🔄 Transform

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

console.log(help);

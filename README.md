<a href="https://demo-nextjs-with-supabase.vercel.app/">
  <h1 align="center">🎨 Visual Workflow Builder</h1>
</a>

<p align="center">
 A powerful visual automation workflow builder with Next.js, React Flow, and Supabase
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#quick-start"><strong>Quick Start</strong></a> ·
  <a href="#node-types"><strong>Node Types</strong></a> ·
  <a href="#documentation"><strong>Documentation</strong></a> ·
  <a href="#examples"><strong>Examples</strong></a>
</p>
<br/>

## 🚀 Features

### Visual Workflow Builder
- **Drag-and-drop canvas** powered by React Flow
- **Real-time node connections** with smooth animations
- **Beautiful UI** with Aceternity UI and Shadcn components
- **Dark mode support** out of the box
- **Responsive design** for all screen sizes

### Node Types Available
- **⏰ Triggers**: Schedule (cron), Webhooks
- **📊 Data Sources**: Weather API, GitHub API
- **🎯 Actions**: Email, HTTP Requests
- **🧠 Logic**: AI Summarizer (Claude), Data Transform

### Execution Engine
- **Background processing** with queue system
- **Step-by-step execution** tracking
- **Error handling** with detailed logs
- **Manual and scheduled** execution
- **Webhook support** for external triggers

### User Experience
- **Dynamic variables** with `{{variable}}` syntax
- **Node configuration panel** with form validation
- **Execution history** with detailed logs
- **Onboarding tooltips** for new users
- **Real-time status updates**

## 🎯 Quick Start

### 1. Installation

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# External Services (Optional)
RESEND_API_KEY=your_resend_api_key           # For email nodes
OPENWEATHER_API_KEY=your_openweather_api_key # For weather nodes
ANTHROPIC_API_KEY=your_anthropic_api_key     # For AI nodes
```

### 3. Start Development Server

```bash
npm run dev
```

### 4. Access the App

Navigate to `http://localhost:3000`

1. Sign up / Login
2. Go to `/protected/workflows`
3. Click "New Workflow"
4. Start building!

## 📚 Node Types

### Triggers (Blue)
- **⏰ Schedule Trigger**: Run workflows on a cron schedule
- **🔗 Webhook Trigger**: Start workflows via HTTP webhooks

### Data Sources (Green)
- **🌤️ Weather Data**: Fetch weather information for any city
- **🐙 GitHub Data**: Get commits, issues, or pull requests

### Actions (Purple)
- **📧 Send Email**: Send emails with dynamic templates
- **🌐 HTTP Request**: Make HTTP requests to external APIs

### Logic (Orange)
- **🤖 AI Summarizer**: Summarize text using Claude AI
- **🔄 Transform Data**: Manipulate data (uppercase, lowercase, extract numbers)

## 💡 Example Workflows

### Daily Weather Briefing
```
Schedule (9am) → Weather Data → Send Email
```

### GitHub Weekly Digest
```
Schedule (Monday) → GitHub Data → AI Summarizer → Send Email
```

### HTTP API Monitor
```
Schedule (hourly) → HTTP Request → Transform → Send Email (if error)
```

## 📖 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Step-by-step user guide
- **[WORKFLOW_BUILDER.md](./WORKFLOW_BUILDER.md)** - Complete feature documentation
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Technical details

## 🎨 UI Components

### Pages
- `/protected/workflows` - Workflow dashboard
- `/protected/workflows/[id]` - Workflow editor canvas
- `/protected/workflows/[id]/executions` - Execution history
- `/protected/executions/[id]` - Execution details

### Components
- `WorkflowCanvas` - Main React Flow canvas
- `CustomNode` - Animated node component
- `NodeLibrary` - Searchable node picker
- `NodeConfigPanel` - Configuration side panel
- `WorkflowList` - Dashboard with workflow cards

## 🔧 Tech Stack

- **Frontend**: Next.js 15, React 19
- **Canvas**: React Flow
- **State**: Zustand
- **Animation**: Framer Motion
- **Styling**: Tailwind CSS
- **Components**: Shadcn UI + Aceternity UI
- **Backend**: Next.js API Routes
- **Database**: Supabase
- **Queue**: Upstash Redis

## 🚀 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-repo)

### Environment Variables

Make sure to set all required environment variables in your Vercel project settings.

## 📝 Dynamic Variables

Use `{{variable}}` syntax to reference data from previous nodes:

```
Subject: Weather in {{city}}
Body: Current temperature: {{temperature}}°C
Conditions: {{description}}
```

## 🛠️ Development

### Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run help         # Show dev commands
```

### Project Structure

```
├── app/
│   ├── api/                    # API routes
│   └── protected/
│       ├── workflows/          # Workflow pages
│       └── executions/         # Execution pages
├── components/
│   ├── ui/                     # Shadcn components
│   └── workflow/               # Workflow components
├── lib/
│   ├── execution/              # Execution engine
│   ├── workflow/               # Types & state
│   └── supabase/               # Supabase client
└── scripts/                    # Helper scripts
```

## 🤝 Contributing

Contributions are welcome! Please read the documentation first.

## 📄 License

MIT

## 🙏 Acknowledgments

- [React Flow](https://reactflow.dev/) for the canvas
- [Shadcn UI](https://ui.shadcn.com/) for components
- [Aceternity UI](https://ui.aceternity.com/) for enhanced components
- [Supabase](https://supabase.com/) for backend services

---

**Built with ❤️ using Next.js, React Flow, and Supabase**

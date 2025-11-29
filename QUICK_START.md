# Workflow Builder - Quick Start Guide

## 🚀 Getting Started

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Access the Application

Navigate to: `http://localhost:3000`

### 3. Sign Up / Login

- Go to `/auth/sign-up` to create an account
- Or login at `/auth/login` if you have an account

### 4. Create Your First Workflow

1. After logging in, you'll be redirected to `/protected/workflows`
2. Click the **"New Workflow"** button
3. You'll be taken to the workflow editor

## 🎨 Building a Workflow

### Adding Nodes

1. Click the **"Add Node"** button in the top toolbar
2. Browse or search for node types
3. Click on a node type to add it to the canvas
4. The node will appear on the canvas

### Configuring Nodes

1. Click the **Settings icon** (⚙️) on any node
2. A configuration panel will slide in from the right
3. Fill in the required fields
4. Click **"Done"** when finished

### Connecting Nodes

1. Click and drag from the **right handle** of one node
2. Drop on the **left handle** of another node
3. A connection line will appear

### Example: Simple Weather Email Workflow

1. **Add a Schedule Trigger**
   - Set schedule to "Daily at 9am"

2. **Add Weather Data node**
   - Configure city: "London"
   - Units: "Celsius"

3. **Add Send Email node**
   - To: "your@email.com"
   - Subject: "Daily Weather Update"
   - Body: "The temperature in {{city}} is {{temperature}}°C. {{description}}"

4. **Connect the nodes**: Trigger → Weather → Email

5. **Save and Run**

## 📝 Dynamic Variables

Use `{{variable}}` syntax to reference data from previous nodes:

### Weather Data Output:
- `{{temperature}}`
- `{{description}}`
- `{{humidity}}`
- `{{city}}`
- `{{country}}`

### GitHub Data Output:
- `{{commits}}` (array)
- `{{issues}}` (array)
- `{{prs}}` (array)

### Example Templates:

```text
Subject: Weather in {{city}}
Body: Current temperature: {{temperature}}°C
Conditions: {{description}}
Humidity: {{humidity}}%
```

```text
Subject: GitHub Activity for {{repo}}
Body: Recent commits:
{{commits[0].message}}
{{commits[1].message}}
```

## 🎯 Available Node Types

### Triggers (Blue)
- **⏰ Schedule Trigger** - Run on a schedule
- **🔗 Webhook Trigger** - Start from HTTP webhook

### Data Sources (Green)
- **🌤️ Weather Data** - Fetch weather info
- **🐙 GitHub Data** - Get repo activity

### Actions (Purple)
- **📧 Send Email** - Send notifications
- **🌐 HTTP Request** - Call external APIs

### Logic (Orange)
- **🤖 AI Summarizer** - Summarize with Claude
- **🔄 Transform Data** - Manipulate data

## 💾 Saving & Running

### Save Workflow
Click the **"Save"** button in the toolbar to persist changes.

### Run Workflow
Click the **"Run Workflow"** button to execute immediately.

### View Executions
Click **"View Executions"** to see execution history.

## 🔍 Viewing Execution History

1. From the workflow editor, click **"View Executions"**
2. See all past runs with status (success/failed)
3. Click on any execution to see detailed logs
4. View input/output for each node step

## 🎛️ Keyboard Shortcuts

- **Delete** - Delete selected node
- **Ctrl/Cmd + Z** - Undo (coming soon)
- **Ctrl/Cmd + C/V** - Copy/Paste (coming soon)

## 🐛 Troubleshooting

### Workflow Won't Save
- Check if you're logged in
- Ensure at least one node is on the canvas

### Node Configuration Not Showing
- Click directly on the settings icon
- Make sure the node is selected

### Execution Failed
- Check node configurations are complete
- View execution details for error messages
- Ensure integrations are connected (for GitHub, etc.)

## 📚 Example Workflows

### 1. Daily Weather Briefing
```
Schedule (9am) → Weather Data → Send Email
```

### 2. GitHub Weekly Digest
```
Schedule (Monday) → GitHub Data → AI Summarizer → Send Email
```

### 3. HTTP API Monitor
```
Schedule (every hour) → HTTP Request → Transform → Send Email (if error)
```

## 🔐 Environment Variables

Make sure these are set in `.env.local`:

```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email (for Send Email node)
RESEND_API_KEY=your_resend_api_key

# Weather (for Weather Data node)
OPENWEATHER_API_KEY=your_openweather_api_key

# AI (for AI Summarizer node)
ANTHROPIC_API_KEY=your_anthropic_api_key
```

## 🚀 Next Steps

1. **Add More Node Types** - Create custom nodes in `lib/workflow/node-types.ts`
2. **Connect Real Services** - Set up API keys for email, weather, etc.
3. **Set Up Cron Jobs** - Configure schedule triggers
4. **Add Integrations** - Connect GitHub, Google Calendar, etc.
5. **Create Templates** - Build reusable workflow templates

## 📖 Documentation

- Full documentation: `WORKFLOW_BUILDER.md`
- API documentation: Check `app/api/` routes
- Node handlers: `lib/execution/node-handlers/index.ts`

## 💡 Tips

- Start with simple workflows
- Test each node individually
- Use the execution history to debug
- Save frequently
- Use meaningful node labels
- Document complex workflows

Happy automating! 🎉

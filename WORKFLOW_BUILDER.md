# Workflow Builder UI

A visual workflow builder built with React Flow, Next.js, and Aceternity UI components.

## Features

### ✨ Visual Canvas
- Drag-and-drop node-based workflow builder
- Real-time connection between nodes
- Zoom, pan, and minimap controls
- Auto-layout and grid snapping

### 🎯 Node Types

#### Triggers
- **Schedule Trigger**: Run workflows on a schedule (cron)
- **Webhook Trigger**: Start workflow from HTTP webhook

#### Data Sources
- **Weather Data**: Fetch weather information for any city
- **GitHub Data**: Get commits, issues, or PRs from repositories

#### Actions
- **Send Email**: Send email notifications with dynamic templates
- **HTTP Request**: Make HTTP requests to external APIs

#### Logic
- **AI Summarizer**: Summarize text using Claude AI
- **Transform Data**: Transform and manipulate data (uppercase, lowercase, extract numbers)

### 🎨 UI Components

- **Node Library**: Searchable modal with all available node types
- **Node Config Panel**: Side panel for configuring node settings
- **Custom Nodes**: Beautiful, animated nodes with category-specific colors
- **Workflow List**: Dashboard view of all workflows
- **Execution History**: View past workflow executions with detailed logs

### 🔧 Dynamic Variables

Use `{{variable}}` syntax in node configurations to reference data from previous nodes:

```
Subject: Weather Update for {{city}}
Body: The temperature in {{city}} is {{temperature}}°C
```

## Pages

- `/protected/workflows` - List all workflows
- `/protected/workflows/[id]` - Edit workflow canvas
- `/protected/workflows/[id]/executions` - View workflow executions
- `/protected/executions/[id]` - View execution details

## Components

### Core Components
- `WorkflowCanvas` - Main React Flow canvas
- `CustomNode` - Individual node component
- `NodeLibrary` - Modal for adding new nodes
- `NodeConfigPanel` - Side panel for node configuration
- `WorkflowList` - Dashboard with workflow cards

### Supporting Files
- `lib/workflow/types.ts` - TypeScript types
- `lib/workflow/node-types.ts` - Node type definitions
- `lib/workflow/store.ts` - Zustand state management

## Usage

1. Navigate to `/protected/workflows`
2. Click "New Workflow" to create a workflow
3. Click "Add Node" to open the node library
4. Select a node type to add to the canvas
5. Click on a node to configure its settings
6. Connect nodes by dragging from output handles to input handles
7. Click "Save" to persist changes
8. Click "Run Workflow" to execute

## Node Configuration

Each node has specific configuration fields:

### Schedule Trigger
- Schedule: Select from predefined intervals

### Weather Data
- City: City name
- Units: Metric or Imperial

### GitHub Data
- Owner: Repository owner
- Repo: Repository name
- Data Type: commits, issues, or prs

### Send Email
- To: Recipient email
- Subject: Email subject (supports {{variables}})
- Body: Email content (supports HTML and {{variables}})

### AI Summarizer
- Prompt: Instructions for the AI
- Text to Summarize: Content to summarize (supports {{variables}})

## Architecture

The workflow builder uses:
- **React Flow** for the canvas and node management
- **Zustand** for state management
- **Framer Motion** for animations
- **Shadcn UI** for base components
- **Aceternity UI** for enhanced components
- **Tailwind CSS** for styling

## Next Steps

The UI is now complete! You can:
1. Test the workflow creation and editing
2. Connect real integrations (GitHub, email services)
3. Add more node types as needed
4. Enhance the execution monitoring
5. Add workflow templates
6. Implement workflow sharing/export

## API Integration

The UI integrates with these API endpoints:
- `GET /api/workflows` - List workflows
- `POST /api/workflows` - Create workflow
- `GET /api/workflows/[id]` - Get workflow
- `PATCH /api/workflows/[id]` - Update workflow
- `DELETE /api/workflows/[id]` - Delete workflow
- `POST /api/workflows/[id]/execute` - Execute workflow
- `GET /api/workflows/[id]/executions` - List executions
- `GET /api/executions/[id]` - Get execution details

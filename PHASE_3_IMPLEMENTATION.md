# Phase 3 - Advanced Features Implementation Guide

## Overview
Phase 3 adds advanced features including real-time execution visualization, scheduled triggers, webhook testing, execution history, and workflow templates.

## Features Implemented

### 1. Real-time Execution Visualization
**Location:** `components/execution/live-execution-panel.tsx`

#### Features:
- Live updates using Supabase Realtime
- Step-by-step execution progress
- Real-time status indicators (pending, running, completed, failed)
- Output display for each step
- Error message display
- Final execution result

#### Usage:
```tsx
import { LiveExecutionPanel } from "@/components/execution/live-execution-panel";

<LiveExecutionPanel
  executionId={executionId}
  workflowNodes={nodes}
  onClose={() => setActiveExecutionId(null)}
/>
```

#### Integration:
- Automatically subscribes to execution updates via Supabase Realtime
- Updates UI as each step completes
- Shows progress bars for running steps
- Displays output/errors inline

---

### 2. Scheduled Triggers with Cron
**Location:** `components/workflow/schedule-trigger-modal.tsx`

#### Features:
- Cron expression editor with validation
- Human-readable cron descriptions
- Quick preset schedules:
  - Every minute
  - Every hour
  - Daily at 9 AM
  - Weekly (Mondays at 9 AM)
  - Monthly (1st of month)
- Next 5 scheduled runs preview
- Cron syntax help

#### Dependencies:
- `cron-parser`: Parse and validate cron expressions
- `cronstrue`: Convert cron to human-readable text

#### Usage:
```tsx
import { ScheduleTriggerModal } from "@/components/workflow/schedule-trigger-modal";

<ScheduleTriggerModal
  workflowId={workflowId}
  currentSchedule={workflow?.trigger_config?.schedule}
  onClose={() => setShowScheduleModal(false)}
  onSave={handleSaveSchedule}
/>
```

---

### 3. Webhook Testing Interface
**Location:** `components/workflow/webhook-testing-modal.tsx`

#### Features:
- Monaco code editor for JSON payload editing
- Send test requests to webhook endpoint
- Response display with status code
- cURL command generator with copy button
- Syntax highlighting for JSON
- Error handling and display

#### Dependencies:
- `@monaco-editor/react`: Code editor
- `copy-to-clipboard`: Copy functionality

#### Usage:
```tsx
import { WebhookTestingModal } from "@/components/workflow/webhook-testing-modal";

<WebhookTestingModal
  webhookUrl={webhookUrl}
  onClose={() => setShowWebhookModal(false)}
/>
```

#### Workflow:
1. Click "Create Webhook" button in workflow editor
2. System generates unique webhook URL
3. Click "Test Webhook" to open testing modal
4. Edit JSON payload
5. Send test request
6. View response

---

### 4. Execution History Viewer
**Locations:**
- `app/protected/workflows/[id]/executions/page.tsx` - List view
- `app/protected/executions/[id]/page.tsx` - Detail view
- `components/execution/execution-status-badge.tsx` - Status indicator

#### Features:

**List View:**
- All executions for a workflow
- Auto-refresh every 5 seconds
- Status badges (queued, running, completed, failed)
- Trigger type indicators
- Timestamp displays
- Error messages inline
- Click to view details

**Detail View:**
- Full execution information
- Step-by-step breakdown
- Output for each step
- Error messages
- Final result
- Execution timeline
- Auto-refresh for running executions

#### Status Badge:
```tsx
<ExecutionStatusBadge status="running" size="md" />
```

Sizes: `sm`, `md`, `lg`
Statuses: `queued`, `running`, `completed`, `failed`

---

### 5. Workflow Templates
**Locations:**
- `lib/workflow/templates.ts` - Template definitions
- `components/workflow/template-library-modal.tsx` - UI

#### Built-in Templates:

1. **Daily Weather Email**
   - Category: Automation
   - Schedule trigger → Weather API → Email
   
2. **GitHub to Slack**
   - Category: Integration
   - Webhook → Transform → HTTP to Slack
   
3. **AI Content Generator**
   - Category: Automation
   - Weekly schedule → AI generation → Email
   
4. **Database Sync**
   - Category: Data Processing
   - Hourly trigger → Fetch → Transform → Sync

#### Features:
- Search functionality
- Category filtering (automation, data-processing, integration, monitoring)
- Tag-based discovery
- One-click workflow creation
- Pre-configured nodes and connections

#### Usage:
```tsx
import { TemplateLibraryModal } from "@/components/workflow/template-library-modal";

<TemplateLibraryModal
  onClose={() => setShowTemplates(false)}
  onSelectTemplate={handleCreateFromTemplate}
/>
```

---

## Real-time System Architecture

### Realtime Subscription Class
**Location:** `lib/execution/realtime.ts`

#### Features:
- Singleton pattern for connection management
- Subscribe to execution updates
- Subscribe to step updates
- Subscribe to all workflow executions
- Automatic cleanup

#### Example:
```typescript
import { getRealtimeSubscription } from "@/lib/execution/realtime";

const realtime = getRealtimeSubscription();

const unsubscribe = realtime.subscribeToExecution(executionId, {
  onExecutionUpdate: (update) => {
    console.log("Execution status:", update.status);
  },
  onStepUpdate: (update) => {
    console.log("Step completed:", update.node_id);
  },
  onComplete: (result) => {
    console.log("Final result:", result);
  },
  onError: (error) => {
    console.error("Execution failed:", error);
  },
});

// Cleanup
return () => unsubscribe();
```

---

## Integration Points

### Workflow Editor Page
**File:** `app/protected/workflows/[id]/page.tsx`

Added buttons:
- **Schedule** - Opens schedule modal
- **Create/Test Webhook** - Webhook management
- **Run Now** - Execute with live panel
- **View Executions** - Navigate to history

### Workflow List Page
**File:** `components/workflow/workflow-list.tsx`

Added:
- **Templates** button - Opens template library
- Template selection creates workflow

---

## API Endpoints Used

### Workflows:
- `GET /api/workflows/:id` - Fetch workflow
- `PATCH /api/workflows/:id` - Update (including schedule)
- `POST /api/workflows/:id/execute` - Run workflow
- `GET /api/workflows/:id/executions` - List executions

### Webhooks:
- `POST /api/workflows/:id/webhook` - Create webhook
- `GET /api/workflows/:id/webhook` - Get webhook info
- `POST /api/webhooks/:token` - Trigger webhook

### Executions:
- `GET /api/executions/:id` - Get execution details

---

## Database Requirements

### Realtime Subscriptions:
Tables must have realtime enabled in Supabase:
- `workflow_executions`
- `workflow_execution_steps`

Enable in Supabase Dashboard:
1. Go to Database → Replication
2. Enable realtime for these tables

### Required Tables:
- `workflows` - Workflow definitions
- `workflow_executions` - Execution records
- `workflow_execution_steps` - Step-by-step logs
- `webhook_endpoints` - Webhook URLs and tokens
- `user_profiles` - User information

---

## Environment Variables

No additional environment variables needed. Uses existing Supabase configuration.

---

## Usage Guide

### For End Users:

#### Creating a Workflow from Template:
1. Navigate to "My Workflows"
2. Click "Templates" button
3. Browse or search templates
4. Click a template card
5. Workflow is created with pre-configured nodes

#### Scheduling a Workflow:
1. Open workflow editor
2. Click "Schedule" button
3. Enter cron expression or select preset
4. View next run times
5. Click "Save Schedule"

#### Testing Webhooks:
1. Open workflow editor
2. Click "Create Webhook" (first time)
3. Copy webhook URL
4. Click "Test Webhook"
5. Edit JSON payload
6. Click "Send Request"
7. View response

#### Monitoring Executions:
1. Click "Run Now" in workflow editor
2. Live panel opens showing progress
3. Watch steps execute in real-time
4. View outputs and errors
5. See final result

#### Viewing History:
1. Click "View Executions" in workflow editor
2. Browse all past executions
3. Click an execution to see details
4. View step-by-step breakdown
5. Check outputs and errors

---

## Troubleshooting

### Realtime Not Working:
1. Check Supabase Realtime is enabled for tables
2. Verify user has read permissions on tables
3. Check browser console for connection errors
4. Ensure websocket connection is not blocked

### Schedule Not Triggering:
1. Verify cron expression is valid
2. Check workflow is active (`is_active = true`)
3. Ensure background worker is running
4. Check server logs for errors

### Webhook Not Receiving:
1. Verify webhook URL is correct
2. Check webhook is active in database
3. Ensure request Content-Type is `application/json`
4. Check API logs for errors

---

## Next Steps

Phase 3 is complete! The system now has:
- ✅ Real-time execution monitoring
- ✅ Scheduled triggers
- ✅ Webhook testing
- ✅ Execution history
- ✅ Workflow templates

### Potential Enhancements:
- Add more workflow templates
- Implement execution retry logic
- Add execution logs export
- Create webhook request logs
- Add execution analytics dashboard
- Implement conditional branching in workflows
- Add parallel execution support

---

## Testing Checklist

- [ ] Create workflow from template
- [ ] Set up schedule trigger
- [ ] Create and test webhook
- [ ] Execute workflow manually
- [ ] Watch live execution panel
- [ ] View execution history
- [ ] Check execution details
- [ ] Verify real-time updates work
- [ ] Test cron validation
- [ ] Test webhook with different payloads
- [ ] Verify Monaco editor works
- [ ] Test template search and filter
- [ ] Check error handling

---

## Performance Considerations

1. **Realtime Connections:**
   - One websocket per execution
   - Automatically cleaned up on unmount
   - Pooled by Supabase client

2. **Polling:**
   - Execution list refreshes every 5s
   - Detail view refreshes every 3s
   - Can be disabled for completed executions

3. **Monaco Editor:**
   - Lazy loaded
   - Only loaded when webhook modal opens
   - ~2MB initial load

---

## Security Notes

1. **Webhooks:**
   - URLs contain unique tokens
   - Tokens are UUIDs (128-bit random)
   - Can be regenerated if compromised
   - Rate limiting should be implemented

2. **Realtime:**
   - RLS policies enforced
   - Users can only see their own executions
   - Websocket authenticated with JWT

3. **Cron Schedules:**
   - Validated before saving
   - Server-side validation required
   - User cannot set execution time in past

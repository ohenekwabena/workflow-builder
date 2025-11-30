# Node Output Structure Documentation

This document describes the data structure output by each node type in the workflow execution engine.

## Overview

Each node in a workflow receives input data from previous nodes and produces output data that flows to subsequent nodes. The output structure varies by node type.

### Trigger Node Behavior

**Important**: When a workflow is executed manually (via "Run Now" button), all trigger nodes are automatically skipped. The execution starts from the nodes immediately after the trigger nodes, using the provided input data. This allows you to test and run workflows without waiting for scheduled triggers or webhook events.

- **Manual Execution**: Trigger nodes are skipped, execution starts from downstream nodes
- **Webhook Execution**: Webhook trigger node is executed with the webhook payload
- **Schedule Execution**: Schedule trigger node is executed when the cron schedule fires

## Node Types and Output Structures

### 1. Trigger Nodes

#### `trigger:webhook`
Receives HTTP webhook payloads and wraps them with metadata.

**Output Structure:**
```json
{
  "payload": {
    // Original webhook payload data
    "message": "Hello, World!",
    "timestamp": "2024-01-01T00:00:00Z"
  },
  "trigger_type": "webhook",
  "triggered_at": "2025-11-29T23:56:02.339Z"
}
```

**Fields:**
- `payload` (object): The original data sent to the webhook endpoint
- `trigger_type` (string): Always "webhook" for webhook triggers
- `triggered_at` (string): ISO 8601 timestamp when the trigger was activated

#### `trigger:schedule`
Triggers workflow execution on a schedule (cron-based).

**Output Structure:**
```json
{
  "trigger_type": "schedule",
  "triggered_at": "2025-11-29T12:00:00.000Z",
  "schedule_config": {
    "cron": "0 12 * * *",
    "timezone": "UTC"
  }
}
```

**Fields:**
- `trigger_type` (string): Always "schedule" for scheduled triggers
- `triggered_at` (string): ISO 8601 timestamp when the trigger fired
- `schedule_config` (object): The cron configuration that triggered this execution

#### `trigger:manual`
Manually triggered workflow execution.

**Output Structure:**
```json
{
  "trigger_type": "manual",
  "triggered_at": "2025-11-29T14:30:00.000Z",
  "triggered_by": "user_id_here"
}
```

**Fields:**
- `trigger_type` (string): Always "manual" for manual triggers
- `triggered_at` (string): ISO 8601 timestamp when manually triggered
- `triggered_by` (string): User ID who triggered the execution

---

### 2. Logic Nodes

#### `logic:transform`
Transforms input data using specified operations (uppercase, lowercase, etc.).

**Output Structure:**
```json
{
  "result": "HELLO, WORLD!",
  "original": "Hello, World!",
  "transformType": "uppercase"
}
```

**Fields:**
- `result` (any): The transformed data result
- `original` (any): The original input data before transformation
- `transformType` (string): The type of transformation applied

#### `logic:filter`
Filters data based on conditions.

**Output Structure:**
```json
{
  "passed": true,
  "input": { /* original data */ },
  "condition": {
    "field": "status",
    "operator": "equals",
    "value": "active"
  }
}
```

**Fields:**
- `passed` (boolean): Whether the filter condition was met
- `input` (any): The original input data
- `condition` (object): The filter condition that was evaluated

#### `logic:condition`
Evaluates conditions and routes execution flow.

**Output Structure:**
```json
{
  "branch": "true",
  "evaluation": true,
  "input": { /* original data */ }
}
```

**Fields:**
- `branch` (string): Which branch was taken ("true" or "false")
- `evaluation` (boolean): Result of the condition evaluation
- `input` (any): The original input data

---

### 3. Action Nodes

#### `action:email`
Sends an email using the configured email service.

**Output Structure:**
```json
{
  "sent_at": "2025-11-29T23:56:02.986Z",
  "sent_to": "recipient@example.com",
  "email_id": "31807de8-28c2-4842-aec8-e95ccd793a16"
}
```

**Fields:**
- `sent_at` (string): ISO 8601 timestamp when email was sent
- `sent_to` (string): Recipient email address
- `email_id` (string): Unique identifier for the sent email

#### `action:http`
Makes an HTTP request to an external API.

**Output Structure:**
```json
{
  "status": 200,
  "data": {
    // Response body from the HTTP request
  },
  "headers": {
    "content-type": "application/json"
  },
  "request": {
    "method": "POST",
    "url": "https://api.example.com/endpoint"
  }
}
```

**Fields:**
- `status` (number): HTTP status code from the response
- `data` (any): Response body (parsed if JSON)
- `headers` (object): Response headers
- `request` (object): Details about the request that was made

#### `action:database`
Performs database operations (insert, update, delete, query).

**Output Structure:**
```json
{
  "operation": "insert",
  "affected_rows": 1,
  "data": {
    // Inserted/updated data or query results
  },
  "timestamp": "2025-11-29T23:56:02.986Z"
}
```

**Fields:**
- `operation` (string): Type of database operation performed
- `affected_rows` (number): Number of rows affected by the operation
- `data` (any): Result data from the operation
- `timestamp` (string): ISO 8601 timestamp when operation completed

---

### 4. Integration Nodes

#### `integration:slack`
Sends messages to Slack channels.

**Output Structure:**
```json
{
  "message_id": "1234567890.123456",
  "channel": "#general",
  "timestamp": "2025-11-29T23:56:02.986Z",
  "success": true
}
```

**Fields:**
- `message_id` (string): Slack message ID
- `channel` (string): Channel where message was sent
- `timestamp` (string): ISO 8601 timestamp when message was sent
- `success` (boolean): Whether the message was sent successfully

#### `integration:github`
Interacts with GitHub API (create issue, PR, etc.).

**Output Structure:**
```json
{
  "action": "create_issue",
  "issue_number": 42,
  "url": "https://github.com/owner/repo/issues/42",
  "created_at": "2025-11-29T23:56:02.986Z"
}
```

**Fields:**
- `action` (string): The GitHub action performed
- `issue_number` (number): Issue or PR number (if applicable)
- `url` (string): URL to the created/modified resource
- `created_at` (string): ISO 8601 timestamp when action completed

---

## Execution Duration

The execution duration is calculated as the **sum of all step durations**. This ensures accurate tracking of how long the entire workflow took to execute.

### Calculation Method

```
execution.duration_ms = sum(step.duration_ms for each step)
```

This calculation is performed automatically when the workflow execution completes (either successfully or with failure). The duration is stored in the `workflow_executions` table's `duration_ms` column.

### Example Calculation:

Given steps with durations:
- Step 1 (trigger:webhook): 162ms
- Step 2 (logic:transform): 138ms
- Step 3 (action:email): 238ms

**Total Execution Duration**: 162 + 138 + 238 = **538ms**

### Step Duration

Each step's duration is calculated from its `started_at` and `completed_at` timestamps:

```
step.duration_ms = completed_at - started_at (in milliseconds)
```

---

## Data Flow Example

Here's how data flows through a complete workflow execution:

### Workflow: Webhook → Transform → Email

**Step 1: Webhook Trigger**
```json
Input: {
  "message": "Hello, World!",
  "timestamp": "2024-01-01T00:00:00Z"
}

Output: {
  "payload": {
    "message": "Hello, World!",
    "timestamp": "2024-01-01T00:00:00Z"
  },
  "trigger_type": "webhook",
  "triggered_at": "2025-11-29T23:56:02.339Z"
}
```

**Step 2: Transform Logic**
```json
Input: {
  "payload": {
    "message": "Hello, World!",
    "timestamp": "2024-01-01T00:00:00Z"
  },
  "trigger_type": "webhook",
  "triggered_at": "2025-11-29T23:56:02.339Z"
}

Output: {
  "result": "HELLO, WORLD!",
  "original": "Hello, World!",
  "transformType": "uppercase"
}
```

**Step 3: Email Action**
```json
Input: {
  "result": "HELLO, WORLD!",
  "original": "Hello, World!",
  "transformType": "uppercase"
}

Output: {
  "sent_at": "2025-11-29T23:56:02.986Z",
  "sent_to": "adjeiasarejesse@gmail.com",
  "email_id": "31807de8-28c2-4842-aec8-e95ccd793a16"
}
```

**Total Execution Duration**: 162ms + 138ms + 238ms = **538ms**

---

## Error Handling

When a node fails, the output structure includes error information:

```json
{
  "error": true,
  "error_message": "Failed to connect to email server",
  "error_code": "SMTP_CONNECTION_ERROR",
  "timestamp": "2025-11-29T23:56:02.986Z"
}
```

The execution is marked as `failed` and subsequent nodes are not executed.

---

## Notes

- All timestamps follow ISO 8601 format
- Output data is stored in the `execution_steps` table for audit purposes
- Node configurations can affect the exact output structure
- Custom nodes may have different output structures based on implementation

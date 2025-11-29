export type ExecutionStatus = "queued" | "running" | "success" | "failed" | "cancelled";
export type TriggerType = "manual" | "scheduled" | "webhook" | "api";
export type NodeStatus = "pending" | "running" | "success" | "failed" | "skipped";

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          timezone: string;
          notification_preferences: {
            email: boolean;
            in_app: boolean;
          };
          api_keys: Record<string, string>;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["user_profiles"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["user_profiles"]["Insert"]>;
      };
      workflows: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          nodes: any[];
          edges: any[];
          is_active: boolean;
          trigger_config: any | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["workflows"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["workflows"]["Insert"]>;
      };
      workflow_executions: {
        Row: {
          id: string;
          workflow_id: string;
          user_id: string;
          status: ExecutionStatus;
          trigger_type: TriggerType;
          started_at: string;
          completed_at: string | null;
          execution_log: any[];
          error_message: string | null;
          error_details: any | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["workflow_executions"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["workflow_executions"]["Insert"]>;
      };
      workflow_execution_steps: {
        Row: {
          id: string;
          execution_id: string;
          node_id: string;
          node_type: string;
          status: NodeStatus;
          input_data: any;
          output_data: any;
          error_message: string | null;
          started_at: string | null;
          completed_at: string | null;
          duration_ms: number | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["workflow_execution_steps"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["workflow_execution_steps"]["Insert"]>;
      };
      integration_connections: {
        Row: {
          id: string;
          user_id: string;
          provider: string;
          provider_account_id: string | null;
          account_name: string | null;
          access_token: string;
          refresh_token: string | null;
          expires_at: string | null;
          scopes: string[];
          metadata: Record<string, any>;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["integration_connections"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["integration_connections"]["Insert"]>;
      };
      webhook_endpoints: {
        Row: {
          id: string;
          user_id: string;
          workflow_id: string;
          webhook_token: string;
          is_active: boolean;
          created_at: string;
          last_triggered_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["webhook_endpoints"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["webhook_endpoints"]["Insert"]>;
      };
    };
  };
}

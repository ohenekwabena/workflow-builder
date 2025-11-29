import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const CreateWorkflowSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  nodes: z.array(z.any()).default([]),
  edges: z.array(z.any()).default([]),
  trigger_config: z.any().optional(),
});

// GET /api/workflows - Fetch all user workflows
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: workflows, error } = await supabase
      .from("workflows")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ workflows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/workflows - Create new workflow
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user profile exists, create if not
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (profileError && profileError.code === "PGRST116") {
      // Profile doesn't exist, create it
      const { error: createProfileError } = await supabase.from("user_profiles").insert({
        id: user.id,
        email: user.email || "",
        full_name: user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
      });

      if (createProfileError) {
        console.error("Failed to create user profile:", createProfileError);
        return NextResponse.json(
          { error: "Failed to create user profile: " + createProfileError.message },
          { status: 500 }
        );
      }
    }

    const body = await request.json();
    const validated = CreateWorkflowSchema.parse(body);

    const { data: workflow, error } = await supabase
      .from("workflows")
      .insert({
        user_id: user.id,
        name: validated.name,
        description: validated.description,
        nodes: validated.nodes,
        edges: validated.edges,
        trigger_config: validated.trigger_config,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create workflow:", error);
      throw error;
    }

    return NextResponse.json({ workflow }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Workflow creation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

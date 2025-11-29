"use client";

import React from "react";
import { WorkflowList } from "@/components/workflow/workflow-list";

export default function WorkflowsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <WorkflowList />
    </div>
  );
}

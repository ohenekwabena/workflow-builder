"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setShowDialog(false);
    router.push("/auth/login");
  };

  return (
    <>
      <Button onClick={() => setShowDialog(true)}>Logout</Button>
      <AlertDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onConfirm={logout}
        title="Logout"
        description="Are you sure you want to logout? You'll need to sign in again to access your workflows."
        confirmText="Logout"
        cancelText="Cancel"
        variant="default"
      />
    </>
  );
}

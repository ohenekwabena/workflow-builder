import { redirect } from "next/navigation";

export default function ProtectedPage() {
  // Redirect to workflows page
  redirect("/protected/workflows");
}

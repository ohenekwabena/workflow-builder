import { DeployButton } from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import { User } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex flex-col">
      <nav className="w-full border-b border-b-foreground/10 h-16 sticky top-0 bg-background z-40">
        <div className="w-full max-w-full flex justify-between items-center p-3 px-3 md:px-5 text-sm">
          <div className="flex gap-3 md:gap-5 items-center font-semibold">
            <Link href={"/protected/workflows"} className="text-lg md:text-xl">
              <span className="md:hidden">🎨</span>
              <span className="hidden md:inline">🎨 Workflow Builder</span>
            </Link>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/protected/workflows" className="text-xs md:text-sm hover:text-foreground/80 transition-colors">
              <span className="md:hidden">Workflows</span>
              <span className="hidden md:inline">My Workflows</span>
            </Link>

            <ThemeSwitcher />
            <Link
              href="/protected/profile"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Profile"
            >
              <User className="w-5 h-5" />
            </Link>

            <Suspense>
              <AuthButton />
            </Suspense>
          </div>
        </div>
      </nav>
      <div className="flex-1">{children}</div>
    </main>
  );
}

import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { TopNav } from "./TopNav";


interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppSidebar />
      <TopNav />
      <main className="ml-64 pt-16 transition-all duration-300 flex-1">
        <div className="p-6">{children}</div>
      </main>
      <footer className="ml-64 py-4 text-center text-xs text-muted-foreground border-t border-border">
        by team Elite Neurals
      </footer>
    </div>
  );
}

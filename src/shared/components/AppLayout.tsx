import { ReactNode } from "react";
import AppSidebar from "./AppSidebar.tsx";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="ml-64 flex-1 p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}

"use client";

import { useAuth } from "@/lib/workspace-context";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">🚀</span>
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">OpenBase</h2>
          <p className="text-gray-500">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 via-white to-blue-50">
        {children}
      </main>
    </div>
  );
}

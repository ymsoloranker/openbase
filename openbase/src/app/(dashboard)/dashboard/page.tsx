"use client";

import { useAuth } from "@/lib/workspace-context";
import { useState, useEffect } from "react";
import {
  FileText,
  Star,
  Clock,
  Plus,
  ChevronRight,
  Sparkles,
  Zap,
  BookOpen,
} from "lucide-react";
import Link from "next/link";

interface Page {
  id: string;
  title: string;
  icon: string | null;
  isFavorite: boolean;
  updatedAt: string;
}

export default function DashboardPage() {
  const { workspace } = useAuth();
  const [recentPages, setRecentPages] = useState<Page[]>([]);
  const [favoritePages, setFavoritePages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPages();
  }, [workspace]);

  async function fetchPages() {
    if (!workspace) return;

    try {
      const [recentRes, favoritesRes] = await Promise.all([
        fetch(`/api/pages?workspaceId=${workspace.id}`),
        fetch(`/api/pages?workspaceId=${workspace.id}&favorites=true`),
      ]);

      if (recentRes.ok) {
        const data = await recentRes.json();
        setRecentPages(data.slice(0, 5));
      }

      if (favoritesRes.ok) {
        const data = await favoritesRes.json();
        setFavoritePages(data);
      }
    } catch (error) {
      console.error("Failed to fetch pages:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreatePage() {
    if (!workspace) return;

    const res = await fetch("/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspaceId: workspace.id,
        title: "Untitled",
      }),
    });

    if (res.ok) {
      const newPage = await res.json();
      window.location.href = `/page/${newPage.id}`;
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="h-16 bg-gray-200/50 rounded-2xl animate-pulse w-1/2" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200/50 rounded-2xl animate-pulse" />
            ))}
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-gray-200/50 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12 animate-slide-up">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl filter drop-shadow-sm">{workspace?.icon || "🚀"}</span>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                {workspace?.name || "Workspace"}
              </h1>
              <p className="text-gray-500 mt-1">
                Your connected workspace for docs, notes & knowledge
              </p>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <button
            onClick={handleCreatePage}
            className="group relative overflow-hidden flex items-center gap-4 p-6 bg-white border border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 animate-slide-up"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl opacity-100 group-hover:scale-110 transition-transform duration-300" />
              <div className="relative w-12 h-12 flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">New Page</p>
              <p className="text-sm text-gray-500">Create a blank page</p>
            </div>
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <Zap className="w-5 h-5 text-blue-500" />
            </div>
          </button>

          <button className="group relative overflow-hidden flex items-center gap-4 p-6 bg-white border border-gray-200 rounded-2xl hover:border-purple-300 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 animate-slide-up" style={{ animationDelay: "50ms" }}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl opacity-100 group-hover:scale-110 transition-transform duration-300" />
              <div className="relative w-12 h-12 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">Templates</p>
              <p className="text-sm text-gray-500">Browse templates</p>
            </div>
          </button>

          <button className="group relative overflow-hidden flex items-center gap-4 p-6 bg-white border border-gray-200 rounded-2xl hover:border-green-300 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 animate-slide-up" style={{ animationDelay: "100ms" }}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl opacity-100 group-hover:scale-110 transition-transform duration-300" />
              <div className="relative w-12 h-12 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">Wiki</p>
              <p className="text-sm text-gray-500">Knowledge base</p>
            </div>
          </button>
        </div>

        {/* Favorites */}
        {favoritePages.length > 0 && (
          <div className="mb-12 animate-slide-up" style={{ animationDelay: "150ms" }}>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="w-4 h-4 text-yellow-600 fill-yellow-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Favorites</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {favoritePages.map((page, i) => (
                <Link
                  key={page.id}
                  href={`/page/${page.id}`}
                  className="group flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-200"
                  style={{ animationDelay: `${200 + i * 50}ms` }}
                >
                  {page.icon && (
                    <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
                      {page.icon}
                    </span>
                  )}
                  <span className="font-medium text-gray-900 truncate flex-1">
                    {page.title}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent pages */}
        <div className="animate-slide-up" style={{ animationDelay: "250ms" }}>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Recent</h2>
          </div>
          {recentPages.length > 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              {recentPages.map((page, index) => (
                <Link
                  key={page.id}
                  href={`/page/${page.id}`}
                  className={`group flex items-center gap-4 p-4 hover:bg-gray-50 transition-all duration-200 ${
                    index !== recentPages.length - 1
                      ? "border-b border-gray-100"
                      : ""
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    page.icon 
                      ? "bg-gray-100 text-2xl group-hover:scale-110 transition-transform" 
                      : "bg-gray-100 group-hover:bg-gray-200 transition-colors"
                  }`}>
                    {page.icon || <FileText className="w-5 h-5 text-gray-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {page.title || "Untitled"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(page.updatedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl shadow-sm">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Start creating
              </h3>
              <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
                Create your first page to get started with OpenBase
              </p>
              <button
                onClick={handleCreatePage}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
              >
                <Plus className="w-5 h-5" />
                Create your first page
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

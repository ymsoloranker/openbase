"use client";

import { useAuth } from "@/lib/workspace-context";
import { useState, useEffect } from "react";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Search,
  Menu,
  FileText,
  Sparkles,
} from "lucide-react";
import PageTreeItem from "./PageTreeItem";

interface Page {
  id: string;
  title: string;
  icon: string | null;
  isFavorite: boolean;
  parentId: string | null;
  children?: Page[];
}

export default function Sidebar({
  isOpen,
  onToggle,
}: {
  isOpen: boolean;
  onToggle: () => void;
}) {
  const { workspace } = useAuth();
  const [pages, setPages] = useState<Page[]>([]);
  const [favorites, setFavorites] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (workspace) {
      fetchPages();
    }
  }, [workspace]);

  async function fetchPages() {
    if (!workspace) return;

    try {
      const [pagesRes, favoritesRes] = await Promise.all([
        fetch(`/api/pages?workspaceId=${workspace.id}&parentId=`),
        fetch(`/api/pages?workspaceId=${workspace.id}&favorites=true`),
      ]);

      if (pagesRes.ok) {
        const pagesData = await pagesRes.json();
        setPages(pagesData);
      }

      if (favoritesRes.ok) {
        const favoritesData = await favoritesRes.json();
        setFavorites(favoritesData);
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
      setPages([newPage, ...pages]);
      window.location.href = `/page/${newPage.id}`;
    }
  }

  if (!isOpen) {
    return (
      <div className="w-14 bg-white border-r border-gray-200 flex flex-col items-center py-4 shadow-sm">
        <button
          onClick={onToggle}
          className="p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-200"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shadow-sm">
      {/* Workspace header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-lg">{workspace?.icon || "🚀"}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-gray-900 truncate text-sm">OpenBase</h1>
            <p className="text-xs text-gray-500 truncate">
              {workspace?.name || "Workspace"}
            </p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="p-3 space-y-1.5">
        <button
          onClick={handleCreatePage}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
        >
          <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
            <Plus className="w-4 h-4 text-blue-600" />
          </div>
          <span>New Page</span>
        </button>
        <button className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200">
          <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center">
            <Search className="w-4 h-4 text-gray-500" />
          </div>
          <span className="flex-1 text-left">Quick Find</span>
          <span className="text-xs text-gray-400 font-mono">⌘K</span>
        </button>
      </div>

      {/* Favorites */}
      <div className="px-3 py-3">
        <div className="flex items-center gap-2 mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Favorites
          </h3>
        </div>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : favorites.length > 0 ? (
          <div className="space-y-0.5">
            {favorites.map((page) => (
              <PageTreeItem
                key={page.id}
                page={page}
                allPages={pages}
                onRefresh={fetchPages}
              />
            ))}
          </div>
        ) : (
          <div className="py-3 px-2 text-center">
            <p className="text-xs text-gray-400">
              Star pages to add them here
            </p>
          </div>
        )}
      </div>

      {/* All Pages */}
      <div className="px-3 py-3 flex-1 overflow-auto">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-gray-400" />
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Pages
            </h3>
          </div>
          <button
            onClick={handleCreatePage}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : pages.length > 0 ? (
          <div className="space-y-0.5">
            {pages.map((page) => (
              <PageTreeItem
                key={page.id}
                page={page}
                allPages={pages}
                onRefresh={fetchPages}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 px-4">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 font-medium mb-1">No pages yet</p>
            <button
              onClick={handleCreatePage}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Create your first page
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center justify-between px-2 py-2 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-xs">O</span>
            </div>
            <span className="text-xs font-medium text-gray-600">OpenBase</span>
          </div>
          <span className="text-xs text-gray-400">v1.0</span>
        </div>
      </div>
    </div>
  );
}

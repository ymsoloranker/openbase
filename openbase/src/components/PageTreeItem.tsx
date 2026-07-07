"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Page {
  id: string;
  title: string;
  icon: string | null;
  isFavorite: boolean;
  parentId: string | null;
}

export default function PageTreeItem({
  page,
  allPages,
  onRefresh,
}: {
  page: Page;
  allPages: Page[];
  onRefresh: () => void;
}) {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const children = allPages.filter((p) => p.parentId === page.id);
  const hasChildren = children.length > 0;
  const isActive = pathname === `/page/${page.id}`;

  async function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    await fetch(`/api/pages/${page.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        isFavorite: !page.isFavorite,
      }),
    });

    onRefresh();
  }

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this page?")) return;

    await fetch(`/api/pages/${page.id}`, {
      method: "DELETE",
    });

    onRefresh();
  }

  return (
    <div>
      <div
        className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-xl cursor-pointer transition-all duration-200 ${
          isActive 
            ? "bg-blue-50 text-blue-700" 
            : isHovered 
              ? "bg-gray-100 text-gray-900" 
              : "text-gray-600 hover:text-gray-900"
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className={`p-0.5 rounded-lg transition-colors ${
              isActive ? "hover:bg-blue-100" : "hover:bg-gray-200"
            }`}
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
        ) : (
          <div className="w-5" />
        )}

        <Link
          href={`/page/${page.id}`}
          className="flex-1 flex items-center gap-2 text-sm font-medium truncate"
        >
          {page.icon && (
            <span className="text-base filter drop-shadow-sm">{page.icon}</span>
          )}
          <span className="truncate">{page.title || "Untitled"}</span>
        </Link>

        <div
          className={`flex items-center gap-1 transition-all duration-200 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            onClick={toggleFavorite}
            className={`p-1 rounded-lg transition-colors ${
              isActive ? "hover:bg-blue-100" : "hover:bg-gray-200"
            }`}
            title={page.isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Star
              className={`w-3.5 h-3.5 ${
                page.isFavorite
                  ? "fill-yellow-500 text-yellow-500"
                  : "text-gray-400"
              }`}
            />
          </button>
          <button
            onClick={handleDelete}
            className={`p-1 rounded-lg transition-colors ${
              isActive ? "hover:bg-blue-100" : "hover:bg-gray-200"
            }`}
            title="Delete page"
          >
            <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500 transition-colors" />
          </button>
        </div>
      </div>

      {isExpanded && children.length > 0 && (
        <div className="ml-4 space-y-0.5 border-l-2 border-gray-100 pl-2">
          {children.map((child) => (
            <PageTreeItem
              key={child.id}
              page={child}
              allPages={allPages}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}

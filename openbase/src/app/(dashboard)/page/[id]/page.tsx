"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Star,
  MoreHorizontal,
  Trash2,
  Plus,
  X,
  Image as ImageIcon,
} from "lucide-react";
import BlockComponent from "@/components/BlockComponent";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface Block {
  id: string;
  type: string;
  content: string;
  properties: Record<string, unknown>;
  order: number;
}

interface Page {
  id: string;
  title: string;
  icon: string | null;
  coverImage: string | null;
  isFavorite: boolean;
  blocks: Block[];
}

export default function PageEditor() {
  const params = useParams();
  const pageId = params.id as string;
  const [page, setPage] = useState<Page | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showBlockMenu, setShowBlockMenu] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchPage();
  }, [pageId]);

  async function fetchPage() {
    try {
      const res = await fetch(`/api/pages/${pageId}`);
      if (res.ok) {
        const data = await res.json();
        setPage(data);
      }
    } catch (error) {
      console.error("Failed to fetch page:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function updatePage(updates: Partial<Page>) {
    setIsSaving(true);
    try {
      await fetch(`/api/pages/${pageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      setPage((prev) => (prev ? { ...prev, ...updates } : null));
    } catch (error) {
      console.error("Failed to update page:", error);
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleFavorite() {
    if (!page) return;
    await updatePage({ isFavorite: !page.isFavorite });
  }

  async function addBlock(afterBlockId?: string) {
    if (!page) return;

    const res = await fetch("/api/blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pageId: page.id,
        type: "paragraph",
        content: "",
      }),
    });

    if (res.ok) {
      const newBlock = await res.json();
      setPage((prev) => {
        if (!prev) return null;
        const blocks = [...prev.blocks];
        const index = afterBlockId
          ? blocks.findIndex((b) => b.id === afterBlockId) + 1
          : blocks.length;
        blocks.splice(index, 0, newBlock);
        return { ...prev, blocks };
      });
    }
  }

  async function updateBlock(blockId: string, updates: Partial<Block>) {
    try {
      await fetch("/api/blocks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: blockId, ...updates }),
      });

      setPage((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          blocks: prev.blocks.map((b) =>
            b.id === blockId ? { ...b, ...updates } : b
          ),
        };
      });
    } catch (error) {
      console.error("Failed to update block:", error);
    }
  }

  async function deleteBlock(blockId: string) {
    try {
      await fetch(`/api/blocks?id=${blockId}`, {
        method: "DELETE",
      });

      setPage((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          blocks: prev.blocks.filter((b) => b.id !== blockId),
        };
      });
    } catch (error) {
      console.error("Failed to delete block:", error);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      if (!page) return;

      const oldIndex = page.blocks.findIndex((b) => b.id === active.id);
      const newIndex = page.blocks.findIndex((b) => b.id === over.id);

      const newBlocks = arrayMove(page.blocks, oldIndex, newIndex).map(
        (block, index) => ({ ...block, order: index })
      );

      setPage({ ...page, blocks: newBlocks });

      // Update order on server
      await fetch("/api/blocks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          newBlocks.map((b) => ({ id: b.id, order: b.order }))
        ),
      });
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="h-32 bg-gray-200 rounded animate-pulse" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Page not found
          </h1>
          <p className="text-gray-600">This page may have been deleted</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Cover image */}
      {page.coverImage && (
        <div className="h-64 w-full relative group overflow-hidden">
          <img
            src={page.coverImage}
            alt="Cover"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <button
            onClick={() => updatePage({ coverImage: null })}
            className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-sm text-gray-700 rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Page header */}
        <div className="mb-10">
          <div className="flex items-start gap-4 mb-6">
            <div className="group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center border-2 border-transparent hover:border-blue-200 transition-colors">
                <input
                  type="text"
                  value={page.icon || ""}
                  onChange={(e) => updatePage({ icon: e.target.value || null })}
                  placeholder="📄"
                  className="text-3xl w-full h-full flex items-center justify-center bg-transparent focus:outline-none text-center"
                  maxLength={2}
                />
              </div>
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={page.title}
                onChange={(e) => updatePage({ title: e.target.value })}
                placeholder="Untitled"
                className="text-4xl font-bold w-full border-none focus:outline-none bg-transparent placeholder-gray-300 text-gray-900"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleFavorite}
                className={`p-2.5 rounded-xl transition-all duration-200 ${
                  page.isFavorite
                    ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                    : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                }`}
                title={page.isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Star
                  className={`w-5 h-5 ${
                    page.isFavorite ? "fill-yellow-500" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {!page.coverImage && (
            <button
              onClick={() =>
                updatePage({
                  coverImage: `https://picsum.photos/seed/${pageId}/1200/300`,
                })
              }
              className="group flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                <ImageIcon className="w-4 h-4" />
              </div>
              <span className="font-medium">Add cover image</span>
            </button>
          )}
        </div>

        {/* Blocks editor */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={page.blocks.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1">
              {page.blocks.map((block, index) => (
                <BlockComponent
                  key={block.id}
                  block={block}
                  onUpdate={(updates) => updateBlock(block.id, updates)}
                  onDelete={() => deleteBlock(block.id)}
                  onAddAfter={() => addBlock(block.id)}
                  showMenu={showBlockMenu === block.id}
                  onToggleMenu={() =>
                    setShowBlockMenu(showBlockMenu === block.id ? null : block.id)
                  }
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Add block button */}
        <button
          onClick={() => addBlock()}
          className="mt-4 flex items-center gap-2 text-gray-400 hover:text-gray-600 transition"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm">Add a block</span>
        </button>

        {/* Save indicator */}
        {isSaving && (
          <div className="fixed bottom-4 right-4 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg">
            Saving...
          </div>
        )}
      </div>
    </div>
  );
}

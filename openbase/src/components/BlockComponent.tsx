"use client";

import { useState, useRef, useEffect } from "react";
import {
  GripVertical,
  MoreHorizontal,
  Trash2,
  Plus,
  Type,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Minus,
  MessageSquare,
  Image,
  Table,
  ChevronDown,
  ChevronRight,
  Bookmark,
} from "lucide-react";
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Block {
  id: string;
  type: string;
  content: string;
  properties: Record<string, unknown>;
  order: number;
  isCollapsed?: boolean;
}

interface BlockComponentProps {
  block: Block;
  onUpdate: (updates: Partial<Block>) => void;
  onDelete: () => void;
  onAddAfter: () => void;
  showMenu: boolean;
  onToggleMenu: () => void;
}

const blockTypeIcons: Record<string, React.ReactNode> = {
  paragraph: <Type className="w-4 h-4" />,
  heading1: <Type className="w-4 h-4" />,
  heading2: <Type className="w-4 h-4" />,
  heading3: <Type className="w-4 h-4" />,
  bulletList: <List className="w-4 h-4" />,
  numberedList: <ListOrdered className="w-4 h-4" />,
  checklist: <CheckSquare className="w-4 h-4" />,
  quote: <Quote className="w-4 h-4" />,
  code: <Code className="w-4 h-4" />,
  divider: <Minus className="w-4 h-4" />,
  callout: <MessageSquare className="w-4 h-4" />,
  image: <Image className="w-4 h-4" />,
  table: <Table className="w-4 h-4" />,
  toggle: <ChevronDown className="w-4 h-4" />,
  bookmark: <Bookmark className="w-4 h-4" />,
};

const blockTypeLabels: Record<string, string> = {
  paragraph: "Text",
  heading1: "Heading 1",
  heading2: "Heading 2",
  heading3: "Heading 3",
  bulletList: "Bullet List",
  numberedList: "Numbered List",
  checklist: "Checklist",
  quote: "Quote",
  code: "Code",
  divider: "Divider",
  callout: "Callout",
  image: "Image",
  table: "Table",
  toggle: "Toggle",
  bookmark: "Bookmark",
};

export default function BlockComponent({
  block,
  onUpdate,
  onDelete,
  onAddAfter,
  showMenu,
  onToggleMenu,
}: BlockComponentProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [localContent, setLocalContent] = useState(block.content);

  useEffect(() => {
    setLocalContent(block.content);
  }, [block.content]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  function handleContentChange(newContent: string) {
    setLocalContent(newContent);
    onUpdate({ content: newContent });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "/" && !isEditing) {
      e.preventDefault();
      onToggleMenu();
    } else if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      onAddAfter();
    } else if (e.key === "Backspace" && block.content === "") {
      e.preventDefault();
      onDelete();
    }
  }

  function handleBlockTypeChange(newType: string) {
    onUpdate({ type: newType });
    onToggleMenu();
  }

  function handleCheckboxToggle() {
    const checked = !(block.properties as { checked?: boolean }).checked;
    onUpdate({ properties: { ...(block.properties as object), checked } });
  }

  const renderBlockContent = () => {
    const isChecked = (block.properties as { checked?: boolean }).checked;
    const calloutColor = (block.properties as { color?: string }).color;

    switch (block.type) {
      case "heading1":
        return (
          <h1
            contentEditable
            suppressContentEditableWarning
            ref={contentRef}
            onBlur={(e) => handleContentChange(e.currentTarget.textContent || "")}
            onKeyDown={handleKeyDown}
            className="text-3xl font-bold outline-none"
            data-placeholder="Heading 1"
          >
            {block.content}
          </h1>
        );
      case "heading2":
        return (
          <h2
            contentEditable
            suppressContentEditableWarning
            ref={contentRef}
            onBlur={(e) => handleContentChange(e.currentTarget.textContent || "")}
            onKeyDown={handleKeyDown}
            className="text-2xl font-semibold outline-none"
            data-placeholder="Heading 2"
          >
            {block.content}
          </h2>
        );
      case "heading3":
        return (
          <h3
            contentEditable
            suppressContentEditableWarning
            ref={contentRef}
            onBlur={(e) => handleContentChange(e.currentTarget.textContent || "")}
            onKeyDown={handleKeyDown}
            className="text-xl font-semibold outline-none"
            data-placeholder="Heading 3"
          >
            {block.content}
          </h3>
        );
      case "bulletList":
        return (
          <div className="flex items-start gap-2">
            <span className="text-gray-400 mt-1.5">•</span>
            <div
              contentEditable
              suppressContentEditableWarning
              ref={contentRef}
              onBlur={(e) => handleContentChange(e.currentTarget.textContent || "")}
              onKeyDown={handleKeyDown}
              className="flex-1 outline-none"
              data-placeholder="List item"
            >
              {block.content}
            </div>
          </div>
        );
      case "numberedList":
        return (
          <div className="flex items-start gap-2">
            <span className="text-gray-400 mt-1 min-w-[1.5rem]">1.</span>
            <div
              contentEditable
              suppressContentEditableWarning
              ref={contentRef}
              onBlur={(e) => handleContentChange(e.currentTarget.textContent || "")}
              onKeyDown={handleKeyDown}
              className="flex-1 outline-none"
              data-placeholder="List item"
            >
              {block.content}
            </div>
          </div>
        );
      case "checklist":
        return (
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={isChecked || false}
              onChange={handleCheckboxToggle}
              className="mt-1 w-4 h-4"
            />
            <div
              contentEditable
              suppressContentEditableWarning
              ref={contentRef}
              onBlur={(e) => handleContentChange(e.currentTarget.textContent || "")}
              onKeyDown={handleKeyDown}
              className={`flex-1 outline-none ${
                isChecked ? "line-through text-gray-400" : ""
              }`}
              data-placeholder="To-do"
            >
              {block.content}
            </div>
          </div>
        );
      case "quote":
        return (
          <blockquote className="border-l-4 border-gray-900 pl-4 italic">
            <div
              contentEditable
              suppressContentEditableWarning
              ref={contentRef}
              onBlur={(e) => handleContentChange(e.currentTarget.textContent || "")}
              onKeyDown={handleKeyDown}
              className="outline-none"
              data-placeholder="Quote"
            >
              {block.content}
            </div>
          </blockquote>
        );
      case "code":
        return (
          <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
            <code
              contentEditable
              suppressContentEditableWarning
              ref={contentRef}
              onBlur={(e) => handleContentChange(e.currentTarget.textContent || "")}
              onKeyDown={handleKeyDown}
              className="outline-none font-mono text-sm"
              data-placeholder="Code"
            >
              {block.content}
            </code>
          </pre>
        );
      case "divider":
        return <hr className="border-t border-gray-200" />;
      case "callout":
        return (
          <div
            className={`p-4 rounded-lg flex gap-3 ${
              calloutColor === "blue"
                ? "bg-blue-50"
                : calloutColor === "yellow"
                ? "bg-yellow-50"
                : calloutColor === "red"
                ? "bg-red-50"
                : "bg-gray-100"
            }`}
          >
            <span className="text-xl">💡</span>
            <div
              contentEditable
              suppressContentEditableWarning
              ref={contentRef}
              onBlur={(e) => handleContentChange(e.currentTarget.textContent || "")}
              onKeyDown={handleKeyDown}
              className="flex-1 outline-none"
              data-placeholder="Callout text"
            >
              {block.content}
            </div>
          </div>
        );
      default:
        return (
          <div
            contentEditable
            suppressContentEditableWarning
            ref={contentRef}
            onBlur={(e) => handleContentChange(e.currentTarget.textContent || "")}
            onKeyDown={handleKeyDown}
            className="outline-none min-h-[1.5rem]"
            data-placeholder="Type '/' for commands"
          >
            {block.content}
          </div>
        );
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex items-start gap-2 py-1.5 px-2 -mx-2 rounded-xl transition-all duration-200 ${
        isDragging ? "z-50 bg-white shadow-lg" : isHovered ? "bg-gray-50" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        onToggleMenu();
      }}
    >
      {/* Drag handle and actions */}
      <div
        className={`flex items-center gap-1 pt-1.5 transition-all duration-200 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
      >
        <button
          {...attributes}
          {...listeners}
          className="p-1.5 hover:bg-gray-200 rounded-lg cursor-grab active:cursor-grabbing transition-colors"
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </button>
        <button
          onClick={onAddAfter}
          className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
          title="Add block below"
        >
          <Plus className="w-4 h-4 text-gray-400" />
        </button>
        <div className="relative">
          <button
            onClick={onToggleMenu}
            className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </button>

          {showMenu && (
            <div className="absolute left-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-50 w-56">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Turn into
              </div>
              {Object.entries(blockTypeLabels).map(([type, label]) => (
                <button
                  key={type}
                  onClick={() => handleBlockTypeChange(type)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 transition-colors ${
                    block.type === type ? "bg-blue-50 text-blue-700" : ""
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    block.type === type ? "bg-blue-100" : "bg-gray-100"
                  }`}>
                    {blockTypeIcons[type]}
                  </div>
                  <span className="font-medium">{label}</span>
                </button>
              ))}
              <div className="border-t border-gray-100 my-1.5" />
              <button
                onClick={onDelete}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center">
                  <Trash2 className="w-4 h-4" />
                </div>
                <span className="font-medium">Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Block content */}
      <div className="flex-1 min-w-0">{renderBlockContent()}</div>
    </div>
  );
}

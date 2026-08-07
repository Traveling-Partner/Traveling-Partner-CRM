"use client";

import type { Editor } from "@tiptap/react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  CheckSquare,
  ChevronDown,
  Code2,
  Highlighter,
  ImageIcon,
  IndentDecrease,
  IndentIncrease,
  Info,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Minus,
  MoreHorizontal,
  Quote,
  Redo2,
  RemoveFormatting,
  Smile,
  Strikethrough,
  Subscript,
  Superscript,
  Underline,
  Undo2,
  Video,
  Code,
  TableProperties,
  Rows3,
  Columns3,
  Trash2
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TableSizePicker } from "@/components/blog/TableSizePicker";

const EMOJIS = [
  "😀", "😁", "😂", "🤣", "😊", "😍", "🤔", "😎", "🙌", "👍",
  "🔥", "✨", "💡", "📌", "✅", "❌", "⭐", "❤️", "🌍", "✈️",
  "🗺️", "🏖️", "⛰️", "🏨", "🚗", "📸", "🎉", "💬", "📝", "⚡"
];

const FONTS = [
  { label: "Default", value: "" },
  { label: "Inter", value: "Inter, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: '"Times New Roman", Times, serif' },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Courier New", value: '"Courier New", Courier, monospace' },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Poppins", value: "var(--font-poppins), sans-serif" },
  { label: "Montserrat", value: "var(--font-montserrat), sans-serif" }
];

const FONT_SIZES = [
  "12px",
  "14px",
  "16px",
  "18px",
  "20px",
  "24px",
  "28px",
  "32px",
  "36px",
  "48px"
];

const TEXT_COLORS = [
  "#111827",
  "#374151",
  "#6B7280",
  "#DC2626",
  "#EA580C",
  "#CA8A04",
  "#16A34A",
  "#2563EB",
  "#7C3AED",
  "#DB2777",
  "#0D9488",
  "#FDB813"
];

const HIGHLIGHT_COLORS = [
  "#FEF08A",
  "#FDE68A",
  "#FDBA74",
  "#FCA5A5",
  "#F9A8D4",
  "#C4B5FD",
  "#93C5FD",
  "#6EE7B7",
  "#A7F3D0",
  "#E5E7EB"
];

function ToolBtn({
  active,
  disabled,
  title,
  onClick,
  children,
  className
}: {
  active?: boolean;
  disabled?: boolean;
  title: string;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      disabled={disabled}
      title={title}
      aria-label={title}
      className={cn(
        "h-8 w-8 shrink-0 rounded-md text-muted-foreground hover:text-foreground",
        active && "bg-[var(--brand-light-active)] text-foreground",
        className
      )}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function Divider() {
  return <span className="mx-0.5 h-5 w-px shrink-0 bg-border/80" aria-hidden />;
}

function MenuShell({
  open,
  onClose,
  children,
  className,
  align = "left"
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  align?: "left" | "right";
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      ref={ref}
      className={cn(
        "absolute top-9 z-50 rounded-xl border border-border/60 bg-popover p-2 shadow-premium-lg",
        align === "right" ? "right-0" : "left-0",
        className
      )}
    >
      {children}
    </div>
  );
}

interface BlogEditorToolbarProps {
  editor: Editor;
  uploading?: boolean;
  onPickImage: () => void;
  onInsertVideo: () => void;
  wordCount?: number;
  charCount?: number;
}

export function BlogEditorToolbar({
  editor,
  uploading,
  onPickImage,
  onInsertVideo,
  wordCount = 0,
  charCount = 0
}: BlogEditorToolbarProps) {
  const [, setTick] = useState(0);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [fontOpen, setFontOpen] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const [highlightOpen, setHighlightOpen] = useState(false);
  const [headingOpen, setHeadingOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [tableOpen, setTableOpen] = useState(false);

  useEffect(() => {
    const bump = () => setTick((t) => t + 1);
    editor.on("selectionUpdate", bump);
    editor.on("update", bump);
    return () => {
      editor.off("selectionUpdate", bump);
      editor.off("update", bump);
    };
  }, [editor]);

  const currentFont =
    (editor.getAttributes("textStyle").fontFamily as string | undefined) || "";
  const currentSize =
    (editor.getAttributes("textStyle").fontSize as string | undefined) || "16px";
  const currentColor =
    (editor.getAttributes("textStyle").color as string | undefined) || "";

  const headingLabel = editor.isActive("heading", { level: 1 })
    ? "Heading 1"
    : editor.isActive("heading", { level: 2 })
      ? "Heading 2"
      : editor.isActive("heading", { level: 3 })
        ? "Heading 3"
        : editor.isActive("heading", { level: 4 })
          ? "Heading 4"
          : "Paragraph";

  const fontLabel =
    FONTS.find((f) => f.value === currentFont)?.label || "Default";

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter URL", prev || "https://");
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url.trim(), target: "_blank" })
      .run();
  };

  const clearFormatting = () => {
    editor
      .chain()
      .focus()
      .unsetAllMarks()
      .unsetFontFamily()
      .unsetColor()
      .unsetHighlight()
      .unsetFontSize()
      .clearNodes()
      .run();
  };

  return (
    <div className="border-b border-border/60 bg-card/95 px-2 py-1.5 backdrop-blur-md supports-[backdrop-filter]:bg-card/90">
      {/* Row 1 — primary Google Docs style controls */}
      <div className="flex flex-wrap items-center gap-0.5">
        <ToolBtn
          title="Undo (Ctrl+Z)"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo2 className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          title="Redo (Ctrl+Y)"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo2 className="h-4 w-4" />
        </ToolBtn>

        <Divider />

        {/* Style / heading */}
        <div className="relative">
          <button
            type="button"
            title="Text style"
            className="flex h-8 min-w-[108px] items-center justify-between gap-1 rounded-md px-2 text-xs font-medium text-foreground hover:bg-muted"
            onClick={() => setHeadingOpen((o) => !o)}
          >
            <span className="truncate">{headingLabel}</span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
          </button>
          <MenuShell open={headingOpen} onClose={() => setHeadingOpen(false)} className="w-44 p-1">
            {[
              { label: "Paragraph", run: () => editor.chain().focus().setParagraph().run() },
              {
                label: "Heading 1",
                run: () => editor.chain().focus().toggleHeading({ level: 1 }).run()
              },
              {
                label: "Heading 2",
                run: () => editor.chain().focus().toggleHeading({ level: 2 }).run()
              },
              {
                label: "Heading 3",
                run: () => editor.chain().focus().toggleHeading({ level: 3 }).run()
              },
              {
                label: "Heading 4",
                run: () => editor.chain().focus().toggleHeading({ level: 4 }).run()
              }
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                className="flex w-full rounded-md px-2.5 py-1.5 text-left text-xs hover:bg-muted"
                onClick={() => {
                  item.run();
                  setHeadingOpen(false);
                }}
              >
                {item.label}
              </button>
            ))}
          </MenuShell>
        </div>

        {/* Font family */}
        <div className="relative">
          <button
            type="button"
            title="Font"
            className="flex h-8 min-w-[118px] items-center justify-between gap-1 rounded-md px-2 text-xs font-medium text-foreground hover:bg-muted"
            onClick={() => setFontOpen((o) => !o)}
          >
            <span className="truncate">{fontLabel}</span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
          </button>
          <MenuShell open={fontOpen} onClose={() => setFontOpen(false)} className="w-52 p-1">
            {FONTS.map((font) => (
              <button
                key={font.label}
                type="button"
                className="flex w-full rounded-md px-2.5 py-1.5 text-left text-xs hover:bg-muted"
                style={font.value ? { fontFamily: font.value } : undefined}
                onClick={() => {
                  if (!font.value) editor.chain().focus().unsetFontFamily().run();
                  else editor.chain().focus().setFontFamily(font.value).run();
                  setFontOpen(false);
                }}
              >
                {font.label}
              </button>
            ))}
          </MenuShell>
        </div>

        {/* Font size */}
        <div className="relative">
          <button
            type="button"
            title="Font size"
            className="flex h-8 min-w-[72px] items-center justify-between gap-1 rounded-md px-2 text-xs font-medium text-foreground hover:bg-muted"
            onClick={() => setSizeOpen((o) => !o)}
          >
            <span>{currentSize.replace("px", "")}</span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
          </button>
          <MenuShell open={sizeOpen} onClose={() => setSizeOpen(false)} className="w-28 p-1">
            {FONT_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                className="flex w-full rounded-md px-2.5 py-1.5 text-left text-xs hover:bg-muted"
                onClick={() => {
                  editor.chain().focus().setFontSize(size).run();
                  setSizeOpen(false);
                }}
              >
                {size.replace("px", "")}
              </button>
            ))}
            <button
              type="button"
              className="flex w-full rounded-md px-2.5 py-1.5 text-left text-xs text-muted-foreground hover:bg-muted"
              onClick={() => {
                editor.chain().focus().unsetFontSize().run();
                setSizeOpen(false);
              }}
            >
              Reset
            </button>
          </MenuShell>
        </div>

        <Divider />

        <ToolBtn
          title="Bold (Ctrl+B)"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          title="Italic (Ctrl+I)"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          title="Underline (Ctrl+U)"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <Underline className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          title="Strikethrough"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="h-4 w-4" />
        </ToolBtn>

        {/* Text color */}
        <div className="relative">
          <ToolBtn
            title="Text color"
            active={Boolean(currentColor)}
            onClick={() => setColorOpen((o) => !o)}
          >
            <span className="flex flex-col items-center leading-none">
              <span className="text-[11px] font-bold">A</span>
              <span
                className="mt-0.5 h-0.5 w-3.5 rounded-full"
                style={{ background: currentColor || "#111827" }}
              />
            </span>
          </ToolBtn>
          <MenuShell open={colorOpen} onClose={() => setColorOpen(false)} className="w-44">
            <p className="mb-1.5 px-1 text-2xs font-medium text-muted-foreground">
              Text color
            </p>
            <div className="grid grid-cols-6 gap-1.5">
              {TEXT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  title={c}
                  className="h-6 w-6 rounded-md border border-border/60"
                  style={{ background: c }}
                  onClick={() => {
                    editor.chain().focus().setColor(c).run();
                    setColorOpen(false);
                  }}
                />
              ))}
            </div>
            <button
              type="button"
              className="mt-2 w-full rounded-md px-2 py-1 text-2xs text-muted-foreground hover:bg-muted"
              onClick={() => {
                editor.chain().focus().unsetColor().run();
                setColorOpen(false);
              }}
            >
              Reset color
            </button>
          </MenuShell>
        </div>

        {/* Highlight */}
        <div className="relative">
          <ToolBtn
            title="Highlight"
            active={editor.isActive("highlight")}
            onClick={() => setHighlightOpen((o) => !o)}
          >
            <Highlighter className="h-4 w-4" />
          </ToolBtn>
          <MenuShell
            open={highlightOpen}
            onClose={() => setHighlightOpen(false)}
            className="w-44"
          >
            <p className="mb-1.5 px-1 text-2xs font-medium text-muted-foreground">
              Highlight
            </p>
            <div className="grid grid-cols-5 gap-1.5">
              {HIGHLIGHT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="h-6 w-6 rounded-md border border-border/60"
                  style={{ background: c }}
                  onClick={() => {
                    editor.chain().focus().toggleHighlight({ color: c }).run();
                    setHighlightOpen(false);
                  }}
                />
              ))}
            </div>
            <button
              type="button"
              className="mt-2 w-full rounded-md px-2 py-1 text-2xs text-muted-foreground hover:bg-muted"
              onClick={() => {
                editor.chain().focus().unsetHighlight().run();
                setHighlightOpen(false);
              }}
            >
              Remove highlight
            </button>
          </MenuShell>
        </div>

        <Divider />

        <ToolBtn
          title="Align left"
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          title="Align center"
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          title="Align right"
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          title="Justify"
          active={editor.isActive({ textAlign: "justify" })}
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        >
          <AlignJustify className="h-4 w-4" />
        </ToolBtn>

        <Divider />

        <ToolBtn
          title="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          title="Numbered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          title="Checklist"
          active={editor.isActive("taskList")}
          onClick={() => editor.chain().focus().toggleTaskList().run()}
        >
          <CheckSquare className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          title="Decrease indent"
          onClick={() => editor.chain().focus().liftListItem("listItem").run()}
        >
          <IndentDecrease className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          title="Increase indent"
          onClick={() => editor.chain().focus().sinkListItem("listItem").run()}
        >
          <IndentIncrease className="h-4 w-4" />
        </ToolBtn>

        <Divider />

        <ToolBtn title="Insert link" active={editor.isActive("link")} onClick={setLink}>
          <Link2 className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          title="Remove link"
          disabled={!editor.isActive("link")}
          onClick={() => editor.chain().focus().unsetLink().run()}
        >
          <Link2Off className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          title={uploading ? "Uploading…" : "Insert image"}
          disabled={uploading}
          onClick={onPickImage}
        >
          <ImageIcon className="h-4 w-4" />
        </ToolBtn>
        <TableSizePicker
          active={editor.isActive("table")}
          onInsert={(rows, cols) =>
            editor
              .chain()
              .focus()
              .insertTable({ rows, cols, withHeaderRow: true })
              .run()
          }
        />

        {/* More menu */}
        <div className="relative ml-auto">
          <ToolBtn title="More options" onClick={() => setMoreOpen((o) => !o)}>
            <MoreHorizontal className="h-4 w-4" />
          </ToolBtn>
          <MenuShell
            open={moreOpen}
            onClose={() => setMoreOpen(false)}
            align="right"
            className="w-56 p-1"
          >
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs hover:bg-muted"
              onClick={() => {
                editor.chain().focus().toggleBlockquote().run();
                setMoreOpen(false);
              }}
            >
              <Quote className="h-3.5 w-3.5" /> Quote
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs hover:bg-muted"
              onClick={() => {
                editor.chain().focus().toggleCode().run();
                setMoreOpen(false);
              }}
            >
              <Code className="h-3.5 w-3.5" /> Inline code
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs hover:bg-muted"
              onClick={() => {
                editor.chain().focus().toggleCodeBlock().run();
                setMoreOpen(false);
              }}
            >
              <Code2 className="h-3.5 w-3.5" /> Code block
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs hover:bg-muted"
              onClick={() => {
                editor.chain().focus().toggleCallout({ variant: "info" }).run();
                setMoreOpen(false);
              }}
            >
              <Info className="h-3.5 w-3.5" /> Callout
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs hover:bg-muted"
              onClick={() => {
                editor.chain().focus().setHorizontalRule().run();
                setMoreOpen(false);
              }}
            >
              <Minus className="h-3.5 w-3.5" /> Divider
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs hover:bg-muted"
              onClick={() => {
                onInsertVideo();
                setMoreOpen(false);
              }}
            >
              <Video className="h-3.5 w-3.5" /> YouTube video
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs hover:bg-muted"
              onClick={() => {
                editor.chain().focus().toggleSubscript().run();
                setMoreOpen(false);
              }}
            >
              <Subscript className="h-3.5 w-3.5" /> Subscript
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs hover:bg-muted"
              onClick={() => {
                editor.chain().focus().toggleSuperscript().run();
                setMoreOpen(false);
              }}
            >
              <Superscript className="h-3.5 w-3.5" /> Superscript
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs hover:bg-muted"
              onClick={() => {
                setEmojiOpen(true);
                setMoreOpen(false);
              }}
            >
              <Smile className="h-3.5 w-3.5" /> Emoji
            </button>
            <div className="my-1 h-px bg-border/60" />
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs hover:bg-muted"
              onClick={() => {
                setTableOpen((o) => !o);
              }}
            >
              <TableProperties className="h-3.5 w-3.5" /> Table tools
            </button>
            {tableOpen && editor.isActive("table") ? (
              <div className="space-y-0.5 border-t border-border/50 pt-1">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs hover:bg-muted"
                  onClick={() => {
                    editor.chain().focus().addRowAfter().run();
                    setMoreOpen(false);
                  }}
                >
                  <Rows3 className="h-3.5 w-3.5" /> Add row
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs hover:bg-muted"
                  onClick={() => {
                    editor.chain().focus().addColumnAfter().run();
                    setMoreOpen(false);
                  }}
                >
                  <Columns3 className="h-3.5 w-3.5" /> Add column
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs hover:bg-muted"
                  onClick={() => {
                    editor.chain().focus().deleteRow().run();
                    setMoreOpen(false);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete row
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs hover:bg-muted"
                  onClick={() => {
                    editor.chain().focus().deleteColumn().run();
                    setMoreOpen(false);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete column
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-destructive hover:bg-muted"
                  onClick={() => {
                    editor.chain().focus().deleteTable().run();
                    setMoreOpen(false);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete table
                </button>
              </div>
            ) : null}
            <div className="my-1 h-px bg-border/60" />
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs hover:bg-muted"
              onClick={() => {
                clearFormatting();
                setMoreOpen(false);
              }}
            >
              <RemoveFormatting className="h-3.5 w-3.5" /> Clear formatting
            </button>
          </MenuShell>
        </div>

        <div className="relative">
          {emojiOpen ? (
            <div className="absolute right-0 top-9 z-50 grid w-56 grid-cols-6 gap-1 rounded-xl border border-border/60 bg-popover p-2 shadow-premium-lg">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className="rounded-md p-1 text-base hover:bg-muted"
                  onClick={() => {
                    editor.chain().focus().insertContent(emoji).run();
                    setEmojiOpen(false);
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-1 flex flex-wrap items-center justify-between gap-2 px-1">
        <p className="text-2xs text-muted-foreground">
          Type <kbd className="rounded border border-border/60 bg-muted px-1">/</kbd>{" "}
          for blocks · Paste from Docs/Word · Drag images
        </p>
        <p className="text-2xs tabular-nums text-muted-foreground">
          {wordCount} words · {charCount} chars
        </p>
      </div>
    </div>
  );
}

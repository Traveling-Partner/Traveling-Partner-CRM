"use client";

import type { Editor } from "@tiptap/react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  CheckSquare,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  Smile,
  Strikethrough,
  Underline,
  Undo2,
  Video,
  Info,
  Code
} from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TableSizePicker } from "@/components/blog/TableSizePicker";

const EMOJIS = [
  "😀", "😁", "😂", "🤣", "😊", "😍", "🤔", "😎", "🙌", "👍",
  "🔥", "✨", "💡", "📌", "✅", "❌", "⭐", "❤️", "🌍", "✈️",
  "🗺️", "🏖️", "⛰️", "🏨", "🚗", "📸", "🎉", "💬", "📝", "⚡"
];

function ToolBtn({
  active,
  disabled,
  title,
  onClick,
  children
}: {
  active?: boolean;
  disabled?: boolean;
  title: string;
  onClick: () => void;
  children: React.ReactNode;
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
        "h-8 w-8 shrink-0 rounded-lg text-muted-foreground",
        active && "bg-[var(--brand-light-active)] text-foreground"
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

interface BlogEditorToolbarProps {
  editor: Editor;
  uploading?: boolean;
  onPickImage: () => void;
  onInsertVideo: () => void;
}

export function BlogEditorToolbar({
  editor,
  uploading,
  onPickImage,
  onInsertVideo
}: BlogEditorToolbarProps) {
  const [emojiOpen, setEmojiOpen] = useState(false);
  const emojiRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="sticky top-0 z-20 border-b border-border/60 bg-card/95 px-2 py-1.5 backdrop-blur supports-[backdrop-filter]:bg-card/80">
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

        <ToolBtn
          title="Paragraph"
          active={editor.isActive("paragraph") && !editor.isActive("heading")}
          onClick={() => editor.chain().focus().setParagraph().run()}
        >
          <Pilcrow className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          title="Heading 1"
          active={editor.isActive("heading", { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          title="Heading 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          title="Heading 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="h-4 w-4" />
        </ToolBtn>

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
        <ToolBtn
          title="Highlight"
          active={editor.isActive("highlight")}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
        >
          <Highlighter className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          title="Inline code"
          active={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Code className="h-4 w-4" />
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

        <Divider />

        <ToolBtn
          title="Blockquote"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          title="Code block"
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <Code2 className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          title="Callout"
          active={editor.isActive("callout")}
          onClick={() => editor.chain().focus().toggleCallout({ variant: "info" }).run()}
        >
          <Info className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          title="Divider"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus className="h-4 w-4" />
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
        <ToolBtn title="Link" active={editor.isActive("link")} onClick={setLink}>
          <Link2 className="h-4 w-4" />
        </ToolBtn>

        <Divider />

        <ToolBtn
          title={uploading ? "Uploading…" : "Insert image"}
          disabled={uploading}
          onClick={onPickImage}
        >
          <ImageIcon className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn title="YouTube video" onClick={onInsertVideo}>
          <Video className="h-4 w-4" />
        </ToolBtn>

        <div className="relative" ref={emojiRef}>
          <ToolBtn title="Emoji" onClick={() => setEmojiOpen((o) => !o)}>
            <Smile className="h-4 w-4" />
          </ToolBtn>
          {emojiOpen ? (
            <div className="absolute right-0 top-9 z-30 grid w-56 grid-cols-6 gap-1 rounded-xl border border-border/60 bg-popover p-2 shadow-premium-lg">
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
      <p className="mt-1 px-1 text-2xs text-muted-foreground">
        Type <kbd className="rounded border border-border/60 bg-muted px-1">/</kbd> for
        blocks · Paste from Word, Docs, or Markdown · Drag or paste images
      </p>
    </div>
  );
}

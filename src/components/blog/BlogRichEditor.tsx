"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface BlogRichEditorProps {
  value: string;
  onChange: (html: string) => void;
}

export function BlogRichEditor({ value, onChange }: BlogRichEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "<p>Start writing your post...</p>",
    editorProps: {
      attributes: {
        class:
          "min-h-[180px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm prose prose-sm max-w-none prose-headings:font-heading focus-visible:outline-none"
      }
    },
    onUpdate({ editor: ed }) {
      onChange(ed.getHTML());
    }
  });

  useEffect(() => {
    if (editor && value && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  if (!editor) return null;

  const toggle = (cmd: () => void) => {
    cmd();
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1 rounded-md border border-border/60 bg-muted/40 px-2 py-1.5">
        <Button
          type="button"
          variant={editor.isActive("bold") ? "default" : "ghost"}
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() => toggle(() => editor.chain().focus().toggleBold().run())}
        >
          Bold
        </Button>
        <Button
          type="button"
          variant={editor.isActive("italic") ? "default" : "ghost"}
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() =>
            toggle(() => editor.chain().focus().toggleItalic().run())
          }
        >
          Italic
        </Button>
        <Button
          type="button"
          variant={editor.isActive("bulletList") ? "default" : "ghost"}
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() =>
            toggle(() => editor.chain().focus().toggleBulletList().run())
          }
        >
          Bullet list
        </Button>
        <Button
          type="button"
          variant={editor.isActive("orderedList") ? "default" : "ghost"}
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() =>
            toggle(() => editor.chain().focus().toggleOrderedList().run())
          }
        >
          Numbered
        </Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}


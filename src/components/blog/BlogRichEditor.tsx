"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Youtube from "@tiptap/extension-youtube";
import { uploadCarouselImage } from "@/lib/upload-carousel-image";
import { cn } from "@/lib/utils";
import { Callout } from "@/components/blog/extensions/callout";
import { ResizableImage } from "@/components/blog/extensions/resizable-image";
import {
  SlashCommand,
  createSlashSuggestion,
  getSlashItems
} from "@/components/blog/extensions/slash-command";
import { BlogEditorToolbar } from "@/components/blog/BlogEditorToolbar";
import { TableSizePickerPanel } from "@/components/blog/TableSizePicker";
import "@/components/blog/blog-content.css";
import "tippy.js/dist/tippy.css";

interface BlogRichEditorProps {
  value: string;
  onChange: (html: string) => void;
  token?: string | null;
  onUploadError?: (message: string) => void;
  className?: string;
}

function isImageFile(file: File | null | undefined): file is File {
  return Boolean(file && file.type.startsWith("image/"));
}

export function BlogRichEditor({
  value,
  onChange,
  token = null,
  onUploadError,
  className
}: BlogRichEditorProps) {
  const lastEmitted = useRef(value);
  const editorRef = useRef<Editor | null>(null);
  const uploadRef = useRef<(files: FileList | File[]) => Promise<void>>(async () => {});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [tablePickerOpen, setTablePickerOpen] = useState(false);
  const helpersRef = useRef({
    onRequestImage: () => {},
    onRequestGallery: () => {},
    onRequestVideo: () => {},
    onRequestTable: () => {}
  });

  const insertImageUrl = useCallback((ed: Editor, url: string, caption = "") => {
    ed.chain()
      .focus()
      .insertContent({
        type: "image",
        attrs: { src: url, align: "center", caption, alt: caption || "Image" }
      })
      .run();
  }, []);

  const uploadAndInsert = useCallback(
    async (ed: Editor, files: FileList | File[]) => {
      const list = Array.from(files).filter(isImageFile);
      if (!list.length) return;

      setUploading(true);
      try {
        for (const file of list) {
          const url = await uploadCarouselImage(file, token);
          insertImageUrl(ed, url);
        }
      } catch (e) {
        onUploadError?.(e instanceof Error ? e.message : "Image upload failed.");
      } finally {
        setUploading(false);
      }
    },
    [insertImageUrl, onUploadError, token]
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: { HTMLAttributes: { class: "blog-code-block" } },
        dropcursor: { color: "#fdb813", width: 2 }
      }),
      Underline,
      Highlight.configure({ multicolor: false }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" }
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"]
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({
        resizable: true,
        HTMLAttributes: { class: "blog-table" }
      }),
      TableRow,
      TableHeader,
      TableCell,
      ResizableImage.configure({
        allowBase64: false,
        HTMLAttributes: { class: "blog-image-img" }
      }),
      Youtube.configure({
        width: 640,
        height: 360,
        HTMLAttributes: { class: "blog-youtube" },
        modestBranding: true
      }),
      Callout,
      Placeholder.configure({
        placeholder: "Start writing… Type / for commands"
      }),
      SlashCommand.configure({
        suggestion: createSlashSuggestion(() =>
          getSlashItems({
            onRequestImage: () => helpersRef.current.onRequestImage(),
            onRequestGallery: () => helpersRef.current.onRequestGallery(),
            onRequestVideo: () => helpersRef.current.onRequestVideo(),
            onRequestTable: () => helpersRef.current.onRequestTable()
          })
        )
      })
    ],
    content: value?.trim() ? value : "",
    editorProps: {
      attributes: {
        class: "blog-prose focus-visible:outline-none",
        spellcheck: "true"
      },
      handlePaste: (_view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;
        const files: File[] = [];
        for (const item of Array.from(items)) {
          if (item.type.startsWith("image/")) {
            const file = item.getAsFile();
            if (file) files.push(file);
          }
        }
        if (!files.length) return false;
        event.preventDefault();
        void uploadRef.current(files);
        return true;
      },
      handleDrop: (_view, event, _slice, moved) => {
        if (moved) return false;
        const files = event.dataTransfer?.files;
        if (!files?.length) return false;
        const images = Array.from(files).filter(isImageFile);
        if (!images.length) return false;
        event.preventDefault();
        void uploadRef.current(images);
        return true;
      }
    },
    onUpdate({ editor: ed }) {
      const html = ed.getHTML();
      lastEmitted.current = html;
      onChange(html);
    }
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  useEffect(() => {
    uploadRef.current = async (files) => {
      const ed = editorRef.current;
      if (!ed) return;
      await uploadAndInsert(ed, files);
    };
  }, [uploadAndInsert]);

  useEffect(() => {
    helpersRef.current = {
      onRequestImage: () => fileInputRef.current?.click(),
      onRequestGallery: () => galleryInputRef.current?.click(),
      onRequestVideo: () => {
        const ed = editorRef.current;
        if (!ed) return;
        const url = window.prompt("Paste a YouTube URL");
        if (!url?.trim()) return;
        ed.commands.setYoutubeVideo({ src: url.trim() });
      },
      onRequestTable: () => {
        setTablePickerOpen(true);
      }
    };
  }, []);

  useEffect(() => {
    if (!editor) return;
    if (value !== lastEmitted.current && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", false);
      lastEmitted.current = value;
    }
  }, [value, editor]);

  const onPickImage = () => fileInputRef.current?.click();

  const onInsertVideo = () => {
    if (!editor) return;
    const url = window.prompt("Paste a YouTube URL");
    if (!url?.trim()) return;
    editor.commands.setYoutubeVideo({ src: url.trim() });
  };

  const onFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    multi = false
  ) => {
    const input = event.currentTarget;
    const files = input.files;
    if (!files?.length || !editor) return;
    await uploadAndInsert(editor, multi ? files : [files[0]]);
    input.value = "";
  };

  if (!editor) {
    return (
      <div
        className={cn(
          "flex min-h-[480px] items-center justify-center rounded-xl border border-border/60 bg-card text-sm text-muted-foreground",
          className
        )}
      >
        Loading editor…
      </div>
    );
  }

  return (
    <div
      className={cn(
        "blog-editor-surface relative overflow-hidden rounded-xl border border-border/60 bg-card shadow-premium-xs",
        className
      )}
    >
      <BlogEditorToolbar
        editor={editor}
        uploading={uploading}
        onPickImage={onPickImage}
        onInsertVideo={onInsertVideo}
      />
      {uploading ? (
        <div className="border-b border-border/60 bg-[var(--brand-light)] px-4 py-1.5 text-2xs font-medium text-foreground">
          Uploading image…
        </div>
      ) : null}
      <EditorContent editor={editor} />
      {tablePickerOpen ? (
        <div className="absolute inset-0 z-30 flex items-start justify-center bg-background/40 pt-16 backdrop-blur-[1px]">
          <TableSizePickerPanel
            onInsert={(rows, cols) => {
              editor
                .chain()
                .focus()
                .insertTable({ rows, cols, withHeaderRow: true })
                .run();
              setTablePickerOpen(false);
            }}
            onCancel={() => setTablePickerOpen(false)}
          />
        </div>
      ) : null}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void onFileChange(e, false)}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => void onFileChange(e, true)}
      />
    </div>
  );
}

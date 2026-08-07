"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, BubbleMenu, type Editor } from "@tiptap/react";
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
import TextStyle from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import CharacterCount from "@tiptap/extension-character-count";
import Typography from "@tiptap/extension-typography";
import { Bold, Italic, Underline as UnderlineIcon, Link2, Highlighter } from "lucide-react";
import { uploadCarouselImage } from "@/lib/upload-carousel-image";
import { cn } from "@/lib/utils";
import { Callout } from "@/components/blog/extensions/callout";
import { FontSize } from "@/components/blog/extensions/font-size";
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

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const editor = useEditor({
    immediatelyRender: false,
    editable: true,
    autofocus: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        codeBlock: { HTMLAttributes: { class: "blog-code-block" } },
        dropcursor: { color: "#fdb813", width: 2 }
      }),
      Underline,
      TextStyle,
      FontSize,
      FontFamily,
      Color,
      Highlight.configure({ multicolor: true }),
      Subscript,
      Superscript,
      Typography,
      CharacterCount,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" }
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"]
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
        placeholder: "Start writing… Type / for commands",
        emptyEditorClass: "is-editor-empty",
        emptyNodeClass: "is-empty",
        showOnlyWhenEditable: true,
        showOnlyCurrent: true
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
    content: value?.trim() ? value : "<p></p>",
    editorProps: {
      attributes: {
        class:
          "blog-prose tiptap focus-visible:outline-none text-slate-900 dark:text-slate-50",
        spellcheck: "true",
        style: "min-height:420px;color:#0f172a;"
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
      onChangeRef.current(html);
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

  // Never reset content while the user is typing — only sync external loads/resets.
  useEffect(() => {
    if (!editor) return;
    if (value === lastEmitted.current) return;
    if (editor.isFocused) return;
    const current = editor.getHTML();
    if (value === current) {
      lastEmitted.current = value;
      return;
    }
    editor.commands.setContent(value?.trim() ? value : "<p></p>", false);
    lastEmitted.current = value;
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

  const chars = editor.storage.characterCount?.characters?.() ?? 0;
  const words = editor.storage.characterCount?.words?.() ?? 0;

  return (
    <div
      className={cn(
        "blog-editor-surface relative flex flex-col rounded-xl border border-border/60 bg-card shadow-premium-xs",
        className
      )}
    >
      {/* Sticky toolbar — flush under app header, no empty gap */}
      <div className="blog-editor-toolbar-sticky sticky top-14 z-20 border-b border-border/50 bg-card shadow-sm">
        <BlogEditorToolbar
          editor={editor}
          uploading={uploading}
          onPickImage={onPickImage}
          onInsertVideo={onInsertVideo}
          wordCount={words}
          charCount={chars}
        />
        {uploading ? (
          <div className="bg-[var(--brand-light)] px-3 py-1 text-2xs font-medium text-foreground">
            Uploading image…
          </div>
        ) : null}
      </div>

      {editor ? (
        <BubbleMenu
          editor={editor}
          shouldShow={({ from, to }) => from !== to}
          tippyOptions={{ duration: 120, placement: "top", zIndex: 50 }}
          className="flex items-center gap-0.5 rounded-full border border-border/60 bg-popover px-1.5 py-1 shadow-premium-lg"
        >
          <button
            type="button"
            className={cn(
              "rounded-full p-1.5 hover:bg-muted",
              editor.isActive("bold") && "bg-muted"
            )}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className={cn(
              "rounded-full p-1.5 hover:bg-muted",
              editor.isActive("italic") && "bg-muted"
            )}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className={cn(
              "rounded-full p-1.5 hover:bg-muted",
              editor.isActive("underline") && "bg-muted"
            )}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className={cn(
              "rounded-full p-1.5 hover:bg-muted",
              editor.isActive("highlight") && "bg-muted"
            )}
            onClick={() => editor.chain().focus().toggleHighlight().run()}
          >
            <Highlighter className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className={cn(
              "rounded-full p-1.5 hover:bg-muted",
              editor.isActive("link") && "bg-muted"
            )}
            onClick={() => {
              const prev = editor.getAttributes("link").href as string | undefined;
              const url = window.prompt("Enter URL", prev || "https://");
              if (url === null) return;
              if (!url.trim()) {
                editor.chain().focus().unsetLink().run();
                return;
              }
              editor.chain().focus().setLink({ href: url.trim(), target: "_blank" }).run();
            }}
          >
            <Link2 className="h-3.5 w-3.5" />
          </button>
        </BubbleMenu>
      ) : null}

      <div
        className="blog-editor-body min-h-[420px] cursor-text"
        onMouseDown={(e) => {
          // Clicking empty padding still focuses the editor so typing works immediately
          const target = e.target as HTMLElement;
          if (target.closest(".ProseMirror")) return;
          e.preventDefault();
          editor.chain().focus("end").run();
        }}
      >
        <EditorContent editor={editor} />
      </div>

      <div className="flex items-center justify-between border-t border-border/50 bg-muted/30 px-3 py-1.5 text-2xs text-muted-foreground">
        <span>Paste from Docs/Word · Drag or paste images</span>
        <span className="tabular-nums">
          {words} words · {chars} chars
        </span>
      </div>

      {tablePickerOpen ? (
        <div className="absolute inset-0 z-30 flex items-start justify-center bg-background/40 pt-20 backdrop-blur-[1px]">
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

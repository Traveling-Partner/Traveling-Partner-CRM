"use client";

import { Extension } from "@tiptap/core";
import { ReactRenderer } from "@tiptap/react";
import Suggestion, { type SuggestionOptions } from "@tiptap/suggestion";
import tippy, { type Instance as TippyInstance } from "tippy.js";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState
} from "react";
import {
  Code2,
  Divide,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  Info,
  LayoutGrid,
  ListChecks,
  Quote,
  Table2,
  Video
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Editor, Range } from "@tiptap/core";

export type SlashItem = {
  title: string;
  description: string;
  icon: React.ReactNode;
  keywords: string;
  command: (props: { editor: Editor; range: Range }) => void;
};

export function getSlashItems(helpers: {
  onRequestImage: () => void;
  onRequestGallery: () => void;
  onRequestVideo: () => void;
  onRequestTable: () => void;
}): SlashItem[] {
  return [
    {
      title: "Heading 1",
      description: "Large section heading",
      keywords: "h1 title",
      icon: <Heading1 className="h-4 w-4" />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run();
      }
    },
    {
      title: "Heading 2",
      description: "Medium section heading",
      keywords: "h2 subtitle",
      icon: <Heading2 className="h-4 w-4" />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run();
      }
    },
    {
      title: "Heading 3",
      description: "Small section heading",
      keywords: "h3",
      icon: <Heading3 className="h-4 w-4" />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run();
      }
    },
    {
      title: "Quote",
      description: "Capture a quote",
      keywords: "blockquote",
      icon: <Quote className="h-4 w-4" />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleBlockquote().run();
      }
    },
    {
      title: "Table",
      description: "Choose rows and columns",
      keywords: "grid spreadsheet",
      icon: <Table2 className="h-4 w-4" />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).run();
        helpers.onRequestTable();
      }
    },
    {
      title: "Image",
      description: "Upload or insert an image",
      keywords: "photo picture media",
      icon: <ImageIcon className="h-4 w-4" />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).run();
        helpers.onRequestImage();
      }
    },
    {
      title: "Gallery",
      description: "Upload multiple images",
      keywords: "photos collage",
      icon: <LayoutGrid className="h-4 w-4" />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).run();
        helpers.onRequestGallery();
      }
    },
    {
      title: "Video",
      description: "Embed a YouTube URL",
      keywords: "youtube embed",
      icon: <Video className="h-4 w-4" />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).run();
        helpers.onRequestVideo();
      }
    },
    {
      title: "Divider",
      description: "Visual separator",
      keywords: "hr line horizontal",
      icon: <Divide className="h-4 w-4" />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setHorizontalRule().run();
      }
    },
    {
      title: "Checklist",
      description: "Track tasks with checkboxes",
      keywords: "todo task checkbox",
      icon: <ListChecks className="h-4 w-4" />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleTaskList().run();
      }
    },
    {
      title: "Code",
      description: "Code block with monospace",
      keywords: "snippet pre",
      icon: <Code2 className="h-4 w-4" />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
      }
    },
    {
      title: "Callout",
      description: "Highlighted info box",
      keywords: "aside tip note warning",
      icon: <Info className="h-4 w-4" />,
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setCallout({ variant: "info" })
          .run();
      }
    }
  ];
}

type MenuProps = {
  items: SlashItem[];
  command: (item: SlashItem) => void;
};

type MenuRef = {
  onKeyDown: (props: { event: globalThis.KeyboardEvent }) => boolean;
};

const SlashCommandList = forwardRef<MenuRef, MenuProps>(function SlashCommandList(
  { items, command },
  ref
) {
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    setSelected(0);
  }, [items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === "ArrowUp") {
        setSelected((i) => (i + items.length - 1) % items.length);
        return true;
      }
      if (event.key === "ArrowDown") {
        setSelected((i) => (i + 1) % items.length);
        return true;
      }
      if (event.key === "Enter") {
        const item = items[selected];
        if (item) command(item);
        return true;
      }
      return false;
    }
  }));

  if (!items.length) {
    return (
      <div className="rounded-xl border border-border/60 bg-popover px-3 py-2 text-xs text-muted-foreground shadow-premium-lg">
        No results
      </div>
    );
  }

  return (
    <div className="z-50 max-h-72 w-64 overflow-y-auto rounded-xl border border-border/60 bg-popover p-1 shadow-premium-lg scrollbar-thin">
      {items.map((item, index) => (
        <button
          key={item.title}
          type="button"
          className={cn(
            "flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors",
            index === selected ? "bg-[var(--brand-light-active)]" : "hover:bg-muted/80"
          )}
          onClick={() => command(item)}
        >
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border/60 bg-background text-foreground">
            {item.icon}
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-medium text-foreground">{item.title}</span>
            <span className="block text-2xs text-muted-foreground">{item.description}</span>
          </span>
        </button>
      ))}
    </div>
  );
});

export function createSlashSuggestion(
  getItems: () => SlashItem[]
): Omit<SuggestionOptions, "editor"> {
  return {
    char: "/",
    allowSpaces: false,
    startOfLine: false,
    items: ({ query }) => {
      const q = query.toLowerCase().trim();
      return getItems().filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.keywords.toLowerCase().includes(q)
      );
    },
    render: () => {
      let component: ReactRenderer<MenuRef> | null = null;
      let popup: TippyInstance[] | null = null;

      return {
        onStart: (props) => {
          component = new ReactRenderer(SlashCommandList, {
            props: {
              items: props.items,
              command: (item: SlashItem) => {
                item.command({ editor: props.editor, range: props.range });
              }
            },
            editor: props.editor
          });

          if (!props.clientRect) return;

          popup = tippy("body", {
            getReferenceClientRect: props.clientRect as () => DOMRect,
            appendTo: () => document.body,
            content: component.element,
            showOnCreate: true,
            interactive: true,
            trigger: "manual",
            placement: "bottom-start",
            animation: "shift-away",
            theme: "none"
          });
        },
        onUpdate: (props) => {
          component?.updateProps({
            items: props.items,
            command: (item: SlashItem) => {
              item.command({ editor: props.editor, range: props.range });
            }
          });
          if (popup?.[0] && props.clientRect) {
            popup[0].setProps({
              getReferenceClientRect: props.clientRect as () => DOMRect
            });
          }
        },
        onKeyDown: (props) => {
          if (props.event.key === "Escape") {
            popup?.[0]?.hide();
            return true;
          }
          return component?.ref?.onKeyDown(props) ?? false;
        },
        onExit: () => {
          popup?.[0]?.destroy();
          component?.destroy();
        }
      };
    }
  };
}

export const SlashCommand = Extension.create({
  name: "slashCommand",

  addOptions() {
    return {
      suggestion: {} as Omit<SuggestionOptions, "editor">
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion
      })
    ];
  }
});

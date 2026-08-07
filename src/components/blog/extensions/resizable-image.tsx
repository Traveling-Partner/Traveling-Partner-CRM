"use client";

import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from "@tiptap/react";
import Image from "@tiptap/extension-image";
import { useCallback, useRef, useState } from "react";
import { AlignCenter, AlignLeft, AlignRight, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ImageAlign = "left" | "center" | "right";

function ResizableImageView({ node, updateAttributes, deleteNode, selected }: NodeViewProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [dragging, setDragging] = useState(false);
  const align = (node.attrs.align as ImageAlign) || "center";
  const width = node.attrs.width as number | null;

  const startResize = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const startX = event.clientX;
      const startWidth = imgRef.current?.getBoundingClientRect().width ?? 400;
      setDragging(true);

      const onMove = (e: MouseEvent) => {
        const delta = e.clientX - startX;
        const next = Math.min(Math.max(120, Math.round(startWidth + delta)), 900);
        updateAttributes({ width: next });
      };
      const onUp = () => {
        setDragging(false);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [updateAttributes]
  );

  return (
    <NodeViewWrapper
      className={cn(
        "blog-image-node my-4",
        align === "left" && "text-left",
        align === "center" && "text-center",
        align === "right" && "text-right"
      )}
      data-drag-handle
    >
      <figure
        className={cn(
          "blog-image relative inline-block max-w-full",
          selected && "ring-2 ring-[var(--brand-focus-ring)] rounded-xl"
        )}
        style={{ width: width ? `${width}px` : undefined }}
        data-align={align}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={node.attrs.src}
          alt={node.attrs.alt || ""}
          className="h-auto w-full rounded-xl border border-border/60 object-cover"
          draggable={false}
        />
        {selected ? (
          <div className="absolute -top-10 left-1/2 z-10 flex -translate-x-1/2 items-center gap-0.5 rounded-full border border-border/60 bg-card px-1.5 py-1 shadow-premium-md">
            <button
              type="button"
              className={cn(
                "rounded-full p-1.5 hover:bg-muted",
                align === "left" && "bg-muted"
              )}
              title="Align left"
              onClick={() => updateAttributes({ align: "left" })}
            >
              <AlignLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              className={cn(
                "rounded-full p-1.5 hover:bg-muted",
                align === "center" && "bg-muted"
              )}
              title="Align center"
              onClick={() => updateAttributes({ align: "center" })}
            >
              <AlignCenter className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              className={cn(
                "rounded-full p-1.5 hover:bg-muted",
                align === "right" && "bg-muted"
              )}
              title="Align right"
              onClick={() => updateAttributes({ align: "right" })}
            >
              <AlignRight className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              className="rounded-full p-1.5 text-destructive hover:bg-muted"
              title="Remove image"
              onClick={() => deleteNode()}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : null}
        {selected ? (
          <span
            className={cn(
              "absolute bottom-2 right-2 h-3.5 w-3.5 cursor-se-resize rounded-sm border-2 border-background bg-[#fdb813]",
              dragging && "scale-110"
            )}
            onMouseDown={startResize}
            title="Drag to resize"
          />
        ) : null}
        <figcaption className="mt-2">
          <input
            type="text"
            className="w-full border-0 bg-transparent text-center text-xs text-muted-foreground outline-none placeholder:text-muted-foreground/60"
            placeholder="Add a caption…"
            value={node.attrs.caption || ""}
            onChange={(e) => updateAttributes({ caption: e.target.value })}
          />
        </figcaption>
      </figure>
    </NodeViewWrapper>
  );
}

export const ResizableImage = Image.extend({
  name: "image",
  group: "block",
  draggable: true,
  selectable: true,
  atom: true,

  addAttributes() {
    return {
      ...this.parent?.(),
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: {
        default: null,
        parseHTML: (element) => {
          const figure = element.closest("figure");
          const w =
            element.getAttribute("width") ||
            figure?.getAttribute("data-width") ||
            (element as HTMLElement).style?.width;
          if (!w) return null;
          const n = parseInt(String(w), 10);
          return Number.isFinite(n) ? n : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.width) return {};
          return {
            width: attributes.width,
            style: `width: ${attributes.width}px; max-width: 100%;`
          };
        }
      },
      align: {
        default: "center",
        parseHTML: (element) =>
          element.closest("figure")?.getAttribute("data-align") ||
          element.getAttribute("data-align") ||
          "center",
        renderHTML: (attributes) => ({
          "data-align": attributes.align || "center"
        })
      },
      caption: {
        default: "",
        parseHTML: (element) => {
          const fig = element.closest("figure");
          const caption = fig?.querySelector("figcaption");
          return caption?.textContent?.trim() || "";
        },
        renderHTML: () => ({})
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: "figure.blog-image",
        getAttrs: (node) => {
          const el = node as HTMLElement;
          const img = el.querySelector("img");
          if (!img) return false;
          return {
            src: img.getAttribute("src"),
            alt: img.getAttribute("alt"),
            title: img.getAttribute("title"),
            align: el.getAttribute("data-align") || "center",
            width: el.getAttribute("data-width")
              ? Number(el.getAttribute("data-width"))
              : null,
            caption: el.querySelector("figcaption")?.textContent?.trim() || ""
          };
        }
      },
      { tag: "img[src]" }
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { caption, align, width, ...imgAttrs } = HTMLAttributes as Record<
      string,
      unknown
    > & { caption?: string; align?: string; width?: number };
    const figureAttrs: Record<string, string> = {
      class: "blog-image",
      "data-align": String(align || "center")
    };
    if (width) figureAttrs["data-width"] = String(width);

    const img: [string, Record<string, unknown>] = [
      "img",
      {
        ...imgAttrs,
        ...(width
          ? { width, style: `width: ${width}px; max-width: 100%; height: auto;` }
          : { style: "max-width: 100%; height: auto;" })
      }
    ];

    if (caption) {
      return ["figure", figureAttrs, img, ["figcaption", {}, String(caption)]];
    }
    return ["figure", figureAttrs, img];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  }
});

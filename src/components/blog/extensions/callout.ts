import { Node, mergeAttributes, wrappingInputRule } from "@tiptap/core";

export type CalloutVariant = "info" | "warning" | "success" | "tip";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    callout: {
      setCallout: (attrs?: { variant?: CalloutVariant }) => ReturnType;
      toggleCallout: (attrs?: { variant?: CalloutVariant }) => ReturnType;
      unsetCallout: () => ReturnType;
    };
  }
}

export const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,

  addAttributes() {
    return {
      variant: {
        default: "info",
        parseHTML: (element) =>
          element.getAttribute("data-variant") || "info",
        renderHTML: (attributes) => ({
          "data-variant": attributes.variant || "info"
        })
      }
    };
  },

  parseHTML() {
    return [{ tag: 'aside[data-type="callout"]' }, { tag: "aside.blog-callout" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "aside",
      mergeAttributes(HTMLAttributes, {
        class: "blog-callout",
        "data-type": "callout"
      }),
      0
    ];
  },

  addCommands() {
    return {
      setCallout:
        (attrs) =>
        ({ commands }) =>
          commands.wrapIn(this.name, attrs),
      toggleCallout:
        (attrs) =>
        ({ commands }) =>
          commands.toggleWrap(this.name, attrs),
      unsetCallout:
        () =>
        ({ commands }) =>
          commands.lift(this.name)
    };
  },

  addInputRules() {
    return [
      wrappingInputRule({
        find: /^>\s$/,
        type: this.type,
        getAttributes: () => ({ variant: "info" })
      })
    ];
  }
});

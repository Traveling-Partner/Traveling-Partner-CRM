const DROPPED_TAGS = new Set([
  "script",
  "iframe",
  "object",
  "embed",
  "link",
  "meta",
  "style",
  "form",
  "base"
]);

function stripDangerousMarkup(html: string): string {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, "")
    .replace(/<object[\s\S]*?>[\s\S]*?<\/object>/gi, "")
    .replace(/<embed[\s\S]*?>/gi, "")
    .replace(/\son\w+\s*=\s*(['"]).*?\1/gi, "")
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, "")
    .replace(/javascript:/gi, "");
}

/** Removes scripts and event handlers before blog HTML is shown. */
export function sanitizeBlogHtml(html: string): string {
  const source = html.trim();
  if (!source) return "";
  if (typeof window === "undefined" || typeof DOMParser === "undefined") {
    return stripDangerousMarkup(source);
  }

  const doc = new DOMParser().parseFromString(source, "text/html");
  doc.querySelectorAll(Array.from(DROPPED_TAGS).join(",")).forEach((node) => node.remove());

  doc.body.querySelectorAll("*").forEach((element) => {
    for (const attr of Array.from(element.attributes)) {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim().toLowerCase();
      if (name.startsWith("on") || name === "srcdoc") {
        element.removeAttribute(attr.name);
        continue;
      }
      if ((name === "href" || name === "src" || name === "xlink:href") && value.startsWith("javascript:")) {
        element.removeAttribute(attr.name);
      }
    }
  });

  return doc.body.innerHTML;
}

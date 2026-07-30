"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, ImageIcon, Paperclip, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import type {
  SosCaseNote,
  SosNoteAttachment,
  SosNoteAttachmentKind,
  SosNoteChannel
} from "@/types/safety-center";
import { cn } from "@/lib/utils";

const CHANNELS: { id: SosNoteChannel; label: string; hint: string }[] = [
  { id: "RIDER", label: "Rider", hint: "Notes from / about the rider side" },
  { id: "PARTNER", label: "Partner", hint: "Notes from / about the partner side" },
  { id: "SAFETY_DESK", label: "Safety Desk", hint: "Comments from our safety / support desk" }
];

function kindFromFile(file: File): SosNoteAttachmentKind {
  const name = file.name.toLowerCase();
  if (name.includes("screenshot") || name.includes("ss")) return "SCREENSHOT";
  if (file.type.startsWith("image/")) return "IMAGE";
  return "DOCUMENT";
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function SosCaseNotesPanel({
  notes,
  onChange,
  authors
}: {
  notes: SosCaseNote[];
  onChange: (next: SosCaseNote[]) => void;
  /** Display names for each note channel (rider / partner / safety desk). */
  authors?: Partial<Record<SosNoteChannel, string>>;
}) {
  const { success } = useToast();
  const [channel, setChannel] = useState<SosNoteChannel>("RIDER");
  const [body, setBody] = useState("");
  const [pendingFiles, setPendingFiles] = useState<SosNoteAttachment[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const authorFor = (ch: SosNoteChannel) => {
    const custom = authors?.[ch]?.trim();
    if (ch === "RIDER") return custom ? `Rider · ${custom}` : "Rider";
    if (ch === "PARTNER") return custom ? `Partner · ${custom}` : "Partner";
    return custom || "Safety Desk";
  };

  useEffect(() => {
    setBody("");
    setPendingFiles([]);
    if (fileRef.current) fileRef.current.value = "";
  }, [channel]);

  const channelNotes = notes
    .filter((n) => n.channel === channel)
    .slice()
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  const addFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const next: SosNoteAttachment[] = Array.from(fileList).map((file) => ({
      id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: file.name,
      kind: kindFromFile(file),
      url: URL.createObjectURL(file),
      sizeLabel: formatSize(file.size)
    }));
    setPendingFiles((prev) => [...prev, ...next]);
  };

  const submit = () => {
    const text = body.trim();
    if (!text && pendingFiles.length === 0) return;

    const note: SosCaseNote = {
      id: `note-${Date.now()}`,
      channel,
      body: text || "(Attachment only)",
      author: authorFor(channel),
      createdAt: new Date().toISOString(),
      attachments: pendingFiles
    };
    onChange([note, ...notes]);
    setBody("");
    setPendingFiles([]);
    if (fileRef.current) fileRef.current.value = "";
    success("Note added");
  };

  return (
    <div className="space-y-4">
      <Tabs value={channel} onValueChange={(v) => setChannel(v as SosNoteChannel)}>
        <TabsList className="flex h-auto w-full flex-wrap">
          {CHANNELS.map((c) => (
            <TabsTrigger key={c.id} value={c.id} className="min-w-[6.5rem] flex-1">
              {c.label}
              <span className="ml-1.5 text-[10px] opacity-70">
                ({notes.filter((n) => n.channel === c.id).length})
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {CHANNELS.map((c) => (
          <TabsContent key={c.id} value={c.id} className="space-y-4 pt-2">
            <p className="text-xs text-muted-foreground">{c.hint}</p>

            {channel === c.id && (
              <div className="space-y-2 rounded-xl border border-border/60 bg-muted/10 p-3">
                <Textarea
                  placeholder={`Add a ${c.label.toLowerCase()} note…`}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={3}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={fileRef}
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    onChange={(e) => {
                      addFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => fileRef.current?.click()}
                  >
                    <Paperclip className="mr-1.5 h-3.5 w-3.5" />
                    Attach img / SS / doc
                  </Button>
                  <Button type="button" size="sm" onClick={submit}>
                    Add note
                  </Button>
                </div>
                {pendingFiles.length > 0 && (
                  <ul className="space-y-1.5 pt-1">
                    {pendingFiles.map((f) => (
                      <li
                        key={f.id}
                        className="flex items-center justify-between gap-2 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs"
                      >
                        <span className="truncate">
                          {f.kind}: {f.name} · {f.sizeLabel}
                        </span>
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-foreground"
                          aria-label="Remove attachment"
                          onClick={() =>
                            setPendingFiles((prev) => prev.filter((x) => x.id !== f.id))
                          }
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {channelNotes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No notes yet in this channel.</p>
            ) : (
              <ul className="space-y-3">
                {channelNotes.map((note) => (
                  <li
                    key={note.id}
                    className="rounded-xl border border-border/60 bg-card px-3 py-3 text-sm"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-medium">{note.author}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(note.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <p className="mt-1.5 whitespace-pre-wrap text-muted-foreground">{note.body}</p>
                    {note.attachments.length > 0 && (
                      <ul className="mt-2 flex flex-wrap gap-2">
                        {note.attachments.map((att) => (
                          <AttachmentChip key={att.id} attachment={att} />
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function AttachmentChip({ attachment }: { attachment: SosNoteAttachment }) {
  const isImage =
    attachment.kind === "IMAGE" || attachment.kind === "SCREENSHOT";

  return (
    <a
      href={attachment.url === "#" ? undefined : attachment.url}
      target={attachment.url === "#" ? undefined : "_blank"}
      rel="noreferrer"
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-lg border border-border/60 bg-muted/30 px-2 py-1 text-xs",
        attachment.url !== "#" && "hover:bg-muted/50"
      )}
      onClick={(e) => {
        if (attachment.url === "#") e.preventDefault();
      }}
    >
      {isImage ? (
        <ImageIcon className="h-3.5 w-3.5 shrink-0" />
      ) : (
        <FileText className="h-3.5 w-3.5 shrink-0" />
      )}
      <span className="truncate">{attachment.name}</span>
      <span className="shrink-0 text-muted-foreground">{attachment.sizeLabel}</span>
    </a>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, ImageIcon, Paperclip, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import type {
  SosAttachment,
  SosCaseNoteChannel,
  SosCaseNoteRecord
} from "@/services/sos-incidents";
import { cn } from "@/lib/utils";

const CHANNELS: { id: SosCaseNoteChannel; label: string; hint: string }[] = [
  { id: "RIDER", label: "Rider", hint: "Notes from / about the rider side" },
  { id: "PARTNER", label: "Partner", hint: "Notes from / about the partner side" },
  { id: "SAFETY_DESK", label: "Safety Desk", hint: "Comments from our safety / support desk" }
];

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export interface SosCaseNoteInput {
  channel: SosCaseNoteChannel;
  body: string;
  author: string;
  files: File[];
}

export function SosCaseNotesPanel({
  notes,
  onSubmit,
  authors,
  disabled,
  disabledHint
}: {
  notes: SosCaseNoteRecord[];
  onSubmit: (input: SosCaseNoteInput) => Promise<void>;
  /** Display names for each note channel (rider / partner / safety desk). */
  authors?: Partial<Record<SosCaseNoteChannel, string>>;
  /** Closed cases keep their history readable but stop accepting new notes. */
  disabled?: boolean;
  disabledHint?: string;
}) {
  const { error: showError } = useToast();
  const [channel, setChannel] = useState<SosCaseNoteChannel>("RIDER");
  const [body, setBody] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const authorFor = (ch: SosCaseNoteChannel) => {
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

  const submit = async () => {
    const text = body.trim();
    if (!text && pendingFiles.length === 0) {
      showError("Provide a note body or at least one attachment.");
      return;
    }

    setIsSaving(true);
    try {
      await onSubmit({
        channel,
        body: text,
        author: authorFor(channel),
        files: pendingFiles
      });
      setBody("");
      setPendingFiles([]);
      if (fileRef.current) fileRef.current.value = "";
    } catch (e) {
      showError(e instanceof Error ? e.message : "Failed to add note.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs value={channel} onValueChange={(v) => setChannel(v as SosCaseNoteChannel)}>
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

            {channel === c.id && !disabled && (
              <div className="space-y-2 rounded-xl border border-border/60 bg-muted/10 p-3">
                <Textarea
                  placeholder={`Add a ${c.label.toLowerCase()} note…`}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={3}
                  disabled={isSaving}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={fileRef}
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    onChange={(e) => {
                      const selected = e.target.files;
                      if (selected?.length) {
                        setPendingFiles((prev) => [...prev, ...Array.from(selected)]);
                      }
                      e.target.value = "";
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={isSaving}
                    onClick={() => fileRef.current?.click()}
                  >
                    <Paperclip className="mr-1.5 h-3.5 w-3.5" />
                    Attach img / SS / doc
                  </Button>
                  <Button type="button" size="sm" disabled={isSaving} onClick={submit}>
                    {isSaving ? "Adding…" : "Add note"}
                  </Button>
                </div>
                {pendingFiles.length > 0 && (
                  <ul className="space-y-1.5 pt-1">
                    {pendingFiles.map((file, index) => (
                      <li
                        key={`${file.name}-${index}`}
                        className="flex items-center justify-between gap-2 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs"
                      >
                        <span className="truncate">
                          {file.name} · {formatSize(file.size)}
                        </span>
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-foreground"
                          aria-label="Remove attachment"
                          disabled={isSaving}
                          onClick={() =>
                            setPendingFiles((prev) => prev.filter((_, i) => i !== index))
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

            {channel === c.id && disabled && disabledHint && (
              <p className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                {disabledHint}
              </p>
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

function AttachmentChip({ attachment }: { attachment: SosAttachment }) {
  const isImage = attachment.kind === "IMAGE" || attachment.kind === "SCREENSHOT";
  const hasUrl = Boolean(attachment.url) && attachment.url !== "#";

  return (
    <a
      href={hasUrl ? attachment.url : undefined}
      target={hasUrl ? "_blank" : undefined}
      rel="noreferrer"
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-lg border border-border/60 bg-muted/30 px-2 py-1 text-xs",
        hasUrl && "hover:bg-muted/50"
      )}
      onClick={(e) => {
        if (!hasUrl) e.preventDefault();
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

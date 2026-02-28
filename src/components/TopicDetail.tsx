"use client";

import { useState, useRef, useTransition } from "react";
import {
  X, FileText, Upload, Trash2, Save, BookOpen, StickyNote, File,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SubTopic } from "@/data/syllabus";
import type { TopicNote, TopicUpload } from "@/types/database";
import { saveNote, deleteNote } from "@/actions/topics";
import { uploadFile, deleteFile } from "@/actions/topics";

interface Props {
  topicId: string;
  topicName: string;
  subTopics: SubTopic[];
  notes: TopicNote[];
  uploads: TopicUpload[];
  onClose: () => void;
}

export default function TopicDetail({
  topicId, topicName, subTopics, notes, uploads: initialUploads, onClose,
}: Props) {
  const existingNote = notes.find((n) => n.topic_id === topicId && !n.subtopic_id);
  const [tab, setTab] = useState<"objectives" | "notes" | "files">("objectives");
  const [noteContent, setNoteContent] = useState(existingNote?.content ?? "");
  const [noteId, setNoteId] = useState<string | null>(existingNote?.id ?? null);
  const [uploads, setUploads] = useState(initialUploads);
  const [saving, startSaving] = useTransition();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSaveNote = () => {
    startSaving(async () => {
      await saveNote(topicId, null, noteContent);
    });
  };

  const handleDeleteNote = () => {
    if (!noteId) return;
    startSaving(async () => {
      await deleteNote(noteId);
      setNoteContent("");
      setNoteId(null);
    });
  };

  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File too large. Maximum size is 10 MB.");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    setUploadError(null);
    setUploading(true);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("topicId", topicId);

    const result = await uploadFile(fd);
    if ("error" in result) {
      setUploadError(result.error ?? "Upload failed");
    } else {
      setUploads((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          user_id: "",
          topic_id: topicId,
          subtopic_id: null,
          file_name: file.name,
          file_url: result.url!,
          file_type: file.type,
          file_size: file.size,
          created_at: new Date().toISOString(),
        },
      ]);
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleDelete = async (upload: TopicUpload) => {
    const prev = uploads;
    setUploads((u) => u.filter((f) => f.id !== upload.id));
    const res = await deleteFile(upload.id, upload.file_url);
    if (res && "error" in res) {
      setUploads(prev);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm animate-fade-up">
      <div className="mobile-container flex w-full flex-1 flex-col page-padding py-6 overflow-hidden">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold leading-tight">{topicName}</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {subTopics.length} sub-topic{subTopics.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tab selector */}
        <div className="mb-4 flex gap-1 rounded-xl bg-muted p-1">
          {([
            { key: "objectives", icon: BookOpen, label: "Objectives" },
            { key: "notes", icon: StickyNote, label: "Notes" },
            { key: "files", icon: File, label: "Files" },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all",
                tab === t.key ? "gradient-primary text-white" : "text-muted-foreground"
              )}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* ── Learning Objectives ── */}
          {tab === "objectives" && (
            <div className="space-y-4">
              {subTopics.map((st) => (
                <div key={st.id} className="rounded-xl border border-border bg-card p-4 shadow-card">
                  <h3 className="mb-2 text-sm font-bold">{st.name}</h3>
                  <ul className="space-y-1.5">
                    {st.learningObjectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                          {i + 1}
                        </span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {subTopics.length === 0 && (
                <div className="rounded-xl border border-border bg-card p-8 text-center">
                  <p className="text-sm text-muted-foreground">No sub-topics defined yet.</p>
                </div>
              )}
            </div>
          )}

          {/* ── Notes ── */}
          {tab === "notes" && (
            <div className="space-y-3">
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write your notes here..."
                rows={12}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none transition-colors focus:border-primary placeholder:text-muted-foreground resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveNote}
                  disabled={saving}
                  className="flex-1 rounded-xl gradient-primary py-3 text-sm font-bold text-white disabled:opacity-50"
                >
                  <Save className="mr-1.5 inline h-4 w-4" />
                  {saving ? "Saving..." : "Save Notes"}
                </button>
                {noteId && (
                  <button
                    onClick={handleDeleteNote}
                    disabled={saving}
                    className="rounded-xl border border-destructive/30 px-4 py-3 text-sm font-semibold text-destructive transition-all hover:bg-destructive/10 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── Files ── */}
          {tab === "files" && (
            <div className="space-y-3">
              {/* Upload area */}
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-card p-6 text-center transition-all hover:border-primary/50 disabled:opacity-50"
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {uploading ? "Uploading..." : "Tap to upload PDF or image"}
                </span>
                <span className="text-xs text-muted-foreground">Max 10MB per file</span>
              </button>
              {uploadError && (
                <p className="text-xs font-medium text-destructive">{uploadError}</p>
              )}
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleUpload}
              />

              {/* Uploaded files list */}
              {uploads.length > 0 ? (
                <div className="space-y-2">
                  {uploads.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-card"
                    >
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{u.file_name}</p>
                        <p className="text-xs text-muted-foreground">{formatSize(u.file_size)}</p>
                      </div>
                      <button
                        onClick={() => handleDelete(u)}
                        className="flex-shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-card p-6 text-center">
                  <p className="text-sm text-muted-foreground">No files uploaded yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

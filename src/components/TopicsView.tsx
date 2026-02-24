"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, BookOpen, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CHAPTERS, getChapterForTopic, type Topic,
} from "@/data/syllabus";
import type { TopicNote, TopicUpload } from "@/types/database";
import TopicDetail from "./TopicDetail";

interface Props {
  topics: Topic[];
  completedTopicIds: string[];
  notes: TopicNote[];
  uploads: TopicUpload[];
}

export default function TopicsView({ topics, completedTopicIds, notes, uploads }: Props) {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set(["1"]));
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);

  const completedSet = new Set(completedTopicIds);

  const toggleChapter = (key: string) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-4 page-padding py-5 animate-fade-up">
      <div>
        <h1 className="text-2xl font-black">Topics</h1>
        <p className="text-sm text-muted-foreground">
          {completedTopicIds.length}/{topics.length} completed
        </p>
      </div>

      {/* Progress */}
      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full gradient-primary transition-all duration-500"
          style={{ width: `${topics.length > 0 ? (completedTopicIds.length / topics.length) * 100 : 0}%` }}
        />
      </div>

      {/* Chapters */}
      <div className="space-y-3">
        {Object.entries(CHAPTERS).map(([chKey, chLabel]) => {
          const chTopics = topics.filter((t) => getChapterForTopic(t.id) === chKey);
          if (chTopics.length === 0) return null;
          const doneCount = chTopics.filter((t) => completedSet.has(t.id)).length;
          const isExpanded = expandedChapters.has(chKey);

          return (
            <div key={chKey} id={`chapter-${chKey}`} className="rounded-xl border border-border bg-card shadow-card overflow-hidden scroll-mt-24">
              <button
                onClick={() => toggleChapter(chKey)}
                className="flex w-full items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="text-sm font-bold">{chKey}. {chLabel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {doneCount}/{chTopics.length}
                  </span>
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-border">
                  {chTopics.map((topic) => {
                    const isDone = completedSet.has(topic.id);
                    const hasNotes = notes.some((n) => n.topic_id === topic.id);
                    const hasUploads = uploads.some((u) => u.topic_id === topic.id);

                    return (
                      <button
                        key={topic.id}
                        onClick={() => setActiveTopic(topic)}
                        className="flex w-full items-center gap-3 border-b border-border/50 px-4 py-3 text-left transition-all hover:bg-muted/30 last:border-b-0"
                      >
                        <div className={cn(
                          "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full",
                          isDone ? "bg-success/20" : "bg-muted"
                        )}>
                          {isDone ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                          ) : (
                            <BookOpen className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={cn(
                            "truncate text-sm font-medium",
                            isDone && "text-muted-foreground"
                          )}>
                            {topic.name}
                          </p>
                          <div className="mt-0.5 flex items-center gap-2">
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />{topic.hours}h
                            </span>
                            <span className="text-xs text-muted-foreground">
                              · {topic.subTopics.length} sub-topics
                            </span>
                            {hasNotes && <span className="text-xs text-primary">📝</span>}
                            {hasUploads && <span className="text-xs text-secondary">📎</span>}
                          </div>
                        </div>
                        <ChevronDown className="h-4 w-4 rotate-[-90deg] text-muted-foreground" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Topic Detail Modal */}
      {activeTopic && (
        <TopicDetail
          topicId={activeTopic.id}
          topicName={activeTopic.name}
          subTopics={activeTopic.subTopics}
          notes={notes.filter((n) => n.topic_id === activeTopic.id)}
          uploads={uploads.filter((u) => u.topic_id === activeTopic.id)}
          onClose={() => setActiveTopic(null)}
        />
      )}
    </div>
  );
}

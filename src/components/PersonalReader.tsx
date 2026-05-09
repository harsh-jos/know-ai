"use client";

import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useMemo, useState, useSyncExternalStore } from "react";

type KnowledgeItem = {
  id: string;
  order: number;
  chapter: string;
  title: string;
  read_time_min: number;
  is_learned: boolean;
  content: string;
};

const STORAGE_KEY = "know-ai-learned-topic-ids";
const STORAGE_EVENT = "know-ai-progress-change";

export function PersonalReader({ items }: { items: KnowledgeItem[] }) {
  const learnedIds = useLearnedIds();
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const hydratedItems = useMemo(
    () =>
      [...items]
        .sort((a, b) => a.order - b.order)
        .map((item) => ({
          ...item,
          is_learned: learnedIds.has(item.id) || item.is_learned,
        })),
    [items, learnedIds],
  );

  const nextUnread =
    hydratedItems.find((item) => !item.is_learned) ?? hydratedItems[0];
  const selected =
    hydratedItems.find((item) => item.id === selectedId) ?? nextUnread;
  const learnedCount = hydratedItems.filter((item) => item.is_learned).length;
  const progress = hydratedItems.length
    ? Math.round((learnedCount / hydratedItems.length) * 100)
    : 0;

  if (!selected) {
    return null;
  }

  function persist(next: Set<string>) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
    window.dispatchEvent(new Event(STORAGE_EVENT));
  }

  function markLearned() {
    const next = new Set(learnedIds);
    next.add(selected.id);
    persist(next);
    const following = hydratedItems.find(
      (item) => !next.has(item.id) && item.id !== selected.id,
    );
    if (following) setSelectedId(following.id);
  }

  function resetProgress() {
    persist(new Set());
    setSelectedId(undefined);
  }

  return (
    <main className="min-h-screen bg-[#f6f7f9] text-[#111318]">
      <div
        className={`mx-auto grid min-h-screen w-full max-w-7xl gap-3 px-3 py-3 transition-[grid-template-columns] duration-300 sm:gap-4 sm:px-4 sm:py-4 ${
          isSidebarCollapsed
            ? "md:grid-cols-1"
            : "md:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)]"
        }`}
      >
        <aside
          className={`rounded-[24px] border border-[#e4e7ee] bg-white/90 p-3 shadow-[0_24px_80px_rgba(17,19,24,0.07)] backdrop-blur-2xl transition-all duration-300 sm:rounded-[28px] sm:p-4 md:sticky md:top-4 md:h-[calc(100vh-2rem)] ${
            isSidebarCollapsed ? "hidden" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-[#111318] text-white shadow-lg shadow-black/10">
                <BookOpen size={19} />
              </div>
              <div>
                <p className="text-sm font-semibold">know-ai</p>
                <p className="text-xs text-[#737986]">Private AI reading base</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="flex size-9 items-center justify-center rounded-full border border-[#e2e5ec] text-[#747b88] transition hover:border-[#cbd1dc] hover:text-[#111318]"
                onClick={() => setIsSidebarCollapsed((value) => !value)}
                aria-label="Collapse side panel"
                title="Collapse"
              >
                <PanelLeftClose size={15} />
              </button>
              <button
                className="flex size-9 items-center justify-center rounded-full border border-[#e2e5ec] text-[#747b88] transition hover:border-[#cbd1dc] hover:text-[#111318]"
                onClick={resetProgress}
                aria-label="Reset local progress"
                title="Reset progress"
              >
                <RotateCcw size={15} />
              </button>
            </div>
          </div>

          <div className="mt-5 rounded-3xl bg-[#f5f7fb] p-4 md:mt-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-semibold tracking-normal">
                  {progress}%
                </p>
                <p className="mt-1 text-xs font-medium text-[#6d7480]">
                  learned on this device
                </p>
              </div>
              <Sparkles size={19} className="text-[#007aff]" />
            </div>
            <div className="mt-4 h-2 rounded-full bg-[#e7ebf2]">
              <div
                className="h-full rounded-full bg-[#111318]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mt-5 md:mt-6">
            <div className="grid max-h-72 gap-2 overflow-auto pr-1 sm:grid-cols-2 md:max-h-[calc(100vh-23rem)] md:grid-cols-1">
              {hydratedItems.map((item) => (
                <button
                  className={`flex w-full items-center justify-between gap-3 rounded-2xl border p-3 text-left transition ${
                    selected.id === item.id
                      ? "border-[#111318] bg-[#111318] text-white"
                      : "border-[#e7eaf0] bg-[#fbfcfe] text-[#111318] hover:border-[#cfd5df] hover:bg-white"
                  }`}
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  title={item.title}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {item.title}
                    </p>
                    <p
                      className={`mt-1 text-xs ${
                        selected.id === item.id
                          ? "text-white/58"
                          : "text-[#747b88]"
                      }`}
                    >
                      {item.chapter} · {item.read_time_min} min
                    </p>
                  </div>
                  {item.is_learned ? (
                    <Check size={16} className="shrink-0" />
                  ) : (
                    <ChevronRight size={16} className="shrink-0 opacity-55" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="rounded-[26px] border border-[#e4e7ee] bg-white shadow-[0_24px_80px_rgba(17,19,24,0.07)] sm:rounded-[32px]">
          <div className="border-b border-[#eceff4] px-4 py-4 sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {isSidebarCollapsed ? (
                  <button
                    className="flex size-10 items-center justify-center rounded-full border border-[#e2e5ec] text-[#747b88] transition hover:border-[#cbd1dc] hover:text-[#111318]"
                    onClick={() => setIsSidebarCollapsed(false)}
                    aria-label="Expand side panel"
                    title="Expand side panel"
                  >
                    <PanelLeftOpen size={16} />
                  </button>
                ) : null}
                <div>
                  <p className="text-sm font-semibold text-[#007aff]">
                    Next unread
                  </p>
                  <p className="mt-1 text-xs text-[#747b88]">
                    Backed by JSON. Progress stays in local storage.
                  </p>
                </div>
              </div>
              <button
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#111318] px-4 text-sm font-semibold text-white shadow-lg shadow-black/10 transition hover:bg-[#2a2d35] disabled:cursor-not-allowed disabled:bg-[#d8dce3]"
                onClick={markLearned}
                disabled={selected.is_learned}
              >
                {selected.is_learned ? "Learned" : "Mark learned"}
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

          <article className="mx-auto max-w-3xl px-4 py-7 sm:px-8 sm:py-10">
            <div className="mb-7 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#eef6ff] px-3 py-1 text-xs font-semibold text-[#007aff]">
                {selected.chapter}
              </span>
              <span className="rounded-full bg-[#f2f4f7] px-3 py-1 text-xs font-semibold text-[#626a76]">
                {selected.read_time_min} min read
              </span>
              <span className="rounded-full bg-[#f2f4f7] px-3 py-1 text-xs font-semibold text-[#626a76]">
                #{selected.order.toString().padStart(2, "0")}
              </span>
            </div>

            <h1 className="text-3xl font-semibold leading-tight tracking-normal text-[#090a0d] sm:text-5xl xl:text-6xl">
              {selected.title}
            </h1>

            <div className="mt-8 rounded-[28px] border border-[#e7eaf0] bg-[#fbfcfe] px-5 py-6 sm:px-7 sm:py-7">
              <div className="space-y-5 text-base leading-8 text-[#22262d] sm:text-lg sm:leading-9">
                {selected.content.split(/\n{2,}/).map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}

function useLearnedIds() {
  const learnedJson = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("storage", onStoreChange);
      window.addEventListener(STORAGE_EVENT, onStoreChange);
      return () => {
        window.removeEventListener("storage", onStoreChange);
        window.removeEventListener(STORAGE_EVENT, onStoreChange);
      };
    },
    () => window.localStorage.getItem(STORAGE_KEY) ?? "[]",
    () => "[]",
  );

  return useMemo(() => {
    try {
      return new Set(JSON.parse(learnedJson) as string[]);
    } catch {
      return new Set<string>();
    }
  }, [learnedJson]);
}

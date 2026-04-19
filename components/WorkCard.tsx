"use client";

import type { Work } from "@/data/classes";

type Props = {
  work: Work;
  onClick: () => void;
};

const TYPE_LABEL: Record<Work["type"], { icon: string; label: string }> = {
  image: { icon: "🖼", label: "그림" },
  audio: { icon: "🎤", label: "목소리" },
  video: { icon: "🎬", label: "영상" },
};

export default function WorkCard({ work, onClick }: Props) {
  const meta = TYPE_LABEL[work.type];
  return (
    <button
      onClick={onClick}
      data-clickable="true"
      className="block w-full rounded-2xl border-4 border-stone-900 bg-white overflow-hidden text-left hover:-translate-y-1 transition-transform shadow-[6px_6px_0_0_#1c1917] focus:outline-none focus:ring-4 focus:ring-amber-300"
      style={{ height: work.height }}
      aria-label={`${meta.label}: ${work.title}. 클릭하면 자세히 봅니다.`}
    >
      <div
        className="w-full flex items-center justify-center bg-stone-100 relative"
        style={{ height: work.height - 48 }}
      >
        {work.type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={work.url}
            alt=""
            className="w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="text-6xl" aria-hidden="true">
            {meta.icon}
          </div>
        )}
        <span className="absolute top-2 left-2 px-2 py-1 text-xs font-bold bg-stone-900 text-amber-50 rounded-full">
          {meta.label}
        </span>
      </div>
      <div className="px-3 py-2 text-sm font-bold text-stone-900 truncate">
        {work.title}
      </div>
    </button>
  );
}

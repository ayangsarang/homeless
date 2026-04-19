"use client";

import { useRef, useState } from "react";

type SignProps = {
  kind: "sign";
  href: string;
  label?: string;
};

type AudioProps = {
  kind: "audio";
  audioUrl: string;
  label?: string;
};

type Props = SignProps | AudioProps;

export default function AccessibleButton(props: Props) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (props.kind === "sign") {
    return (
      <a
        href={props.href}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-large inline-flex items-center gap-2 bg-stone-900 text-amber-50 font-bold border-4 border-stone-900 hover:bg-stone-800 focus:outline-none focus:ring-4 focus:ring-amber-300"
        aria-label={`${props.label ?? "수어 영상"} (새 창에서 유튜브 열림)`}
      >
        <span aria-hidden="true">🤟</span>
        <span>{props.label ?? "수어로 보기"}</span>
      </a>
    );
  }

  const toggle = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(props.audioUrl);
      audioRef.current.addEventListener("ended", () => setPlaying(false));
    }
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().catch(() => setPlaying(false));
      setPlaying(true);
    }
  };

  return (
    <button
      onClick={toggle}
      className="btn-large inline-flex items-center gap-2 bg-amber-50 text-stone-900 font-bold border-4 border-stone-900 hover:bg-amber-100 focus:outline-none focus:ring-4 focus:ring-amber-300"
      aria-label={`${props.label ?? "음성 설명"} ${playing ? "정지" : "재생"}`}
      aria-pressed={playing}
    >
      <span aria-hidden="true">{playing ? "⏸" : "🔊"}</span>
      <span>{props.label ?? "소리로 듣기"}</span>
    </button>
  );
}

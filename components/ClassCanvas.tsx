"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import type { ClassRoom, Work, Student } from "@/data/classes";
import WorkCard from "./WorkCard";

type Props = { classRoom: ClassRoom };

const MIN_SCALE = 0.3;
const MAX_SCALE = 1.6;
const INITIAL_SCALE = 0.45;
const WHEEL_SENSITIVITY = 0.0015;
const BUTTON_ZOOM_FACTOR = 1.15;

type View = { scale: number; tx: number; ty: number };
const INITIAL_VIEW: View = { scale: INITIAL_SCALE, tx: 100, ty: 100 };

const clampScale = (s: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));

function zoomAt(view: View, anchorX: number, anchorY: number, factor: number): View {
  const next = clampScale(view.scale * factor);
  const ratio = next / view.scale;
  return {
    scale: next,
    tx: anchorX - (anchorX - view.tx) * ratio,
    ty: anchorY - (anchorY - view.ty) * ratio,
  };
}

export default function ClassCanvas({ classRoom }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>(INITIAL_VIEW);
  const [openWork, setOpenWork] = useState<Work | null>(null);

  const dragState = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    startTx: number;
    startTy: number;
  }>({ active: false, startX: 0, startY: 0, startTx: 0, startTy: 0 });

  const onWheel = useCallback((e: WheelEvent) => {
    if (!containerRef.current) return;
    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const factor = Math.exp(-e.deltaY * WHEEL_SENSITIVITY);
    setView((prev) => zoomAt(prev, mouseX, mouseY, factor));
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-clickable]")) return;
    dragState.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      startTx: view.tx,
      startTy: view.ty,
    };
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragState.current.active) return;
      const dx = e.clientX - dragState.current.startX;
      const dy = e.clientY - dragState.current.startY;
      setView((prev) => ({
        ...prev,
        tx: dragState.current.startTx + dx,
        ty: dragState.current.startTy + dy,
      }));
    };
    const onUp = () => {
      dragState.current.active = false;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  const zoomBy = (factor: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    setView((prev) => zoomAt(prev, cx, cy, factor));
  };

  const reset = () => setView(INITIAL_VIEW);

  const { scale, tx, ty } = view;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden bg-stone-100 canvas-grab"
      onMouseDown={onMouseDown}
      role="application"
      aria-label={`${classRoom.name} 작업물 캔버스. 마우스 휠로 확대하고 끌어서 이동합니다.`}
    >
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{
          transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
          willChange: "transform",
        }}
      >
        {classRoom.students.map((s) => (
          <StudentArea key={s.id} student={s} onWorkClick={setOpenWork} />
        ))}
      </div>

      {/* 컨트롤 패널 */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-10">
        <button
          onClick={() => zoomBy(BUTTON_ZOOM_FACTOR)}
          className="w-14 h-14 rounded-full bg-stone-900 text-amber-50 text-2xl font-bold border-4 border-stone-900 hover:bg-stone-800 focus:outline-none focus:ring-4 focus:ring-amber-300"
          aria-label="확대"
        >
          +
        </button>
        <button
          onClick={() => zoomBy(1 / BUTTON_ZOOM_FACTOR)}
          className="w-14 h-14 rounded-full bg-stone-900 text-amber-50 text-2xl font-bold border-4 border-stone-900 hover:bg-stone-800 focus:outline-none focus:ring-4 focus:ring-amber-300"
          aria-label="축소"
        >
          −
        </button>
        <button
          onClick={reset}
          className="w-14 h-14 rounded-full bg-amber-50 text-stone-900 text-sm font-bold border-4 border-stone-900 hover:bg-amber-100 focus:outline-none focus:ring-4 focus:ring-amber-300"
          aria-label="처음 보기로 되돌리기"
        >
          전체
        </button>
      </div>

      <div className="absolute top-4 left-4 z-10 px-4 py-2 rounded-full bg-white/90 border-2 border-stone-900 text-sm font-bold">
        🔍 마우스 휠로 확대 · 끌어서 이동
      </div>

      {openWork && (
        <WorkModal work={openWork} onClose={() => setOpenWork(null)} />
      )}
    </div>
  );
}

function StudentArea({
  student,
  onWorkClick,
}: {
  student: Student;
  onWorkClick: (w: Work) => void;
}) {
  return (
    <div className="absolute" style={{ left: student.x, top: student.y }}>
      <div
        className="inline-flex items-center gap-3 px-5 py-3 bg-white rounded-2xl border-4 border-stone-900 shadow-[6px_6px_0_0_#1c1917]"
        aria-label={`학생 ${student.name}`}
      >
        <span className="text-3xl" aria-hidden="true">
          {student.emoji}
        </span>
        <span className="text-2xl font-black text-stone-900">
          {student.name}
        </span>
      </div>
      {student.works.map((w) => (
        <div
          key={w.id}
          className="absolute"
          style={{
            left: w.x - student.x,
            top: w.y - student.y,
            width: w.width,
          }}
          data-clickable="true"
        >
          <WorkCard work={w} onClick={() => onWorkClick(w)} />
        </div>
      ))}
    </div>
  );
}

function WorkModal({ work, onClose }: { work: Work; onClose: () => void }) {
  const [playingDesc, setPlayingDesc] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const toggleDesc = () => {
    if (!work.audioDescriptionUrl) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(work.audioDescriptionUrl);
      audioRef.current.addEventListener("ended", () => setPlayingDesc(false));
    }
    if (playingDesc) {
      audioRef.current.pause();
      setPlayingDesc(false);
    } else {
      audioRef.current.play().catch(() => setPlayingDesc(false));
      setPlayingDesc(true);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
      onClick={onClose}
      onMouseDown={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-label={work.title}
    >
      <div
        className="bg-amber-50 rounded-3xl border-4 border-stone-900 max-w-3xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900">
              {work.title}
            </h2>
            <button
              onClick={onClose}
              className="w-12 h-12 rounded-full bg-stone-900 text-amber-50 text-2xl font-bold border-4 border-stone-900 hover:bg-stone-800 focus:outline-none focus:ring-4 focus:ring-amber-300 shrink-0"
              aria-label="닫기"
            >
              ×
            </button>
          </div>

          <div className="mb-4">
            {work.type === "image" && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={work.url}
                alt={work.description}
                className="w-full rounded-2xl border-4 border-stone-900"
              />
            )}
            {work.type === "audio" && (
              <div className="p-6 bg-white rounded-2xl border-4 border-stone-900">
                <div className="text-6xl text-center mb-4" aria-hidden="true">🎤</div>
                <audio src={work.url} controls className="w-full" />
              </div>
            )}
            {work.type === "video" && (
              <video
                src={work.url}
                controls
                className="w-full rounded-2xl border-4 border-stone-900 bg-black"
              />
            )}
          </div>

          <p className="text-lg text-stone-800 mb-4">{work.description}</p>

          <div className="flex flex-wrap gap-3">
            {work.audioDescriptionUrl && (
              <button
                onClick={toggleDesc}
                className="btn-large inline-flex items-center gap-2 bg-amber-50 text-stone-900 font-bold border-4 border-stone-900 hover:bg-amber-100 focus:outline-none focus:ring-4 focus:ring-amber-300"
                aria-pressed={playingDesc}
              >
                <span aria-hidden="true">{playingDesc ? "⏸" : "🔊"}</span>
                <span>설명 들어보기</span>
              </button>
            )}
            {work.signLanguageUrl && (
              <a
                href={work.signLanguageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-large inline-flex items-center gap-2 bg-stone-900 text-amber-50 font-bold border-4 border-stone-900 hover:bg-stone-800 focus:outline-none focus:ring-4 focus:ring-amber-300"
              >
                <span aria-hidden="true">🤟</span>
                <span>수어로 보기</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

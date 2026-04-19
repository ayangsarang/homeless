"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ClassRoom, Student, Work, WorkType } from "@/data/classes";

const COLORS = [
  "#FFD6A5",
  "#FDFFB6",
  "#CAFFBF",
  "#9BF6FF",
  "#A0C4FF",
  "#BDB2FF",
  "#FFC6FF",
  "#FFADAD",
  "#FFD6E0",
  "#E4C1F9",
];

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

function emptyWork(): Work {
  return {
    id: uid("w"),
    type: "image",
    title: "새 작업물",
    url: "",
    description: "",
    audioDescriptionUrl: "",
    signLanguageUrl: "",
    x: 0,
    y: 0,
    width: 280,
    height: 200,
  };
}

function emptyStudent(): Student {
  return {
    id: uid("s"),
    name: "새 학생",
    emoji: "🌱",
    works: [],
    x: 100,
    y: 100,
  };
}

function emptyClass(): ClassRoom {
  return {
    id: uid("class"),
    name: "새 반",
    description: "",
    emoji: "📒",
    color: COLORS[0],
    signLanguageUrl: "",
    audioDescriptionUrl: "",
    students: [],
  };
}

export default function AdminPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [openClass, setOpenClass] = useState<string | null>(null);
  const [openStudent, setOpenStudent] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/admin/data");
      const j = await r.json();
      setClasses(j.classes);
      setLoading(false);
    })();
  }, []);

  const updateClasses = (next: ClassRoom[]) => {
    setClasses(next);
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    setMessage(null);
    const r = await fetch("/api/admin/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classes }),
    });
    setSaving(false);
    if (r.ok) {
      setDirty(false);
      setMessage("저장되었습니다.");
      setTimeout(() => setMessage(null), 2000);
    } else {
      setMessage("저장 실패");
    }
  };

  const logout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
  };

  const addClass = () => {
    updateClasses([...classes, emptyClass()]);
  };

  const updateClass = (id: string, patch: Partial<ClassRoom>) => {
    updateClasses(classes.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const deleteClass = (id: string) => {
    if (!confirm("이 반을 삭제할까요? 학생과 작업물도 모두 사라집니다.")) return;
    updateClasses(classes.filter((c) => c.id !== id));
  };

  const addStudent = (cid: string) => {
    updateClasses(
      classes.map((c) =>
        c.id === cid ? { ...c, students: [...c.students, emptyStudent()] } : c,
      ),
    );
  };

  const updateStudent = (cid: string, sid: string, patch: Partial<Student>) => {
    updateClasses(
      classes.map((c) =>
        c.id === cid
          ? {
              ...c,
              students: c.students.map((s) =>
                s.id === sid ? { ...s, ...patch } : s,
              ),
            }
          : c,
      ),
    );
  };

  const deleteStudent = (cid: string, sid: string) => {
    if (!confirm("학생을 삭제할까요?")) return;
    updateClasses(
      classes.map((c) =>
        c.id === cid
          ? { ...c, students: c.students.filter((s) => s.id !== sid) }
          : c,
      ),
    );
  };

  const addWork = (cid: string, sid: string) => {
    updateClasses(
      classes.map((c) =>
        c.id === cid
          ? {
              ...c,
              students: c.students.map((s) =>
                s.id === sid ? { ...s, works: [...s.works, emptyWork()] } : s,
              ),
            }
          : c,
      ),
    );
  };

  const updateWork = (
    cid: string,
    sid: string,
    wid: string,
    patch: Partial<Work>,
  ) => {
    updateClasses(
      classes.map((c) =>
        c.id === cid
          ? {
              ...c,
              students: c.students.map((s) =>
                s.id === sid
                  ? {
                      ...s,
                      works: s.works.map((w) =>
                        w.id === wid ? { ...w, ...patch } : w,
                      ),
                    }
                  : s,
              ),
            }
          : c,
      ),
    );
  };

  const deleteWork = (cid: string, sid: string, wid: string) => {
    if (!confirm("작업물을 삭제할까요?")) return;
    updateClasses(
      classes.map((c) =>
        c.id === cid
          ? {
              ...c,
              students: c.students.map((s) =>
                s.id === sid
                  ? { ...s, works: s.works.filter((w) => w.id !== wid) }
                  : s,
              ),
            }
          : c,
      ),
    );
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-xl">
        불러오는 중...
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-20 bg-amber-100 border-b-4 border-stone-900 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <h1 className="text-2xl font-black">관리자 — 야학 콘텐츠</h1>
          <div className="flex items-center gap-3">
            {message && (
              <span className="text-sm font-bold text-stone-700">{message}</span>
            )}
            <Link
              href="/"
              className="px-4 py-2 rounded-full border-2 border-stone-900 font-bold hover:bg-amber-200"
            >
              사이트 보기
            </Link>
            <button
              onClick={save}
              disabled={!dirty || saving}
              className="px-5 py-2 rounded-full bg-stone-900 text-amber-50 font-bold border-2 border-stone-900 hover:bg-stone-800 disabled:opacity-40"
            >
              {saving ? "저장중..." : dirty ? "저장하기" : "저장됨"}
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 rounded-full border-2 border-stone-900 font-bold hover:bg-amber-200"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">반 목록 ({classes.length})</h2>
            <button
              onClick={addClass}
              className="px-4 py-2 rounded-full bg-amber-50 border-2 border-stone-900 font-bold hover:bg-amber-200"
            >
              + 반 추가
            </button>
          </div>

          <ul className="space-y-4">
            {classes.map((c) => (
              <li
                key={c.id}
                className="rounded-2xl border-4 border-stone-900 bg-white overflow-hidden"
              >
                <button
                  className="w-full flex items-center justify-between p-4 hover:bg-amber-50"
                  onClick={() =>
                    setOpenClass(openClass === c.id ? null : c.id)
                  }
                  style={{ backgroundColor: openClass === c.id ? c.color : undefined }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{c.emoji}</span>
                    <span className="text-lg font-bold">{c.name}</span>
                    <span className="text-sm text-stone-600">
                      학생 {c.students.length}명
                    </span>
                  </div>
                  <span className="text-xl">{openClass === c.id ? "▾" : "▸"}</span>
                </button>

                {openClass === c.id && (
                  <div className="p-4 border-t-4 border-stone-900 space-y-4">
                    <ClassEditor
                      cls={c}
                      onChange={(patch) => updateClass(c.id, patch)}
                      onDelete={() => deleteClass(c.id)}
                    />

                    <div className="border-t-2 border-dashed border-stone-300 pt-4">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold">학생</h3>
                        <button
                          onClick={() => addStudent(c.id)}
                          className="px-3 py-1 rounded-full bg-amber-100 border-2 border-stone-900 font-bold text-sm hover:bg-amber-200"
                        >
                          + 학생 추가
                        </button>
                      </div>
                      <ul className="space-y-2">
                        {c.students.map((s) => (
                          <li
                            key={s.id}
                            className="rounded-xl border-2 border-stone-300 bg-amber-50"
                          >
                            <button
                              className="w-full flex items-center justify-between p-3 hover:bg-amber-100 rounded-xl"
                              onClick={() =>
                                setOpenStudent(
                                  openStudent === s.id ? null : s.id,
                                )
                              }
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{s.emoji}</span>
                                <span className="font-bold">{s.name}</span>
                                <span className="text-xs text-stone-600">
                                  작업물 {s.works.length}개
                                </span>
                              </div>
                              <span>{openStudent === s.id ? "▾" : "▸"}</span>
                            </button>
                            {openStudent === s.id && (
                              <div className="p-3 border-t-2 border-stone-300 space-y-3">
                                <StudentEditor
                                  student={s}
                                  onChange={(patch) =>
                                    updateStudent(c.id, s.id, patch)
                                  }
                                  onDelete={() => deleteStudent(c.id, s.id)}
                                />
                                <div className="border-t border-dashed border-stone-300 pt-3">
                                  <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-sm font-bold">작업물</h4>
                                    <button
                                      onClick={() => addWork(c.id, s.id)}
                                      className="px-3 py-1 rounded-full bg-white border-2 border-stone-900 font-bold text-xs hover:bg-amber-50"
                                    >
                                      + 작업물 추가
                                    </button>
                                  </div>
                                  <ul className="space-y-2">
                                    {s.works.map((w) => (
                                      <li
                                        key={w.id}
                                        className="p-3 rounded-lg bg-white border-2 border-stone-300"
                                      >
                                        <WorkEditor
                                          work={w}
                                          onChange={(patch) =>
                                            updateWork(c.id, s.id, w.id, patch)
                                          }
                                          onDelete={() =>
                                            deleteWork(c.id, s.id, w.id)
                                          }
                                        />
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-bold mb-1 text-stone-700">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full px-3 py-2 border-2 border-stone-900 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-300";

function ClassEditor({
  cls,
  onChange,
  onDelete,
}: {
  cls: ClassRoom;
  onChange: (patch: Partial<ClassRoom>) => void;
  onDelete: () => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Field label="반 이름">
        <input
          className={inputCls}
          value={cls.name}
          onChange={(e) => onChange({ name: e.target.value })}
        />
      </Field>
      <Field label="이모지">
        <input
          className={inputCls}
          value={cls.emoji}
          onChange={(e) => onChange({ emoji: e.target.value })}
        />
      </Field>
      <Field label="설명">
        <input
          className={inputCls}
          value={cls.description}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </Field>
      <Field label="배경 색">
        <div className="flex flex-wrap gap-2">
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onChange({ color })}
              className={`w-8 h-8 rounded-full border-2 ${
                cls.color === color ? "border-stone-900 ring-2 ring-stone-900" : "border-stone-400"
              }`}
              style={{ backgroundColor: color }}
              aria-label={`색 ${color}`}
            />
          ))}
        </div>
      </Field>
      <Field label="수어 영상 URL (유튜브)">
        <input
          className={inputCls}
          value={cls.signLanguageUrl}
          onChange={(e) => onChange({ signLanguageUrl: e.target.value })}
          placeholder="https://www.youtube.com/watch?v=..."
        />
      </Field>
      <Field label="음성 설명 mp3 URL">
        <input
          className={inputCls}
          value={cls.audioDescriptionUrl}
          onChange={(e) => onChange({ audioDescriptionUrl: e.target.value })}
          placeholder="https://.../audio.mp3"
        />
      </Field>
      <div className="sm:col-span-2 flex justify-end">
        <button
          onClick={onDelete}
          className="px-4 py-2 rounded-full bg-red-700 text-white font-bold border-2 border-red-900 hover:bg-red-800"
        >
          반 삭제
        </button>
      </div>
    </div>
  );
}

function StudentEditor({
  student,
  onChange,
  onDelete,
}: {
  student: Student;
  onChange: (patch: Partial<Student>) => void;
  onDelete: () => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Field label="이름">
        <input
          className={inputCls}
          value={student.name}
          onChange={(e) => onChange({ name: e.target.value })}
        />
      </Field>
      <Field label="이모지">
        <input
          className={inputCls}
          value={student.emoji}
          onChange={(e) => onChange({ emoji: e.target.value })}
        />
      </Field>
      <div className="flex items-end">
        <button
          onClick={onDelete}
          className="px-3 py-2 rounded-full bg-red-700 text-white font-bold border-2 border-red-900 hover:bg-red-800 text-sm"
        >
          학생 삭제
        </button>
      </div>
    </div>
  );
}

const WORK_TYPES: { value: WorkType; label: string }[] = [
  { value: "image", label: "이미지" },
  { value: "audio", label: "음성" },
  { value: "video", label: "영상" },
];

function WorkEditor({
  work,
  onChange,
  onDelete,
}: {
  work: Work;
  onChange: (patch: Partial<Work>) => void;
  onDelete: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const onPickFile = async (file: File) => {
    setUploading(true);
    setUploadError(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const j = await r.json();
      if (!r.ok) {
        setUploadError(j.error || "업로드 실패");
      } else {
        onChange({ url: j.url });
      }
    } catch {
      setUploadError("업로드 중 오류");
    }
    setUploading(false);
  };

  const accept =
    work.type === "image"
      ? "image/*"
      : work.type === "audio"
        ? "audio/*"
        : "video/*";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Field label="유형">
        <select
          className={inputCls}
          value={work.type}
          onChange={(e) => onChange({ type: e.target.value as WorkType })}
        >
          {WORK_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="제목">
        <input
          className={inputCls}
          value={work.title}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </Field>
      <div className="sm:col-span-2">
        <Field label="작업물 URL 또는 파일 업로드">
          <input
            className={inputCls}
            value={work.url}
            onChange={(e) => onChange({ url: e.target.value })}
            placeholder={
              work.type === "image"
                ? "https://.../image.jpg 또는 아래에서 업로드"
                : work.type === "audio"
                  ? "https://.../audio.mp3 또는 아래에서 업로드"
                  : "https://.../video.mp4 또는 아래에서 업로드"
            }
          />
          <div className="mt-2 flex items-center gap-3 flex-wrap">
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-amber-100 border-2 border-stone-900 font-bold text-sm hover:bg-amber-200 cursor-pointer">
              <span>📁 파일 업로드</span>
              <input
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onPickFile(f);
                  e.target.value = "";
                }}
                disabled={uploading}
              />
            </label>
            {uploading && <span className="text-sm">올리는 중...</span>}
            {uploadError && (
              <span className="text-sm text-red-700 font-bold">{uploadError}</span>
            )}
            {!uploading && !uploadError && work.url.startsWith("/uploads/") && (
              <span className="text-sm text-green-700 font-bold">업로드됨</span>
            )}
          </div>
          {work.type === "image" && work.url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={work.url}
              alt=""
              className="mt-2 max-h-32 rounded border-2 border-stone-300"
            />
          )}
        </Field>
      </div>
      <Field label="설명">
        <input
          className={inputCls}
          value={work.description}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </Field>
      <Field label="음성 설명 mp3 URL">
        <input
          className={inputCls}
          value={work.audioDescriptionUrl ?? ""}
          onChange={(e) => onChange({ audioDescriptionUrl: e.target.value })}
        />
      </Field>
      <Field label="수어 영상 URL">
        <input
          className={inputCls}
          value={work.signLanguageUrl ?? ""}
          onChange={(e) => onChange({ signLanguageUrl: e.target.value })}
        />
      </Field>
      <div className="sm:col-span-2 flex justify-end">
        <button
          onClick={onDelete}
          className="px-3 py-1 rounded-full bg-red-700 text-white font-bold border-2 border-red-900 hover:bg-red-800 text-sm"
        >
          작업물 삭제
        </button>
      </div>
    </div>
  );
}

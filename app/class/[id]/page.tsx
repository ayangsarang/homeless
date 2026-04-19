import { notFound } from "next/navigation";
import Link from "next/link";
import { getClass } from "@/lib/classesStore";
import ClassCanvas from "@/components/ClassCanvas";
import AccessibleButton from "@/components/AccessibleButton";

export const dynamic = "force-dynamic";

export default async function ClassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cls = await getClass(id);
  if (!cls) notFound();

  return (
    <div className="min-h-screen flex flex-col">
      <header
        className="px-6 py-5 sm:px-10 border-b-4 border-stone-900"
        style={{ backgroundColor: cls.color }}
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="btn-large bg-stone-900 text-amber-50 font-bold border-4 border-stone-900 hover:bg-stone-800 focus:outline-none focus:ring-4 focus:ring-amber-300"
              aria-label="처음으로 돌아가기"
            >
              ← 처음으로
            </Link>
            <div>
              <h1 className="text-2xl sm:text-4xl font-black text-stone-900 flex items-center gap-3">
                <span aria-hidden="true">{cls.emoji}</span>
                {cls.name}
              </h1>
              <p className="text-sm sm:text-base text-stone-800 mt-1">
                {cls.description}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <AccessibleButton kind="sign" href={cls.signLanguageUrl} label="수어로 보기" />
            <AccessibleButton kind="audio" audioUrl={cls.audioDescriptionUrl} label="소리로 듣기" />
          </div>
        </div>
      </header>

      <main className="flex-1 relative">
        <ClassCanvas classRoom={cls} />
      </main>
    </div>
  );
}

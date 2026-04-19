import Link from "next/link";
import { getClasses } from "@/lib/classesStore";
import AccessibleButton from "@/components/AccessibleButton";

export const dynamic = "force-dynamic";

export default async function Home() {
  const classes = await getClasses();
  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-8 sm:px-12 sm:py-12 border-b-4 border-stone-900 bg-amber-100">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-stone-900">
              홈리스 야학
            </h1>
            <p className="mt-3 text-lg sm:text-xl text-stone-700">
              우리들이 함께 배우고, 만들고, 나누는 학교입니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <AccessibleButton
              kind="sign"
              href="https://www.youtube.com/watch?v=7gPgHksk_Ec"
              label="수어 안내"
            />
            <AccessibleButton
              kind="audio"
              audioUrl="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
              label="소리로 듣기"
            />
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-10 sm:px-12 sm:py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-stone-900">
            우리 반 둘러보기
          </h2>

          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/class/${c.id}`}
                  className="block rounded-3xl border-4 border-stone-900 p-6 sm:p-8 transition-transform hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#1c1917] focus:outline-none focus:ring-4 focus:ring-stone-900"
                  style={{ backgroundColor: c.color }}
                  aria-label={`${c.name} — ${c.description}`}
                >
                  <div className="text-6xl mb-4" aria-hidden="true">
                    {c.emoji}
                  </div>
                  <div className="text-2xl font-bold text-stone-900">
                    {c.name}
                  </div>
                  <p className="mt-2 text-base text-stone-800">
                    {c.description}
                  </p>
                  <div className="mt-4 text-sm text-stone-700">
                    학생 {c.students.length}명
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>

      <footer className="px-6 py-8 sm:px-12 border-t-4 border-stone-900 bg-amber-100 text-stone-700">
        <div className="max-w-6xl mx-auto text-sm">
          홈리스행동 산하 야학 · 만든 사람들의 작업물입니다.
        </div>
      </footer>
    </div>
  );
}

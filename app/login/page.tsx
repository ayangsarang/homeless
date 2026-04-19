"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from") || "/admin";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push(from);
      router.refresh();
    } else {
      const j = await res.json().catch(() => ({}));
      setError(j.error || "로그인 실패");
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-md bg-white rounded-3xl border-4 border-stone-900 p-8 shadow-[8px_8px_0_0_#1c1917]"
    >
      <h1 className="text-3xl font-black mb-6">관리자 로그인</h1>
      <label className="block text-sm font-bold mb-2">비밀번호</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-4 py-3 text-lg border-4 border-stone-900 rounded-xl mb-4 focus:outline-none focus:ring-4 focus:ring-amber-300"
        autoFocus
      />
      {error && (
        <p className="text-red-700 text-sm font-bold mb-4">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="btn-large w-full bg-stone-900 text-amber-50 font-bold border-4 border-stone-900 hover:bg-stone-800 disabled:opacity-50"
      >
        {loading ? "확인 중..." : "들어가기"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-amber-50">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}

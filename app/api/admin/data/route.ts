import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getClasses, saveClasses } from "@/lib/classesStore";
import type { ClassRoom } from "@/data/classes";

export async function GET() {
  const classes = await getClasses();
  return NextResponse.json({ classes });
}

export async function POST(req: Request) {
  const body = (await req.json()) as { classes?: ClassRoom[] };
  if (!body.classes || !Array.isArray(body.classes)) {
    return NextResponse.json({ error: "classes 배열이 없습니다." }, { status: 400 });
  }
  await saveClasses(body.classes);
  revalidatePath("/");
  revalidatePath("/class/[id]", "page");
  return NextResponse.json({ ok: true });
}

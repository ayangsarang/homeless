import { promises as fs } from "fs";
import path from "path";
import { CLASSES, type ClassRoom } from "@/data/classes";

const DATA_PATH = path.join(process.cwd(), "data", "classes.json");

export async function getClasses(): Promise<ClassRoom[]> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    return JSON.parse(raw) as ClassRoom[];
  } catch {
    // 파일이 없거나 읽을 수 없으면 seed로 폴백.
    // (Vercel 같은 read-only 파일시스템에서는 절대 쓰지 않음)
    return CLASSES;
  }
}

export async function getClass(id: string): Promise<ClassRoom | undefined> {
  const all = await getClasses();
  return all.find((c) => c.id === id);
}

export async function saveClasses(classes: ClassRoom[]): Promise<void> {
  await fs.writeFile(DATA_PATH, JSON.stringify(classes, null, 2), "utf-8");
}

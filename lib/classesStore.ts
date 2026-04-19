import { promises as fs } from "fs";
import path from "path";
import { CLASSES, type ClassRoom } from "@/data/classes";

const DATA_PATH = path.join(process.cwd(), "data", "classes.json");

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

export async function getClasses(): Promise<ClassRoom[]> {
  if (!(await fileExists(DATA_PATH))) {
    await fs.writeFile(DATA_PATH, JSON.stringify(CLASSES, null, 2), "utf-8");
    return CLASSES;
  }
  const raw = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(raw) as ClassRoom[];
}

export async function getClass(id: string): Promise<ClassRoom | undefined> {
  const all = await getClasses();
  return all.find((c) => c.id === id);
}

export async function saveClasses(classes: ClassRoom[]): Promise<void> {
  await fs.writeFile(DATA_PATH, JSON.stringify(classes, null, 2), "utf-8");
}

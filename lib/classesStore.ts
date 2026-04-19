import { promises as fs } from "fs";
import path from "path";
import { put, list } from "@vercel/blob";
import { CLASSES, type ClassRoom } from "@/data/classes";

const BLOB_KEY = "data/classes.json";
const LOCAL_PATH = path.join(process.cwd(), "data", "classes.json");

function useBlob(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

async function readFromBlob(): Promise<ClassRoom[]> {
  const { blobs } = await list({ prefix: BLOB_KEY, limit: 1 });
  if (blobs.length === 0) return CLASSES;
  const res = await fetch(blobs[0].url, { cache: "no-store" });
  if (!res.ok) return CLASSES;
  return (await res.json()) as ClassRoom[];
}

async function readFromFile(): Promise<ClassRoom[]> {
  try {
    const raw = await fs.readFile(LOCAL_PATH, "utf-8");
    return JSON.parse(raw) as ClassRoom[];
  } catch {
    return CLASSES;
  }
}

export async function getClasses(): Promise<ClassRoom[]> {
  try {
    return useBlob() ? await readFromBlob() : await readFromFile();
  } catch {
    return CLASSES;
  }
}

export async function getClass(id: string): Promise<ClassRoom | undefined> {
  const all = await getClasses();
  return all.find((c) => c.id === id);
}

export async function saveClasses(classes: ClassRoom[]): Promise<void> {
  const json = JSON.stringify(classes, null, 2);
  if (useBlob()) {
    await put(BLOB_KEY, json, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
  } else {
    await fs.writeFile(LOCAL_PATH, json, "utf-8");
  }
}

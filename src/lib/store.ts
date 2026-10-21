import { useEffect, useState } from "react";

export type Recent = { id: string; type: "email" | "planner" | "chat"; title: string; content: string; at: number };

const KEY = "awpa:recent";
export const SAVE_KEY = "awpa:save";

export function canSave() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(SAVE_KEY) !== "off";
}

export function getRecent(): Recent[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function addRecent(r: Omit<Recent, "id" | "at">) {
  if (!canSave()) return;
  const list = [{ ...r, id: String(Date.now()), at: Date.now() }, ...getRecent()].slice(0, 12);
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("awpa:recent"));
}

export function clearRecent() {
  localStorage.removeItem(KEY);
  localStorage.removeItem("awpa:chat");
  window.dispatchEvent(new Event("awpa:recent"));
}

export function useRecent() {
  const [list, setList] = useState<Recent[]>([]);
  useEffect(() => {
    const load = () => setList(getRecent());
    load();
    window.addEventListener("awpa:recent", load);
    return () => window.removeEventListener("awpa:recent", load);
  }, []);
  return list;
}

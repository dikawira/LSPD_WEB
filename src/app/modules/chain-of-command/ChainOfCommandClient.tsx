"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Officer = { id: string; fullName?: string; username?: string; rank?: string; callsign?: string; division?: string };
const ranks = ["Commissioner", "Chief of Police", "Deputy Chief", "Assistant Chief", "Commander", "Captain", "Lieutenant", "Sergeant", "Senior Officer", "Officer", "Cadet", "Recruit"];

export default function ChainOfCommandPage() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/records?kind=officers", { cache: "no-store", credentials: "same-origin" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal memuat roster.");
      if (!Array.isArray(data)) throw new Error("Format roster tidak valid.");
      setOfficers(data); setError("");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Gagal memuat roster bersama."); }
  }, []);
  useEffect(() => {
    void load();
    const timer = window.setInterval(() => { if (document.visibilityState === "visible") void load(); }, 15000);
    const refresh = () => { if (document.visibilityState === "visible") void load(); };
    window.addEventListener("focus", refresh); document.addEventListener("visibilitychange", refresh);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", refresh); };
  }, [load]);

  return <main className="mx-auto max-w-5xl px-5 py-10">
    <Link className="quiet-link" href="/">← Command Center</Link>
    <div className="hero-kicker mt-7">LSPD / COMMAND STRUCTURE</div>
    <h1 className="my-3 text-4xl font-bold">Chain of Command</h1>
    <p className="mb-6 text-sm text-slate-400">Officer hierarchy sourced from the shared personnel roster.</p>
    {error && <p className="error-panel mb-4" role="alert">{error}</p>}
    <div className="glass-card rounded-xl p-6">{ranks.map((rank, index) => {
      const members = officers.filter(officer => officer.rank === rank);
      return <div className="border-b border-[var(--line)] py-4" key={rank}><div className="flex items-center justify-between gap-3"><b className="text-[var(--gold)]">{index + 1}. {rank}</b><span className="text-xs text-slate-500">{members.length} personnel</span></div><div className="mt-2 flex flex-wrap gap-2">{members.map(officer => <span className="rounded border border-[var(--line)] p-2 text-xs" key={officer.id}>{officer.fullName || officer.username || "Officer"} {officer.callsign || ""}</span>)}</div></div>;
    })}</div>
  </main>;
}

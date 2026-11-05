"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

type PortalRow = Record<string, unknown> & { id: string };

export default function AnalyticsPage() {
  const [officers, setOfficers] = useState<PortalRow[]>([]);
  const [attendance, setAttendance] = useState<PortalRow[]>([]);
  const [fleet, setFleet] = useState<PortalRow[]>([]);
  const [weapons, setWeapons] = useState<PortalRow[]>([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const kinds = ["officers", "attendance", "fleet", "weapons"] as const;
      const responses = await Promise.all(kinds.map(kind => fetch(`/api/records?kind=${kind}`, { cache: "no-store", credentials: "same-origin" })));
      const payloads = await Promise.all(responses.map(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Gagal memuat analytics dari database.");
        if (!Array.isArray(data)) throw new Error("Format data analytics tidak valid.");
        return data as PortalRow[];
      }));
      setOfficers(payloads[0]); setAttendance(payloads[1]); setFleet(payloads[2]); setWeapons(payloads[3]); setError("");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Gagal memuat data bersama."); }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => { if (document.visibilityState === "visible") void load(); }, 15000);
    const refresh = () => { if (document.visibilityState === "visible") void load(); };
    window.addEventListener("focus", refresh); document.addEventListener("visibilitychange", refresh);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", refresh); };
  }, [load]);

  const onDuty = useMemo(() => officers.filter(item => {
    const status = String(item.dutyStatus || item.status || "").toLowerCase().replaceAll("_", " ");
    return status === "on duty" || status === "active";
  }).length, [officers]);
  const cards = [["Total Officers", officers.length], ["On Duty", onDuty], ["Fleet Vehicles", fleet.length], ["Weapons", weapons.length], ["Attendance Logs", attendance.length]] as const;

  return <main className="mx-auto max-w-6xl px-5 py-10">
    <Link className="quiet-link" href="/">← Command Center</Link>
    <div className="hero-kicker mt-7">LSPD / DEPARTMENT DATA</div>
    <h1 className="my-3 text-4xl font-bold">Analytics</h1>
    <p className="mb-6 text-sm text-slate-400">Live department totals from the shared LSPD database.</p>
    {error && <p className="error-panel mb-4" role="alert">{error}</p>}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{cards.map(([label, value]) => <div className="stat-card" key={label}><div><div className="stat-value">{value}</div><div className="stat-label">{label}</div></div></div>)}</div>
  </main>;
}

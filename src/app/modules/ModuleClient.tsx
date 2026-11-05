"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Field = [string, string, string[]?];
type ModuleDefinition = { kind: string; title: string; fields: Field[] };

const definitions: Record<string, ModuleDefinition> = {
  "registrasi-officer": {
    kind: "officers",
    title: "Registrasi Officer",
    fields: [
      ["fullName", "Nama Lengkap"],
      ["badgeNumber", "Badge / Batch"],
      ["rank", "Rank", ["Recruit", "Cadet", "Officer", "Senior Officer", "Sergeant", "Lieutenant", "Captain", "Commander", "Assistant Chief", "Deputy Chief", "Chief of Police", "Commissioner"]],
      ["division", "Division", ["Administrative Standard Bureau", "Air Support Division", "Board of Commissioner", "Chief’s Office", "Criminal Investigations Division", "Firearms Licensing Division", "Gang & Narcotics Division", "Human Resource & Training Division", "Internal Affairs Division", "Investigations Bureau", "Media & Relations Division", "Office of Operations", "Office of Support Services", "Patrol Division", "Professional Standards Bureau", "SWAT Division", "Special Operations Bureau", "Speed Hunter Division"]],
      ["callsign", "Callsign"],
      ["certifications", "Certifications (pisahkan koma)"]
    ]
  },
  "fleet-data": {
    kind: "fleet",
    title: "Fleet Data",
    fields: [["name", "Nama Kendaraan"], ["plate", "Plat"], ["vehicleType", "Tipe"], ["status", "Status", ["Available", "Assigned", "Maintenance", "Out of Service"]], ["assignedTo", "Assigned To"], ["notes", "Notes"]]
  },
  "weapon-data": {
    kind: "weapons",
    title: "Weapon Data",
    fields: [["name", "Nama Senjata"], ["weaponType", "Tipe"], ["serialNumber", "Serial Number"], ["status", "Status", ["Available", "Assigned", "Maintenance", "Retired"]], ["assignedTo", "Assigned To"], ["notes", "Notes"]]
  },
  announcements: {
    kind: "announcements",
    title: "Announcements",
    fields: [["title", "Judul"], ["category", "Kategori", ["HQ-DIRECTIVE", "INTERNAL AFFAIRS", "TACTICAL NOTICE", "GENERAL ORDER"]], ["content", "Isi"]]
  },
  "officer-directory": { kind: "officers", title: "Officer Directory", fields: [] },
  "officer-attendance": { kind: "attendance", title: "Officer Attendance", fields: [] }
};

type Props = {
  slug: string;
  profile?: { username?: string; rank?: string; division?: string };
  canManageAnnouncements?: boolean;
};

export default function ModuleClient({ slug, profile, canManageAnnouncements = false }: Props) {
  const config = definitions[slug];
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const canEdit = slug === "announcements" ? canManageAnnouncements : slug !== "officer-directory" && slug !== "officer-attendance";

  const load = useCallback(async () => {
    if (!config) return;
    try {
      const response = await fetch(`/api/records?kind=${encodeURIComponent(config.kind)}`, {
        cache: "no-store",
        credentials: "same-origin"
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal memuat data.");
      if (Array.isArray(data)) {
        setRows(data);
        setError("");
      } else {
        throw new Error("Format data dari server tidak valid.");
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Gagal menghubungi database.");
    }
  }, [config]);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, 15000);
    const onVisibility = () => {
      if (document.visibilityState === "visible") void load();
    };
    window.addEventListener("focus", onVisibility);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", onVisibility);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [load]);

  const filteredRows = useMemo(
    () => rows.filter(row => JSON.stringify(row).toLowerCase().includes(query.toLowerCase())),
    [rows, query]
  );

  async function save() {
    if (!config || !canEdit || busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/records", {
        method: editingId ? "PATCH" : "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId
          ? { kind: config.kind, id: editingId, data: form }
          : { kind: config.kind, data: form })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Gagal menyimpan data.");
      setForm({});
      setEditingId("");
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Gagal menyimpan data.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!config || !canEdit || !window.confirm("Hapus record ini?")) return;
    setError("");
    try {
      const response = await fetch("/api/records", {
        method: "DELETE",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: config.kind, id })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Gagal menghapus data.");
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Gagal menghapus data.");
    }
  }

  if (!config) return <main className="mx-auto max-w-4xl px-6 py-12"><p className="error-panel">Module tidak ditemukan.</p><Link href="/" className="quiet-link">Kembali ke Command Center</Link></main>;

  const headings = slug === "officer-directory"
    ? ["Nama", "Discord", "Badge", "Rank", "Division", "Callsign", "Duty"]
    : slug === "officer-attendance"
      ? ["Officer", "Waktu", "Status", "Catatan"]
      : config.fields.map(field => field[1]);

  return (
    <main className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6">
      <Link href="/" className="quiet-link">← Command Center</Link>
      <div className="hero-kicker mt-7">LSPD / PERSONNEL & OPERATIONS</div>
      <h1 className="my-3 text-4xl font-extrabold">{config.title}</h1>
      <p className="mb-6 text-sm text-slate-400">
        {slug === "announcements"
          ? canManageAnnouncements ? "Pusat pengumuman resmi High Command." : "Pengumuman resmi Los Santos Police Department." 
          : "Data portal bersama. Perubahan akan terlihat oleh pengguna lain setelah sinkronisasi."}
      </p>

      {slug === "registrasi-officer" && (
        <div className="glass-card mb-5 rounded-xl p-5">
          <b>Profil Discord:</b> {profile?.username || "User"} · {profile?.rank || "Rank belum diatur"} · {profile?.division || "Division belum diatur"}
        </div>
      )}

      {slug === "officer-attendance" && (
        <div className="glass-card mb-5 rounded-xl p-5">
          <textarea className="portal-input mb-3 w-full" placeholder="Catatan duty" value={notes} onChange={event => setNotes(event.target.value)} />
          <button className="gold-button mr-2" disabled={busy} onClick={async () => {
            setBusy(true);
            setError("");
            try {
              const response = await fetch("/api/records", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "attendance", data: { action: "in", notes } }) });
              const result = await response.json();
              if (!response.ok) throw new Error(result.error || "Clock in gagal.");
              setNotes("");
              await load();
            } catch (caught) {
              setError(caught instanceof Error ? caught.message : "Clock in gagal.");
            } finally { setBusy(false); }
          }}>Clock In</button>
          <button className="outline-button" disabled={busy} onClick={async () => {
            setBusy(true);
            setError("");
            try {
              const response = await fetch("/api/records", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "attendance", data: { action: "out" } }) });
              const result = await response.json();
              if (!response.ok) throw new Error(result.error || "Clock out gagal.");
              await load();
            } catch (caught) {
              setError(caught instanceof Error ? caught.message : "Clock out gagal.");
            } finally { setBusy(false); }
          }}>Clock Out</button>
        </div>
      )}

      {config.fields.length > 0 && canEdit && (
        <section className="glass-card mb-5 rounded-xl p-5">
          <h2 className="section-title mb-4">{editingId ? "Edit Record" : "Input Data"}</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {config.fields.map(field => (
              <label className="field-label" key={field[0]}>
                {field[1]}
                {field[2] ? (
                  <select className="portal-input mt-2" value={form[field[0]] || ""} onChange={event => setForm(current => ({ ...current, [field[0]]: event.target.value }))}>
                    <option value="">Pilih</option>
                    {field[2].map(option => <option key={option} value={option}>{option}</option>)}
                  </select>
                ) : field[0] === "content" || field[0] === "notes" ? (
                  <textarea className="portal-input mt-2 min-h-24" value={form[field[0]] || ""} onChange={event => setForm(current => ({ ...current, [field[0]]: event.target.value }))} />
                ) : (
                  <input className="portal-input mt-2" value={form[field[0]] || ""} onChange={event => setForm(current => ({ ...current, [field[0]]: event.target.value }))} />
                )}
              </label>
            ))}
          </div>
          <button className="gold-button mt-4" disabled={busy} onClick={save}>{busy ? "Menyimpan..." : "Simpan"}</button>
          {editingId && <button className="quiet-link ml-3" onClick={() => { setEditingId(""); setForm({}); }}>Batal</button>}
        </section>
      )}

      {error && <p className="error-panel mb-4" role="alert">{error}</p>}

      <section className="glass-card rounded-xl p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="section-title">Database Records ({filteredRows.length})</h2>
          <input className="portal-input max-w-xs" placeholder="Cari..." value={query} onChange={event => setQuery(event.target.value)} />
        </div>
        <div className="overflow-x-auto">
          <table className="portal-table">
            <thead><tr>{headings.map(heading => <th key={heading}>{heading}</th>)}{canEdit && slug !== "registrasi-officer" && <th>Aksi</th>}</tr></thead>
            <tbody>
              {filteredRows.map(row => (
                <tr key={row.id}>
                  {slug === "officer-directory" ? <>
                    <td>{row.fullName || row.username || "-"}</td><td>{row.username || "-"}</td><td>{row.badgeNumber || row.batchNumber || "-"}</td><td>{row.rank || "-"}</td><td>{row.division || "-"}</td><td>{row.callsign || "-"}</td><td>{row.dutyStatus || row.status || "-"}</td>
                  </> : slug === "officer-attendance" ? <>
                    <td>{row.fullName || row.user?.fullName || row.user?.username || "-"}</td><td>{new Date(row.submittedAt || row.clockIn).toLocaleString("id-ID")}</td><td>{row.action || (row.clockOut ? "Clock Out" : "Clock In")}</td><td>{row.notes || "-"}</td>
                  </> : config.fields.map(field => <td key={field[0]}>{Array.isArray(row[field[0]]) ? row[field[0]].join(", ") : row[field[0]] || "-"}</td>)}
                  {canEdit && slug !== "registrasi-officer" && <td className="whitespace-nowrap">
                    <button className="quiet-link mr-3" onClick={() => { setEditingId(row.id); setForm(Object.fromEntries(config.fields.map(field => [field[0], Array.isArray(row[field[0]]) ? row[field[0]].join(", ") : row[field[0]] || ""]))); }}>Edit</button>
                    <button className="quiet-link" onClick={() => void remove(row.id)}>Hapus</button>
                  </td>}
                </tr>
              ))}
            </tbody>
          </table>
          {!filteredRows.length && <p className="py-8 text-center text-sm text-slate-500">Belum ada data.</p>}
        </div>
      </section>
    </main>
  );
}

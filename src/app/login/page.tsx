import Image from "next/image";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getSession()) redirect("/");
  return <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#081321] px-4 py-10 text-slate-100">
    <div className="absolute inset-0 opacity-30" style={{backgroundImage:"linear-gradient(rgba(148,163,184,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,.045) 1px,transparent 1px)",backgroundSize:"40px 40px"}} />
    <section className="relative w-full max-w-xl rounded-3xl border border-amber-300/25 bg-gradient-to-br from-[#14243a] to-[#091525] p-8 text-center shadow-2xl sm:p-10">
      <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-2xl border border-amber-300/30 bg-slate-950/50">
        <Image src="/lspd-badge.png" alt="LSPD Official Badge" width={78} height={78} priority />
      </div>
      <p className="text-[10px] font-bold tracking-[.32em] text-amber-300">LOS SANTOS POLICE DEPARTMENT</p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Officer Access Portal</h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">Sistem internal High Command & Personnel. Silakan autentikasi menggunakan akun Discord yang terdaftar pada server LSPD.</p>
      <a href="/api/auth/discord" className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl border border-[#7289da]/50 bg-[#5865F2] px-5 py-4 text-sm font-extrabold text-white shadow-lg transition hover:bg-[#4752c4]">
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current"><path d="M19.73 5.1A18.2 18.2 0 0 0 15.25 3.7l-.56 1.14a16.7 16.7 0 0 0-5.38 0L8.75 3.7A18.2 18.2 0 0 0 4.27 5.1C1.43 9.3.66 13.4 1.04 17.45a18.1 18.1 0 0 0 5.5 2.78l1.2-1.95c-.66-.25-1.29-.56-1.88-.92l.46-.36c3.62 1.68 7.55 1.68 11.13 0l.47.36c-.6.36-1.23.67-1.9.92l1.2 1.95a18.1 18.1 0 0 0 5.5-2.78c.45-4.7-.77-8.77-3-12.35ZM8.55 15.2c-1.08 0-1.97-.99-1.97-2.2s.87-2.2 1.97-2.2 1.99.99 1.97 2.2c0 1.21-.87 2.2-1.97 2.2Zm6.9 0c-1.08 0-1.97-.99-1.97-2.2s.87-2.2 1.97-2.2 1.99.99 1.97 2.2c0 1.21-.86 2.2-1.97 2.2Z"/></svg>
        LOGIN WITH DISCORD
      </a>
      <p className="mt-5 text-[10px] font-semibold tracking-[.16em] text-slate-500">AUTHORIZED PERSONNEL ONLY · SECURE OAUTH 2.0</p>
      <p className="mt-2 text-xs text-slate-500">Akses diberikan berdasarkan role Discord pada server LSPD.</p>
    </section>
  </main>;
}

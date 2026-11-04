import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PortalPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  return <div className="h-screen w-screen overflow-hidden bg-[#081321]">
    <div className="flex h-11 items-center justify-between border-b border-slate-700/70 bg-[#081321] px-4 text-xs text-slate-300">
      <span className="font-semibold tracking-wider">LSPD · AUTHORIZED COMMAND PORTAL</span>
      <div className="flex items-center gap-3">
        <span>{session.globalName || session.username}</span>
        <a href="/api/auth/logout" className="rounded-md border border-amber-300/30 px-3 py-1 font-semibold text-amber-200 hover:bg-amber-300/10">Logout</a>
      </div>
    </div>
    <iframe title="LSPD High Command & Personnel System" src="/portal.html" className="block h-[calc(100vh-44px)] w-full border-0" />
  </div>;
}

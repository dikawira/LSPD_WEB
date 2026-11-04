import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PortalPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  return <main className="h-screen w-screen overflow-hidden bg-[#07090d]">
    <iframe title="LSPD Command Portal" src="/portal.html" className="block h-screen w-full border-0" />
  </main>;
}

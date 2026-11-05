import { getSession, canManageAnnouncements } from "@/lib/auth";
import { redirect } from "next/navigation";
import ModuleClient from "../modules/ModuleClient";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="lspd-app min-h-screen">
      <ModuleClient
        slug="announcements"
        profile={{ username: session.username }}
        canManageAnnouncements={canManageAnnouncements(session)}
      />
    </div>
  );
}

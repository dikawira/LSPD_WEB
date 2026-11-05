import { getSession, canManagePhotos } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import ModuleClient from "../../modules/ModuleClient";
import MediaCenterPage from "./MediaCenterPage";
import { ensureLegacyPortalRecordsImported } from "@/lib/legacy-portal-import";

export const dynamic = "force-dynamic";

const modules: Record<string,string> = {
  "registrasi-officer":"registrasi-officer",
  "officer-attendance":"officer-attendance",
  "directory":"officer-directory",
  "fleet-data":"fleet-data",
  "weapon-data":"weapon-data",
};

const titles: Record<string,string> = {
  "media-all":"All Videos",
  "media-categories":"Video Categories",
  "media-playlists":"Playlists",
  "media-upload":"Upload Video",
};

export default async function PortalSection({params}:{params:Promise<{section:string}>}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const {section}=await params;
  if (modules[section]) {
    await ensureLegacyPortalRecordsImported();
    const [profileRecord, userProfile]=await Promise.all([
      prisma.portalRecord.findUnique({where:{kind_id:{kind:"officers",id:`officer-discord-${session.discordId}`}}}),
      prisma.user.findUnique({where:{discordId:session.discordId}})
    ]);
    const shared=(profileRecord?.payload||{}) as Record<string,unknown>;
    const profile={username:session.username,rank:String(shared.rank||userProfile?.rank||""),division:String(shared.division||userProfile?.division||""),fullName:String(shared.fullName||userProfile?.fullName||session.globalName||session.username)};
    return <div className="lspd-app min-h-screen"><ModuleClient slug={modules[section]} profile={profile} /></div>;
  }
  if (titles[section]) {
    if (section === "media-upload" && !canManagePhotos(session)) redirect("/?error=forbidden");
    return <MediaCenterPage mode={section as "media-all"|"media-categories"|"media-playlists"|"media-upload"} username={session.username} />;
  }
  notFound();
}

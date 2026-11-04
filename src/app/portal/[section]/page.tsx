import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import ModuleClient from "../../modules/ModuleClient";
import MediaCenterPage from "./MediaCenterPage";

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
    const profile=await prisma.user.findUnique({where:{discordId:session.discordId}});
    return <div className="lspd-app min-h-screen"><ModuleClient slug={modules[section]} profile={profile||{username:session.username}} /></div>;
  }
  if (titles[section]) {
    return <MediaCenterPage mode={section as "media-all"|"media-categories"|"media-playlists"|"media-upload"} username={session.username} />;
  }
  notFound();
}

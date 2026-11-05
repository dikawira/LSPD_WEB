import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import ChainOfCommandClient from "./ChainOfCommandClient";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await getSession();
  if (!session) redirect("/login");
  return <ChainOfCommandClient />;
}

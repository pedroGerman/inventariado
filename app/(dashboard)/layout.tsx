import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { getMyBusiness } from "@/lib/business/actions";
import { isMockMode } from "@/lib/config";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isMockMode()) {
    const business = await getMyBusiness();
    if (!business) {
      redirect("/onboarding");
    }
  }

  return <DashboardShell>{children}</DashboardShell>;
}

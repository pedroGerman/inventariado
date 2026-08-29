import { redirect } from "next/navigation";
import { getMyBusiness } from "@/lib/business/actions";
import { isMockMode } from "@/lib/config";
import { OnboardingClientLayout } from "./OnboardingClientLayout";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isMockMode()) {
    const business = await getMyBusiness();
    if (business) {
      redirect("/");
    }
  }

  return <OnboardingClientLayout>{children}</OnboardingClientLayout>;
}

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LandingPage } from "@/features/landing/components/LandingPage";

export default async function Home() {
  const cookieStore = await cookies();
  const hasToken =
    cookieStore.has("access_token") || cookieStore.has("refresh_token");

  if (hasToken) {
    redirect("/dashboard");
  }

  return <LandingPage />;
}

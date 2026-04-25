import { redirect } from "next/navigation";
import { LandingPage } from "@/features/landing/components/LandingPage";
import { getCurrentUser } from "@/lib/auth/server";

interface PageProps {
  searchParams: Promise<{ stay?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const { stay } = await searchParams;
  if (!stay) {
    const user = await getCurrentUser();
    if (user) redirect("/dashboard");
  }
  return <LandingPage />;
}

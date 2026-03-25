import { RegisterPage, GuestGuard } from "@/features/auth/components";

interface PageProps {
  searchParams: Promise<{ invitation?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const invitationToken = params.invitation;

  let invitedEmail: string | undefined;
  if (invitationToken) {
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(
        `${API_URL}/invitations/validate?token=${invitationToken}`,
        { cache: "no-store" },
      );
      if (res.ok) {
        const data = await res.json();
        invitedEmail = data.email;
      }
    } catch {
      // Token invalid or expired — show normal register form
    }
  }

  return (
    <GuestGuard>
      <RegisterPage
        invitationToken={invitationToken}
        invitedEmail={invitedEmail}
      />
    </GuestGuard>
  );
}

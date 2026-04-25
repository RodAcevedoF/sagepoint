"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Container,
  Stack,
  Toolbar,
  Typography,
  alpha,
} from "@mui/material";
import { CheckCircle2, CircleAlert, Loader2, MailQuestion } from "lucide-react";
import { PublicLayout, Card, Button } from "@/shared/components";
import { ButtonVariants } from "@/shared/types";
import { palette } from "@/shared/theme";

const Antigravity = dynamic(
  () =>
    import("@/shared/components/ui/animations/Antigravity").then(
      (m) => m.Antigravity,
    ),
  { ssr: false },
);

type Status = "idle" | "loading" | "success" | "error";

const AUTO_REDIRECT_MS = 3000;

async function verifyToken(token: string): Promise<void> {
  const url = `${
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
  }/auth/verify?token=${encodeURIComponent(token)}`;
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) {
    const payload = await res.json().catch(() => null);
    throw new Error(
      payload?.message ?? res.statusText ?? "Verification failed",
    );
  }
}

export function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") ?? null;

  const [status, setStatus] = useState<Status>(token ? "loading" : "idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    let timer: number | undefined;

    (async () => {
      try {
        await verifyToken(token);
        if (cancelled) return;
        setStatus("success");
        timer = window.setTimeout(
          () => router.push("/login"),
          AUTO_REDIRECT_MS,
        );
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setErrorMsg(err instanceof Error ? err.message : String(err));
      }
    })();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [token, router]);

  return (
    <PublicLayout>
      <Antigravity
        count={300}
        magnetRadius={10}
        lerpSpeed={0.08}
        color={palette.primary.light}
        fieldStrength={10}
        particleSize={1.3}
      />
      <Toolbar sx={{ mb: 2 }} />
      <Container
        component="main"
        maxWidth="sm"
        sx={{ position: "relative", zIndex: 1 }}
      >
        <Box
          sx={{
            py: { xs: 4, md: 8 },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Card
            variant="glass"
            hoverable={false}
            sx={{ p: { xs: 3, md: 5 }, width: "100%" }}
          >
            {status === "loading" && <LoadingState />}
            {status === "success" && <SuccessState />}
            {status === "error" && <ErrorState message={errorMsg} />}
            {status === "idle" && <IdleState />}
          </Card>
        </Box>
      </Container>
    </PublicLayout>
  );
}

function StateLayout({
  icon,
  iconColor,
  title,
  children,
}: {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Stack alignItems="center" spacing={2.5} textAlign="center">
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: alpha(iconColor, 0.12),
          border: `1px solid ${alpha(iconColor, 0.25)}`,
          boxShadow: `0 0 40px ${alpha(iconColor, 0.25)}`,
          color: iconColor,
        }}
      >
        {icon}
      </Box>
      <Typography
        variant="h5"
        sx={{ fontWeight: 700, letterSpacing: "-0.02em" }}
      >
        {title}
      </Typography>
      {children}
    </Stack>
  );
}

function LoadingState() {
  return (
    <StateLayout
      icon={
        <Loader2 size={32} style={{ animation: "spin 1.2s linear infinite" }} />
      }
      iconColor={palette.primary.light}
      title="Verifying your email"
    >
      <Typography variant="body2" sx={{ color: alpha("#ffffff", 0.7) }}>
        Hang tight — this only takes a moment.
      </Typography>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </StateLayout>
  );
}

function SuccessState() {
  return (
    <StateLayout
      icon={<CheckCircle2 size={36} strokeWidth={2.2} />}
      iconColor={palette.success.light}
      title="Email verified"
    >
      <Typography
        variant="body2"
        sx={{ color: alpha("#ffffff", 0.7), maxWidth: 360 }}
      >
        Your account is ready. Redirecting to sign in…
      </Typography>
      <Link href="/login" style={{ width: "100%", textDecoration: "none" }}>
        <Button
          label="Continue to sign in"
          variant={ButtonVariants.DEFAULT}
          fullWidth
        />
      </Link>
    </StateLayout>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <StateLayout
      icon={<CircleAlert size={36} strokeWidth={2.2} />}
      iconColor={palette.error.light}
      title="We couldn't verify that link"
    >
      <Typography
        variant="body2"
        sx={{ color: alpha("#ffffff", 0.7), maxWidth: 360 }}
      >
        {message ||
          "The link may have expired or already been used. Try signing in, or request a new verification email."}
      </Typography>
      <Link href="/login" style={{ width: "100%", textDecoration: "none" }}>
        <Button
          label="Back to sign in"
          variant={ButtonVariants.OUTLINED}
          fullWidth
        />
      </Link>
    </StateLayout>
  );
}

function IdleState() {
  return (
    <StateLayout
      icon={<MailQuestion size={36} strokeWidth={2.2} />}
      iconColor={palette.info.light}
      title="No verification token"
    >
      <Typography
        variant="body2"
        sx={{ color: alpha("#ffffff", 0.7), maxWidth: 360 }}
      >
        Open the verification link from the email we sent you to finish creating
        your account.
      </Typography>
      <Link href="/login" style={{ width: "100%", textDecoration: "none" }}>
        <Button
          label="Back to sign in"
          variant={ButtonVariants.OUTLINED}
          fullWidth
        />
      </Link>
    </StateLayout>
  );
}

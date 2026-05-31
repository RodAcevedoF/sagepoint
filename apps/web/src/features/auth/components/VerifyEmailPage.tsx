"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, Container, Stack, Toolbar } from "@mui/material";
import { CheckCircle2, CircleAlert, Loader2, MailQuestion } from "lucide-react";
import { Card, Button } from "@/shared/components";
import { ButtonVariants } from "@/shared/types";
import { aurora, auroraTint } from "@/shared/theme";
import {
  resolveAccent,
  type AuroraTone,
} from "@/shared/components/ui/Aurora/tones";

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
    <>
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
            variant="aurora"
            hoverable={false}
            withAura={false}
            sx={{ p: { xs: 3, md: 5 }, width: "100%" }}
          >
            {status === "loading" && <LoadingState />}
            {status === "success" && <SuccessState />}
            {status === "error" && <ErrorState message={errorMsg} />}
            {status === "idle" && <IdleState />}
          </Card>
        </Box>
      </Container>
    </>
  );
}

function StateLayout({
  icon,
  tone,
  title,
  children,
}: {
  icon: React.ReactNode;
  tone: AuroraTone;
  title: string;
  children: React.ReactNode;
}) {
  const color = resolveAccent(tone, undefined);
  return (
    <Stack
      alignItems="center"
      spacing={2.5}
      textAlign="center"
      sx={{ position: "relative", zIndex: 1 }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `color-mix(in oklch, ${color} 16%, ${aurora.surface2})`,
          border: `1px solid ${auroraTint(color, 0.28)}`,
          boxShadow: `0 0 44px -6px ${auroraTint(color, 0.45)}`,
          color,
        }}
      >
        {icon}
      </Box>
      <Box
        component="h1"
        sx={{
          fontFamily: aurora.font.display,
          fontWeight: 700,
          fontSize: { xs: "22px", md: "26px" },
          lineHeight: 1.2,
          letterSpacing: "-0.012em",
          color: aurora.txHi,
          margin: 0,
        }}
      >
        {title}
      </Box>
      {children}
    </Stack>
  );
}

function StateBody({ children }: { children: React.ReactNode }) {
  return (
    <Box
      component="p"
      sx={{
        fontFamily: aurora.font.ui,
        fontSize: { xs: "14px", md: "15.5px" },
        lineHeight: 1.55,
        color: aurora.txMid,
        maxWidth: 360,
        margin: 0,
      }}
    >
      {children}
    </Box>
  );
}

function LoadingState() {
  return (
    <StateLayout
      icon={
        <Loader2 size={32} style={{ animation: "spin 1.2s linear infinite" }} />
      }
      tone="teal"
      title="Verifying your email"
    >
      <StateBody>Hang tight — this only takes a moment.</StateBody>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </StateLayout>
  );
}

function SuccessState() {
  return (
    <StateLayout
      icon={<CheckCircle2 size={36} strokeWidth={2.2} />}
      tone="ready"
      title="Email verified"
    >
      <StateBody>Your account is ready. Redirecting to sign in…</StateBody>
      <Link href="/login" style={{ width: "100%", textDecoration: "none" }}>
        <Button
          label="Continue to sign in"
          variant={ButtonVariants.AURORA}
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
      tone="fail"
      title="We couldn't verify that link"
    >
      <StateBody>
        {message ||
          "The link may have expired or already been used. Try signing in, or request a new verification email."}
      </StateBody>
      <Link href="/login" style={{ width: "100%", textDecoration: "none" }}>
        <Button
          label="Back to sign in"
          variant={ButtonVariants.AURORA_OUTLINE}
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
      tone="concept"
      title="No verification token"
    >
      <StateBody>
        Open the verification link from the email we sent you to finish creating
        your account.
      </StateBody>
      <Link href="/login" style={{ width: "100%", textDecoration: "none" }}>
        <Button
          label="Back to sign in"
          variant={ButtonVariants.AURORA_OUTLINE}
          fullWidth
        />
      </Link>
    </StateLayout>
  );
}

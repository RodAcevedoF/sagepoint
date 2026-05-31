"use client";

import { Form } from "@/shared/components";
import { registerAction } from "@/app/actions/auth";
import { Box } from "@mui/material";
import { MailCheck } from "lucide-react";
import { aurora, auroraTint } from "@/shared/theme";

interface RegisterFormProps {
  invitationToken?: string;
  invitedEmail?: string;
}

export function RegisterForm({
  invitationToken,
  invitedEmail,
}: RegisterFormProps) {
  const isInvited = Boolean(invitationToken && invitedEmail);

  return (
    <Form action={registerAction}>
      <Form.Header
        title={isInvited ? "You're Invited!" : "Join SagePoint"}
        subtitle={
          isInvited
            ? "Complete your registration to get started"
            : "Start your journey towards mastery today"
        }
      />
      {isInvited && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 1.75,
            mb: 2,
            borderRadius: aurora.radii.md,
            background: `color-mix(in oklch, ${aurora.status.ready} 12%, ${aurora.surface2})`,
            border: `1px solid ${auroraTint(aurora.status.ready, 0.32)}`,
            color: aurora.status.ready,
            fontFamily: aurora.font.ui,
            fontSize: "13.5px",
            lineHeight: 1.4,
            "& strong": { color: aurora.txHi, fontWeight: 600 },
          }}
        >
          <MailCheck size={20} style={{ flex: "none" }} />
          <Box component="span" sx={{ color: aurora.txMid }}>
            Invitation for <strong>{invitedEmail}</strong>
          </Box>
        </Box>
      )}
      <Form.Error />
      <Form.Field
        name="name"
        label="Full Name"
        autoComplete="name"
        autoFocus
        required
      />
      {isInvited ? (
        <>
          <input type="hidden" name="email" value={invitedEmail} />
          <input type="hidden" name="invitationToken" value={invitationToken} />
          <Form.Field
            name="email-display"
            label="Email Address"
            type="email"
            defaultValue={invitedEmail}
            disabled
          />
        </>
      ) : (
        <Form.Field
          name="email"
          label="Email Address"
          type="email"
          autoComplete="email"
          required
        />
      )}
      <Form.Field
        name="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        required
      />
      <Form.Submit>
        {isInvited ? "Accept & Create Account" : "Create Account"}
      </Form.Submit>
      {!isInvited && (
        <>
          <Form.Divider />
          <Form.OAuth provider="google" />
        </>
      )}
      <Form.Link href="/login">Already have an account? Sign In</Form.Link>
    </Form>
  );
}

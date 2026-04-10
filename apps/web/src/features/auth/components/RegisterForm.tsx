"use client";

import { Form } from "@/shared/components";
import { registerAction } from "@/app/actions/auth";
import { Box, Typography, TextField, alpha } from "@mui/material";
import { MailCheck } from "lucide-react";
import { palette } from "@/shared/theme";

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
            p: 2,
            borderRadius: 2,
            bgcolor: alpha(palette.success.main, 0.08),
            border: `1px solid ${alpha(palette.success.main, 0.2)}`,
            mb: 2,
          }}
        >
          <MailCheck size={20} color={palette.success.light} />
          <Typography variant="body2" sx={{ color: palette.success.light }}>
            Invitation for <strong>{invitedEmail}</strong>
          </Typography>
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
          <TextField
            label="Email Address"
            type="email"
            value={invitedEmail}
            disabled
            fullWidth
            size="small"
            sx={{ mb: 2 }}
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

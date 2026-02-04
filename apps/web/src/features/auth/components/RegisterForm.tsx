"use client";

import { Form } from "@/common/components";
import { registerAction } from "@/app/actions/auth";

export function RegisterForm() {
  return (
    <Form action={registerAction}>
      <Form.Header
        title="Join SagePoint"
        subtitle="Start your journey towards mastery today"
      />
      <Form.Error />
      <Form.Field
        name="name"
        label="Full Name"
        autoComplete="name"
        autoFocus
        required
      />
      <Form.Field
        name="email"
        label="Email Address"
        type="email"
        autoComplete="email"
        required
      />
      <Form.Field
        name="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        required
      />
      <Form.Submit>Create Account</Form.Submit>
      <Form.Divider />
      <Form.OAuth provider="google" />
      <Form.Link href="/login">Already have an account? Sign In</Form.Link>
    </Form>
  );
}

"use client";

import { Form } from "@/common/components";
import { loginAction } from "@/app/actions/auth";

export function LoginForm() {
  return (
    <Form action={loginAction}>
      <Form.Header
        title="Welcome Back"
        subtitle="Sign in to continue your learning journey"
      />
      <Form.Error />
      <Form.Field
        name="email"
        label="Email Address"
        type="email"
        autoComplete="email"
        autoFocus
        required
      />
      <Form.Field
        name="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        required
      />
      <Form.Submit>Sign In</Form.Submit>
      <Form.Divider />
      <Form.OAuth provider="google" />
      <Form.Link href="/register">
        Don&apos;t have an account? Sign Up
      </Form.Link>
    </Form>
  );
}

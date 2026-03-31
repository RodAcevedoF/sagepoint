import { Invitation } from "../../../../src";
import { InvitationStatus } from "../../../../src";
import { UserRole } from "../../../../src";

const FUTURE = new Date("2099-12-31T23:59:59.000Z");
const PAST = new Date("2000-01-01T00:00:00.000Z");

describe("Invitation", () => {
  describe("create", () => {
    it("creates a PENDING invitation with default USER role", () => {
      const inv = Invitation.create(
        "i1",
        "alice@example.com",
        "tok-abc",
        "admin-1",
        FUTURE,
      );

      expect(inv.id).toBe("i1");
      expect(inv.email).toBe("alice@example.com");
      expect(inv.token).toBe("tok-abc");
      expect(inv.invitedById).toBe("admin-1");
      expect(inv.expiresAt).toBe(FUTURE);
      expect(inv.role).toBe(UserRole.USER);
      expect(inv.status).toBe(InvitationStatus.PENDING);
      expect(inv.acceptedById).toBeNull();
    });

    it("creates an invitation with explicit ADMIN role", () => {
      const inv = Invitation.create(
        "i2",
        "bob@example.com",
        "tok-xyz",
        "admin-1",
        FUTURE,
        UserRole.ADMIN,
      );

      expect(inv.role).toBe(UserRole.ADMIN);
    });
  });

  describe("isExpired", () => {
    it("returns false when expiresAt is in the future", () => {
      const inv = Invitation.create("i1", "a@b.com", "tok", "admin-1", FUTURE);

      expect(inv.isExpired()).toBe(false);
    });

    it("returns true when expiresAt is in the past", () => {
      const inv = Invitation.create("i1", "a@b.com", "tok", "admin-1", PAST);

      expect(inv.isExpired()).toBe(true);
    });
  });

  describe("isPending", () => {
    it("returns true for a fresh PENDING invitation that has not expired", () => {
      const inv = Invitation.create("i1", "a@b.com", "tok", "admin-1", FUTURE);

      expect(inv.isPending()).toBe(true);
    });

    it("returns false when the invitation is expired", () => {
      const inv = Invitation.create("i1", "a@b.com", "tok", "admin-1", PAST);

      expect(inv.isPending()).toBe(false);
    });

    it("returns false when the invitation has been accepted", () => {
      const inv = Invitation.create(
        "i1",
        "a@b.com",
        "tok",
        "admin-1",
        FUTURE,
      ).accept("user-1");

      expect(inv.isPending()).toBe(false);
    });

    it("returns false when the invitation has been revoked", () => {
      const inv = Invitation.create(
        "i1",
        "a@b.com",
        "tok",
        "admin-1",
        FUTURE,
      ).revoke();

      expect(inv.isPending()).toBe(false);
    });
  });

  describe("accept", () => {
    it("returns a new invitation with ACCEPTED status and the acceptedById set", () => {
      const original = Invitation.create(
        "i1",
        "a@b.com",
        "tok",
        "admin-1",
        FUTURE,
      );
      const accepted = original.accept("user-99");

      expect(accepted.status).toBe(InvitationStatus.ACCEPTED);
      expect(accepted.acceptedById).toBe("user-99");
      expect(accepted).not.toBe(original);
      // original is unchanged
      expect(original.status).toBe(InvitationStatus.PENDING);
    });
  });

  describe("revoke", () => {
    it("returns a new invitation with REVOKED status", () => {
      const original = Invitation.create(
        "i1",
        "a@b.com",
        "tok",
        "admin-1",
        FUTURE,
      );
      const revoked = original.revoke();

      expect(revoked.status).toBe(InvitationStatus.REVOKED);
      expect(revoked).not.toBe(original);
      // original is unchanged
      expect(original.status).toBe(InvitationStatus.PENDING);
    });
  });
});

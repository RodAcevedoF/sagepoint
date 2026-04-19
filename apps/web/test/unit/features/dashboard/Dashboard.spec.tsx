import "@test/_helpers/next-mocks";
import { screen, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@test/_helpers/msw-server";
import { renderWithProviders } from "@test/_helpers/render";
import { Dashboard } from "@/features/dashboard/components/Dashboard";
import {
  mockUser,
  makeUserRoadmap,
  makeDocument,
} from "@test/_helpers/fixtures";

const API = "http://localhost:3001";

function setupHandlers({
  user = mockUser,
  roadmaps = [
    makeUserRoadmap({ title: "React Basics", completed: 3, total: 5 }),
  ],
  documents = [makeDocument()],
} = {}) {
  server.use(
    http.get(`${API}/auth/me`, () => HttpResponse.json(user)),
    http.get(`${API}/roadmaps/user/me`, () => HttpResponse.json(roadmaps)),
    http.get(`${API}/documents/user/me`, () =>
      HttpResponse.json({
        data: documents,
        nextCursor: null,
        hasMore: false,
        total: documents.length,
      }),
    ),
    http.get(`${API}/insights`, () => HttpResponse.json([])),
  );
}

describe("Dashboard", () => {
  it("shows greeting with user first name after loading", async () => {
    setupHandlers();
    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/test!/i)).toBeInTheDocument();
    });
  });

  it("shows metrics computed from roadmap data", async () => {
    setupHandlers({
      roadmaps: [
        makeUserRoadmap({ title: "React", completed: 3, total: 5 }),
        makeUserRoadmap({ id: "r2", title: "Node", completed: 2, total: 4 }),
      ],
    });
    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Learning Hours")).toBeInTheDocument();
      expect(screen.getByText("Topics Completed")).toBeInTheDocument();
    });
  });

  it("shows empty state when no completed roadmaps", async () => {
    setupHandlers({ roadmaps: [] });
    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("No roadmaps yet")).toBeInTheDocument();
    });
  });

  it("shows roadmap progress section when roadmaps exist", async () => {
    setupHandlers();
    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Roadmap Progress")).toBeInTheDocument();
      expect(screen.getAllByText("React Basics").length).toBeGreaterThanOrEqual(
        1,
      );
    });
  });

  it("shows recent documents when user has documents", async () => {
    setupHandlers({
      documents: [makeDocument({ filename: "my-notes.pdf" })],
    });
    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Recent Documents")).toBeInTheDocument();
      expect(screen.getByText("my-notes.pdf")).toBeInTheDocument();
    });
  });

  it("shows empty state when no documents", async () => {
    setupHandlers({ documents: [] });
    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Roadmap Progress")).toBeInTheDocument();
    });
    expect(screen.getByText("Recent Documents")).toBeInTheDocument();
    expect(screen.getByText("No documents yet")).toBeInTheDocument();
  });
});

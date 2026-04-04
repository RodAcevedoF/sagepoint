import "@test/_helpers/next-mocks";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { DashboardRecentDocuments } from "@/features/dashboard/components/DashboardRecentDocuments";
import { mockRouter } from "@test/_helpers/next-mocks";
import type { DocumentDetailDto } from "@/infrastructure/api/documentApi";

const docs: DocumentDetailDto[] = [
  {
    id: "d1",
    filename: "react-guide.pdf",
    status: "COMPLETED",
    storagePath: "/files/react-guide.pdf",
    userId: "u1",
    processingStage: "READY" as never,
    mimeType: "application/pdf",
    createdAt: "2026-03-16T10:00:00Z",
    updatedAt: "2026-03-16T10:00:00Z",
  },
  {
    id: "d2",
    filename: "node-tutorial.docx",
    status: "COMPLETED",
    storagePath: "/files/node-tutorial.docx",
    userId: "u1",
    processingStage: "READY" as never,
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    createdAt: "2026-03-15T10:00:00Z",
    updatedAt: "2026-03-15T10:00:00Z",
  },
  {
    id: "d3",
    filename: "data-analysis.xlsx",
    status: "COMPLETED",
    storagePath: "/files/data-analysis.xlsx",
    userId: "u1",
    processingStage: "ANALYZING" as never,
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    createdAt: "2026-03-14T10:00:00Z",
    updatedAt: "2026-03-14T10:00:00Z",
  },
  {
    id: "d4",
    filename: "old-doc.pdf",
    status: "COMPLETED",
    storagePath: "/files/old-doc.pdf",
    userId: "u1",
    processingStage: "READY" as never,
    mimeType: "application/pdf",
    createdAt: "2026-02-01T10:00:00Z",
    updatedAt: "2026-02-01T10:00:00Z",
  },
  {
    id: "d5",
    filename: "ancient-notes.pdf",
    status: "COMPLETED",
    storagePath: "/files/ancient-notes.pdf",
    userId: "u1",
    processingStage: "READY" as never,
    mimeType: "application/pdf",
    createdAt: "2025-12-01T10:00:00Z",
    updatedAt: "2025-12-01T10:00:00Z",
  },
];

describe("DashboardRecentDocuments", () => {
  it("renders section title", () => {
    render(<DashboardRecentDocuments documents={docs} />);
    expect(screen.getByText("Recent Documents")).toBeInTheDocument();
  });

  it("shows only the 4 most recent documents", () => {
    render(<DashboardRecentDocuments documents={docs} />);
    expect(screen.getByText("react-guide.pdf")).toBeInTheDocument();
    expect(screen.getByText("node-tutorial.docx")).toBeInTheDocument();
    expect(screen.getByText("data-analysis.xlsx")).toBeInTheDocument();
    expect(screen.getByText("old-doc.pdf")).toBeInTheDocument();
    expect(screen.queryByText("ancient-notes.pdf")).not.toBeInTheDocument();
  });

  it("shows processing stage badges", () => {
    render(<DashboardRecentDocuments documents={docs} />);
    const readyBadges = screen.getAllByText("Ready");
    expect(readyBadges.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Analyzing")).toBeInTheDocument();
  });

  it("navigates to document detail on click", async () => {
    const user = userEvent.setup();
    render(<DashboardRecentDocuments documents={docs} />);

    await user.click(screen.getByText("react-guide.pdf"));
    expect(mockRouter.push).toHaveBeenCalledWith("/documents/d1");
  });

  it('"View all" navigates to /documents', async () => {
    const user = userEvent.setup();
    render(<DashboardRecentDocuments documents={docs} />);

    await user.click(screen.getByText(/view all/i));
    expect(mockRouter.push).toHaveBeenCalledWith("/documents");
  });
});

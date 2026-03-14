import { GCSStorage } from "../src/gcs.storage";

// ─── GCS Mock ────────────────────────────────────────────────────────────────

interface MockFile {
  savedContent: Buffer | null;
  savedOptions: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
  signedUrl: string;
}

const mockFiles = new Map<string, MockFile>();

function getOrCreateMockFile(path: string): MockFile {
  if (!mockFiles.has(path)) {
    mockFiles.set(path, {
      savedContent: null,
      savedOptions: null,
      metadata: {},
      signedUrl: `https://storage.googleapis.com/signed/${path}?token=abc`,
    });
  }
  return mockFiles.get(path)!;
}

const mockFileFn = jest.fn((path: string) => {
  const mf = getOrCreateMockFile(path);
  return {
    save: jest.fn(async (content: Buffer, options: Record<string, unknown>) => {
      mf.savedContent = content;
      mf.savedOptions = options;
    }),
    download: jest.fn(async () => {
      if (!mf.savedContent) throw new Error(`File not found: ${path}`);
      return [mf.savedContent];
    }),
    delete: jest.fn(async () => {
      mockFiles.delete(path);
    }),
    getMetadata: jest.fn(async () => [mf.metadata]),
    getSignedUrl: jest.fn(async (_opts: Record<string, unknown>) => [
      mf.signedUrl,
    ]),
  };
});

const mockBucket = jest.fn(() => ({
  file: mockFileFn,
}));

jest.mock("@google-cloud/storage", () => ({
  Storage: jest.fn().mockImplementation(() => ({
    bucket: mockBucket,
  })),
}));

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("GCSStorage", () => {
  let storage: GCSStorage;

  const config = {
    projectId: "test-project",
    bucketName: "test-bucket",
    keyFilename: "/path/to/key.json",
  };

  beforeEach(() => {
    mockFiles.clear();
    jest.clearAllMocks();
    storage = new GCSStorage(config);
  });

  describe("upload", () => {
    it("saves content with correct contentType", async () => {
      const content = Buffer.from("file data");

      await storage.upload("docs/file.pdf", content, "application/pdf");

      const mf = getOrCreateMockFile("docs/file.pdf");
      expect(mf.savedContent).toEqual(content);
      expect(mf.savedOptions).toMatchObject({
        contentType: "application/pdf",
        public: false,
      });
    });

    it("returns the path for private uploads", async () => {
      const result = await storage.upload(
        "docs/file.pdf",
        Buffer.from("data"),
        "application/pdf",
      );

      expect(result).toBe("docs/file.pdf");
    });

    it("returns public URL for public uploads", async () => {
      const result = await storage.upload(
        "images/photo.jpg",
        Buffer.from("img"),
        "image/jpeg",
        { isPublic: true },
      );

      expect(result).toBe(
        "https://storage.googleapis.com/test-bucket/images/photo.jpg",
      );
    });

    it("passes metadata to GCS", async () => {
      await storage.upload(
        "docs/file.pdf",
        Buffer.from("data"),
        "application/pdf",
        { metadata: { userId: "u1", originalName: "thesis.pdf" } },
      );

      const mf = getOrCreateMockFile("docs/file.pdf");
      expect(mf.savedOptions).toMatchObject({
        metadata: {
          metadata: { userId: "u1", originalName: "thesis.pdf" },
        },
      });
    });
  });

  describe("download", () => {
    it("returns file content as Buffer", async () => {
      const content = Buffer.from("file content");
      getOrCreateMockFile("docs/file.pdf").savedContent = content;

      const result = await storage.download("docs/file.pdf");

      expect(result).toEqual(content);
    });

    it("throws when file does not exist", async () => {
      await expect(storage.download("nonexistent.pdf")).rejects.toThrow(
        "File not found",
      );
    });
  });

  describe("delete", () => {
    it("removes the file", async () => {
      getOrCreateMockFile("docs/file.pdf").savedContent = Buffer.from("data");

      await storage.delete("docs/file.pdf");

      expect(mockFiles.has("docs/file.pdf")).toBe(false);
    });
  });

  describe("getUrl", () => {
    it("returns public URL when file has allUsers ACL", async () => {
      getOrCreateMockFile("public/img.png").metadata = {
        acl: [{ entity: "allUsers", role: "READER" }],
      };

      const url = await storage.getUrl("public/img.png");

      expect(url).toBe(
        "https://storage.googleapis.com/test-bucket/public/img.png",
      );
    });

    it("returns signed URL for private files", async () => {
      getOrCreateMockFile("private/doc.pdf").metadata = { acl: [] };

      const url = await storage.getUrl("private/doc.pdf");

      expect(url).toContain("signed");
    });

    it("returns signed URL when no ACL present", async () => {
      getOrCreateMockFile("private/doc.pdf").metadata = {};

      const url = await storage.getUrl("private/doc.pdf");

      expect(url).toContain("signed");
    });
  });
});

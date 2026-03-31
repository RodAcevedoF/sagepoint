import { Category } from "../../../../src";

describe("Category", () => {
  describe("create", () => {
    it("creates a category with required fields", () => {
      const cat = Category.create("c1", "Web Development", "web-development");

      expect(cat.id).toBe("c1");
      expect(cat.name).toBe("Web Development");
      expect(cat.slug).toBe("web-development");
      expect(cat.description).toBeUndefined();
      expect(cat.parentId).toBeUndefined();
    });

    it("creates a category with optional description and parentId", () => {
      const cat = Category.create("c2", "React", "react", "JS library", "c1");

      expect(cat.description).toBe("JS library");
      expect(cat.parentId).toBe("c1");
    });
  });

  describe("slugify", () => {
    it.each([
      ["Web Development", "web-development"],
      ["  React.js  ", "reactjs"],
      ["C++ Programming", "c-programming"],
      ["machine---learning", "machine-learning"],
      ["Node.js & Express", "nodejs-express"],
      ["TypeScript", "typescript"],
    ])('slugifies "%s" → "%s"', (input, expected) => {
      expect(Category.slugify(input)).toBe(expected);
    });

    it("strips leading and trailing hyphens", () => {
      expect(Category.slugify("---hello---")).toBe("hello");
    });
  });
});

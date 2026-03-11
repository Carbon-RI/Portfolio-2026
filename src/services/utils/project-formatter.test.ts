import { createSlugFromTitle, extractYouTubeId } from "@/services/utils/project-formatter";

describe("createSlugFromTitle", () => {
  it("lowercases and replaces spaces with hyphens", () => {
    expect(createSlugFromTitle("My Project Title")).toBe("my-project-title");
  });

  it("trims leading and trailing whitespace", () => {
    expect(createSlugFromTitle("  Title  ")).toBe("title");
  });

  it("collapses multiple spaces to single hyphen", () => {
    expect(createSlugFromTitle("a   b   c")).toBe("a-b-c");
  });

  it("removes non-word chars except hyphen", () => {
    expect(createSlugFromTitle("Hello! World?")).toBe("hello-world");
  });

  it("collapses multiple hyphens", () => {
    expect(createSlugFromTitle("a---b--c")).toBe("a-b-c");
  });

  it("returns empty string for empty input", () => {
    expect(createSlugFromTitle("")).toBe("");
  });

  it("returns empty string for whitespace-only", () => {
    expect(createSlugFromTitle("   ")).toBe("");
  });

  it("handles unicode/special chars removal", () => {
    expect(createSlugFromTitle("Café & Bar")).toBe("caf-bar");
  });
});

describe("extractYouTubeId", () => {
  it("returns empty string for empty input", () => {
    expect(extractYouTubeId("")).toBe("");
  });

  it("returns 11-char ID as-is when no slash", () => {
    expect(extractYouTubeId("dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("extracts ID from youtube.com/watch?v=", () => {
    expect(extractYouTubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("extracts ID from youtu.be/", () => {
    expect(extractYouTubeId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("extracts ID from embed URL", () => {
    expect(extractYouTubeId("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("extracts ID with query params", () => {
    expect(extractYouTubeId("https://youtube.com/watch?v=abc12345678&list=foo")).toBe("abc12345678");
  });

  it("returns input when regex does not match", () => {
    expect(extractYouTubeId("https://example.com/not-youtube")).toBe("https://example.com/not-youtube");
  });

  it("returns input when length is not 11 and no match", () => {
    expect(extractYouTubeId("short")).toBe("short");
  });
});

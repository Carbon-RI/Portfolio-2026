import {
  mapToFullData,
  mergeProjectAndDraft,
  getAdminCardData,
  getEditorStatus,
} from "@/services/utils/project-converter";

const mockTimestamp = (ms: number) => ({
  toMillis: () => ms,
  seconds: Math.floor(ms / 1000),
  nanoseconds: 0,
});

const baseFirestoreData: Record<string, unknown> = {
  slug: "my-project",
  title: "My Project",
  category: ["Web App"],
  industry: "General",
  summary: "Summary",
  imageSrc: "https://example.com/img.png",
  githubUrl: "https://github.com/foo",
  demoUrl: "https://demo.example.com",
  techStack: ["SiReact", "SiNextdotjs"],
  published: true,
  is_deleted: false,
  showDetail: true,
  updatedAt: mockTimestamp(1700000000000),
  sections: [{ heading: "Overview", content: "Content", media: [] }],
};

describe("mapToFullData", () => {
  it("converts valid Firestore data to FullProjectData", () => {
    const result = mapToFullData("doc-1", baseFirestoreData);
    expect(result.id).toBe("doc-1");
    expect(result.slug).toBe("my-project");
    expect(result.title).toBe("My Project");
    expect(result.category).toEqual(["Web App"]);
    expect(result.industry).toBe("General");
    expect(result.techStack).toEqual(["SiReact", "SiNextdotjs"]);
    expect(result.published).toBe(true);
    expect(result.is_deleted).toBe(false);
    expect(result.showDetail).toBe(true);
    expect(result.updatedAt).toBe(1700000000000);
    expect(result.sections).toEqual([
      { heading: "Overview", content: "Content", media: [] },
    ]);
    expect(result.draft).toBeUndefined();
  });

  it("handles Firestore Timestamp via toMillis", () => {
    const data = { ...baseFirestoreData, updatedAt: mockTimestamp(1600000000000) };
    const result = mapToFullData("doc-2", data);
    expect(result.updatedAt).toBe(1600000000000);
  });

  it("handles Date as updatedAt", () => {
    const date = new Date(1500000000000);
    const data = { ...baseFirestoreData, updatedAt: date };
    const result = mapToFullData("doc-3", data);
    expect(result.updatedAt).toBe(1500000000000);
  });

  it("handles number and string updatedAt", () => {
    expect(mapToFullData("d1", { ...baseFirestoreData, updatedAt: 1400000000000 }).updatedAt).toBe(1400000000000);
    expect(mapToFullData("d2", { ...baseFirestoreData, updatedAt: "2024-01-01T00:00:00.000Z" }).updatedAt).toBe(1704067200000);
  });

  it("returns undefined updatedAt for invalid date string", () => {
    const result = mapToFullData("d-invalid", { ...baseFirestoreData, updatedAt: "invalid-date" });
    expect(result.updatedAt).toBeUndefined();
  });

  it("returns undefined updatedAt when type is not timestamp/date/number/string", () => {
    const result = mapToFullData("d-obj", { ...baseFirestoreData, updatedAt: {} });
    expect(result.updatedAt).toBeUndefined();
  });

  it("returns empty strings for missing/invalid string fields", () => {
    const result = mapToFullData("doc-4", {});
    expect(result.slug).toBe("");
    expect(result.title).toBe("");
    expect(result.industry).toBe("");
    expect(result.category).toEqual([]);
    expect(result.techStack).toEqual([]);
    expect(result.sections).toEqual([]);
  });

  it("includes draft when present and is object", () => {
    const data = {
      ...baseFirestoreData,
      draft: { title: "Draft Title", summary: "Draft summary" },
    };
    const result = mapToFullData("doc-5", data);
    expect(result.draft?.title).toBe("Draft Title");
    expect(result.draft?.summary).toBe("Draft summary");
  });

  it("uses baseData.updatedAt when draft.updatedAt is unparseable", () => {
    const data = {
      ...baseFirestoreData,
      draft: { updatedAt: "invalid-date" },
    };
    const result = mapToFullData("doc-draft-ts", data);
    expect(result.draft?.updatedAt).toBe(1700000000000);
  });

  it("uses baseData.updatedAt when draft.updatedAt converts to falsy (0)", () => {
    const data = {
      ...baseFirestoreData,
      draft: { updatedAt: 0 },
    };
    const result = mapToFullData("doc-draft-zero", data);
    expect(result.draft?.updatedAt).toBe(1700000000000);
  });

  it("applies ensureCategoryArray for draft.category when defined", () => {
    const data = {
      ...baseFirestoreData,
      draft: { category: ["A", "B"] },
    };
    const result = mapToFullData("doc-6", data);
    expect(result.draft?.category).toEqual(["A", "B"]);
  });

  it("sets draft.category to undefined when not in draft", () => {
    const data = {
      ...baseFirestoreData,
      draft: { title: "Draft" },
    };
    const result = mapToFullData("doc-6b", data);
    expect(result.draft?.category).toBeUndefined();
  });

  it("uses draft.showDetail when defined in draft", () => {
    const data = {
      ...baseFirestoreData,
      draft: { showDetail: false },
    };
    const result = mapToFullData("doc-showdetail", data);
    expect(result.draft?.showDetail).toBe(false);
  });

  it("normalizes category when single string", () => {
    const result = mapToFullData("doc-7", { ...baseFirestoreData, category: "Single" });
    expect(result.category).toEqual(["Single"]);
  });

  it("returns empty category for empty string", () => {
    const result = mapToFullData("doc-8", { ...baseFirestoreData, category: "" });
    expect(result.category).toEqual([]);
  });

  it("returns empty category for empty array", () => {
    const result = mapToFullData("doc-9", { ...baseFirestoreData, category: [] });
    expect(result.category).toEqual([]);
  });

  it("defaults showDetail to true when undefined", () => {
    const data = { ...baseFirestoreData };
    delete data.showDetail;
    const result = mapToFullData("doc-10", data);
    expect(result.showDetail).toBe(true);
  });

  it("respects showDetail false", () => {
    const result = mapToFullData("doc-11", { ...baseFirestoreData, showDetail: false });
    expect(result.showDetail).toBe(false);
  });
});

describe("mergeProjectAndDraft", () => {
  it("returns project without draft when no draft", () => {
    const project = mapToFullData("doc-1", baseFirestoreData);
    const merged = mergeProjectAndDraft(project);
    expect(merged.draft).toBeUndefined();
    expect(merged.title).toBe("My Project");
  });

  it("merges draft over base using base when draft fields are undefined", () => {
    const project = mapToFullData("doc-2", {
      ...baseFirestoreData,
      draft: { title: "New Title", summary: "New summary" },
    });
    const merged = mergeProjectAndDraft(project);
    expect(merged.title).toBe("New Title");
    expect(merged.summary).toBe("New summary");
    expect(merged.category).toEqual(["Web App"]);
    expect(merged.techStack).toEqual(["SiReact", "SiNextdotjs"]);
  });

  it("uses draft.category, draft.techStack, draft.sections when defined", () => {
    const project = mapToFullData("doc-3", {
      ...baseFirestoreData,
      draft: {
        category: ["Mobile App"],
        techStack: ["SiGo"],
        sections: [{ heading: "Draft", content: "Draft content", media: [] }],
      },
    });
    const merged = mergeProjectAndDraft(project);
    expect(merged.category).toEqual(["Mobile App"]);
    expect(merged.techStack).toEqual(["SiGo"]);
    expect(merged.sections).toEqual([{ heading: "Draft", content: "Draft content", media: [] }]);
  });
});

describe("getAdminCardData", () => {
  it("returns status Published when not admin", () => {
    const project = mapToFullData("doc-1", baseFirestoreData);
    const result = getAdminCardData(project, false);
    expect(result.status).toBe("Published");
  });

  it("returns status from getProjectStatus when admin and no draft", () => {
    const project = mapToFullData("doc-2", baseFirestoreData);
    const result = getAdminCardData(project, true);
    expect(result.status).toBe("Published");
  });

  it("merges project with draft when admin and draft exists", () => {
    const project = mapToFullData("doc-3", {
      ...baseFirestoreData,
      draft: { title: "Draft Title" },
    });
    const result = getAdminCardData(project, true);
    expect(result.title).toBe("Draft Title");
    expect(result.status).toBe("DraftModified");
  });
});

describe("getEditorStatus", () => {
  it("returns NewDraft when creating new and not saved", () => {
    const project = mapToFullData("doc-1", baseFirestoreData);
    expect(getEditorStatus(project, true, false)).toBe("NewDraft");
  });

  it("returns getProjectStatus result otherwise", () => {
    const project = mapToFullData("doc-2", baseFirestoreData);
    expect(getEditorStatus(project, false, false)).toBe("Published");
  });
});

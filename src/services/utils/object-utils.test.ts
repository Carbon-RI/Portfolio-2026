import { cleanFields } from "@/services/utils/object-utils";

describe("cleanFields", () => {
  it("removes undefined values", () => {
    const result = cleanFields({ a: 1, b: undefined, c: "x" });
    expect(result).toEqual({ a: 1, c: "x" });
  });

  it("keeps null", () => {
    const result = cleanFields({ a: null });
    expect(result).toEqual({ a: null });
  });

  it("keeps falsy values except undefined", () => {
    const result = cleanFields({ a: 0, b: "", c: false });
    expect(result).toEqual({ a: 0, b: "", c: false });
  });

  it("returns empty object for empty input", () => {
    expect(cleanFields({})).toEqual({});
  });

  it("returns empty object when all values are undefined", () => {
    expect(cleanFields({ a: undefined, b: undefined })).toEqual({});
  });
});

import { isGifImageUrl } from "./image-url";

describe("isGifImageUrl", () => {
  it("returns true for Firebase Storage–style path ending in .gif before query params", () => {
    const url =
      "https://firebasestorage.googleapis.com/v0/b/my-app.appspot.com/o/projects%2Fp1%2Fimages%2Fdemo.gif?alt=media&token=abc123";
    expect(isGifImageUrl(url)).toBe(true);
  });

  it("returns false for Firebase JPEG with alt=media", () => {
    const url =
      "https://firebasestorage.googleapis.com/v0/b/bucket/o/img%2Fphoto.jpg?alt=media&token=x";
    expect(isGifImageUrl(url)).toBe(false);
  });

  it("is case-insensitive on extension", () => {
    expect(
      isGifImageUrl(
        "https://example.com/v0/b/x/o/path%2Ffile.GIF?alt=media"
      )
    ).toBe(true);
  });

  it("falls back when URL parsing fails", () => {
    expect(isGifImageUrl("/relative/path.gif?query=1")).toBe(true);
    expect(isGifImageUrl("not-a-url")).toBe(false);
  });
});

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePreviewFavicon } from "./usePreviewFavicon";

describe("usePreviewFavicon", () => {
  let link: HTMLLinkElement;

  beforeEach(() => {
    link = document.createElement("link");
    link.rel = "icon";
    link.href = "https://example.com/original.png";
    document.head.appendChild(link);
  });

  afterEach(() => {
    link.remove();
  });

  it("does nothing when logoUrl is undefined", () => {
    renderHook(() => usePreviewFavicon(undefined));
    expect(link.href).toBe("https://example.com/original.png");
  });

  it("swaps the favicon href while mounted", () => {
    renderHook(() => usePreviewFavicon("https://example.com/client-logo.png"));
    expect(link.href).toBe("https://example.com/client-logo.png");
  });

  it("restores the original favicon on unmount", () => {
    const { unmount } = renderHook(() => usePreviewFavicon("https://example.com/client-logo.png"));
    expect(link.href).toBe("https://example.com/client-logo.png");
    unmount();
    expect(link.href).toBe("https://example.com/original.png");
  });

  it("does not throw when no icon link exists in the document", () => {
    link.remove();
    expect(() => renderHook(() => usePreviewFavicon("https://example.com/client-logo.png"))).not.toThrow();
  });
});

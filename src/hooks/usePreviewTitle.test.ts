import { describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePreviewTitle } from "./usePreviewTitle";

describe("usePreviewTitle", () => {
  beforeEach(() => {
    document.title = "Gilles Cobigo";
  });

  it("does nothing when title is undefined", () => {
    renderHook(() => usePreviewTitle(undefined));
    expect(document.title).toBe("Gilles Cobigo");
  });

  it("sets the document title while mounted", () => {
    renderHook(() => usePreviewTitle("Le Dressing de Maïlys"));
    expect(document.title).toBe("Le Dressing de Maïlys");
  });

  it("restores the original title on unmount", () => {
    const { unmount } = renderHook(() => usePreviewTitle("Le Dressing de Maïlys"));
    expect(document.title).toBe("Le Dressing de Maïlys");
    unmount();
    expect(document.title).toBe("Gilles Cobigo");
  });
});

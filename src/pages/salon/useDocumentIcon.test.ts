import { afterEach, describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDocumentIcon } from "./useDocumentIcon";

const iconHref = (rel: string) => document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)?.getAttribute("href");

function addLink(rel: string, href: string) {
  const link = document.createElement("link");
  link.rel = rel;
  link.setAttribute("href", href);
  document.head.appendChild(link);
}

afterEach(() => {
  document.head.innerHTML = "";
});

describe("useDocumentIcon", () => {
  it("remplace l'icône d'onglet et l'apple-touch-icon d'index.html, puis les restaure au démontage", () => {
    addLink("icon", "/images/logo-gc-white.png");
    addLink("apple-touch-icon", "/images/apple-touch-icon.png");

    const { unmount } = renderHook(() => useDocumentIcon("/images/favicon.png"));
    expect(iconHref("icon")).toBe("/images/favicon.png");
    expect(iconHref("apple-touch-icon")).toBe("/images/favicon.png");

    unmount();
    expect(iconHref("icon")).toBe("/images/logo-gc-white.png");
    expect(iconHref("apple-touch-icon")).toBe("/images/apple-touch-icon.png");
  });

  it("crée les balises absentes et les retire au démontage", () => {
    const { unmount } = renderHook(() => useDocumentIcon("/images/favicon.png"));
    expect(iconHref("icon")).toBe("/images/favicon.png");
    expect(iconHref("apple-touch-icon")).toBe("/images/favicon.png");

    unmount();
    expect(document.head.querySelector('link[rel="icon"]')).toBeNull();
    expect(document.head.querySelector('link[rel="apple-touch-icon"]')).toBeNull();
  });
});

import { Link } from "@digdir/designsystemet-react";
import NextLink from "next/link";
import { createElement, type ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import messages from "../../../../messages/en.json";
import { EmptyState } from "./shell";

// The empty Library (UX-DR-47), as the Library page renders it when it has no images. The e2e test
// database now always holds the sample library, so this replaces the old empty-Library browser test.
it("the empty Library shows one muted sentence and one action, which leads to Upload", () => {
  const html = renderToStaticMarkup(
    createElement(EmptyState, {
      text: messages.library.empty,
      action: createElement(
        Link,
        // The children come as the third argument, which createElement's types do not count.
        { asChild: true } as ComponentProps<typeof Link>,
        createElement(NextLink, { href: "/upload" }, messages.library.emptyAction),
      ),
    }),
  );
  expect(html).toMatch(/^<div class="empty-state"><p>The library has no images yet\.<\/p><a [^>]*>Upload images<\/a><\/div>$/);
  expect(html).toContain('href="/upload"');
});

// Find images for a client that may see nothing (the shared databases always hold public images).
it("Find images with nothing visible shows one muted sentence and no action", () => {
  const html = renderToStaticMarkup(createElement(EmptyState, { text: messages.findImages.empty }));
  expect(html).toBe('<div class="empty-state"><p>There are no images to show yet.</p></div>');
});

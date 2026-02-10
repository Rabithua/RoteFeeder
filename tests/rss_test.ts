import { assertEquals } from "jsr:@std/assert";
import { fetchFeed } from "../src/core/rss.ts";

Deno.test("fetchFeed should parsing RSS", async () => {
  // We can mock fetch slightly or given we are in a verification phase,
  // we can use a live URL if network is allowed, OR better, mock it.
  // For now I'll trust the code structure but I'll write a simple test that mocks fetch.

  const originalFetch = globalThis.fetch;

  globalThis.fetch = async () =>
    new Response(`
    <rss version="2.0">
      <channel>
        <title>Test Feed</title>
        <item>
          <title>Test Item</title>
          <link>http://example.com/1</link>
          <guid>1</guid>
        </item>
      </channel>
    </rss>
  `);

  try {
    const items = await fetchFeed("http://example.com/rss");
    assertEquals(items.length, 1);
    assertEquals(items[0].title, "Test Item");
    assertEquals(items[0].guid, "1");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

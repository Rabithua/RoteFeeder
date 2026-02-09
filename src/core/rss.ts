import { parse } from "xml";
import type { FeedItem } from "../types.ts";
import * as log from "@std/log";

export async function fetchFeed(url: string): Promise<FeedItem[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      log.error(
        `Failed to fetch feed ${url}: ${response.status} ${response.statusText}`,
      );
      return [];
    }

    const xml = await response.text();
    // deno-lint-ignore no-explicit-any
    const data = parse(xml) as any;
    const items: FeedItem[] = [];

    // Handle RSS 2.0
    if (data.rss?.channel?.item) {
      const rssItems = Array.isArray(data.rss.channel.item)
        ? data.rss.channel.item
        : [data.rss.channel.item];

      for (const item of rssItems) {
        items.push({
          title: item.title,
          link: item.link,
          pubDate: item.pubDate ? new Date(item.pubDate) : undefined,
          content: item.description || item["content:encoded"],
          guid: String(item.guid?.["#text"] || item.guid || item.link),
        });
      }
    }
    // Handle Atom
    else if (data.feed?.entry) {
      const entries = Array.isArray(data.feed.entry)
        ? data.feed.entry
        : [data.feed.entry];

      for (const entry of entries) {
        // Atom links can be complex, verify structure
        let link = "";
        if (Array.isArray(entry.link)) {
          const relAlt = entry.link.find((l: any) => l["@rel"] === "alternate");
          link = relAlt ? relAlt["@href"] : entry.link[0]["@href"];
        } else if (entry.link) {
          link = entry.link["@href"];
        }

        items.push({
          title: entry.title?.["#text"] || entry.title,
          link: link,
          pubDate: entry.updated
            ? new Date(entry.updated)
            : entry.published
              ? new Date(entry.published)
              : undefined,
          content:
            entry.content?.["#text"] ||
            entry.content ||
            entry.summary?.["#text"] ||
            entry.summary,
          guid: String(entry.id),
        });
      }
    }

    return items;
  } catch (error) {
    log.error(`Error parsing feed ${url}: ${error}`);
    return [];
  }
}

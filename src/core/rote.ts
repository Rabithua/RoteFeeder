import type { RoteConfig, FeedItem } from "../types.ts";
import * as log from "@std/log";

function stripHtml(html: string): string {
  if (!html) return "";
  let text = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, ""); // Strip other tags

  // Basic entity decoding
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&hellip;/g, "...");

  return text.replace(/\n\s*\n/g, "\n").trim();
}

export async function pushToRote(
  config: RoteConfig,
  item: FeedItem,
  feedName: string,
): Promise<boolean> {
  const url = `${config.api_base}/v2/api/openkey/notes`;

  // Construct content
  let content = stripHtml(item.content || item.title);
  content += `\n\n${item.link}`;

  // Truncate if necessary (Rote limit is 1,000,000 chars, usually fine)

  const validTags = config.default_tags
    ? [...config.default_tags]
    : ["RoteFeeder", "RSS"];
  if (config.append_source_tag !== false) {
    validTags.push(feedName);
  }

  const payload = {
    openkey: config.openkey,
    content: content,
    title: item.title,
    tags: validTags,
    source: item.link,
    type: "rote",
    ...(config.state !== undefined && {
      state:
        config.state === "public" || config.state === "private"
          ? config.state
          : String(config.state), // 确保其他值都是字符串类型
    }),
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      log.error(`Failed to push to Rote: ${response.status} - ${errorText}`);
      return false;
    }

    const data = await response.json();
    if (data.code !== 0) {
      log.error(`Rote API Error: ${data.message}`);
      return false;
    }

    log.info(`Successfully pushed: ${item.title}`);
    return true;
  } catch (e) {
    log.error(`Network error pushing to Rote: ${e}`);
    return false;
  }
}

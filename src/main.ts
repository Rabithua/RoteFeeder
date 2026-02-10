import { loadConfig } from "./config.ts";
import { fetchFeed } from "./core/rss.ts";
import { isSeen, markSeen } from "./core/dedupe.ts";
import { pushToRote } from "./core/rote.ts";
import * as log from "@std/log";

// Setup logging with timestamp
const formatter = (record: log.LogRecord) => {
  const timestamp = new Date().toISOString().replace("T", " ").replace("Z", "");
  return `[${timestamp}] [${record.levelName}] ${record.msg}`;
};

log.setup({
  handlers: {
    console: new log.ConsoleHandler("INFO", { formatter }),
  },
  loggers: {
    default: {
      level: "INFO",
      handlers: ["console"],
    },
  },
});

async function runSync() {
  log.info("Starting sync run...");
  const config = await loadConfig();

  // Print detailed configuration info
  log.info(`=== Configuration ===`);
  log.info(`API Base: ${config.rote.api_base}`);
  log.info(`OpenKey: ${config.rote.openkey.slice(0, 8)}...`); // Masked for security
  log.info(`State: ${config.rote.state || "default"}`);
  log.info(`Append Source Tag: ${config.rote.append_source_tag}`);
  log.info(
    `Default Tags: ${JSON.stringify(config.rote.default_tags || ["RoteFeeder", "RSS"])}`,
  );
  log.info(`Feeds Count: ${config.feeds.length}`);
  log.info(`Feeds: ${JSON.stringify(config.feeds.map((f) => f.name))}`);
  if (config.scheduler?.cron) {
    log.info(`Cron Schedule: ${config.scheduler.cron}`);
  }
  log.info(`====================`);

  const _results = await Promise.allSettled(
    config.feeds.map(async (feed) => {
      log.info(`Fetching feed: ${feed.name}`);
      try {
        const items = await fetchFeed(feed.url);

        let newCount = 0;
        for (const item of items) {
          if (!item.guid) continue;

          const seen = await isSeen(item.guid);
          if (seen) continue;

          log.info(`New item found: ${item.title}`);
          const success = await pushToRote(config.rote, item, feed.name);

          if (success) {
            await markSeen(item.guid);
            newCount++;
          }
        }

        if (newCount === 0) {
          log.info(`No new items for ${feed.name}`);
        } else {
          log.info(`Synced ${newCount} items for ${feed.name}`);
        }
      } catch (e) {
        log.error(`Error processing feed ${feed.name}: ${e}`);
      }
    }),
  );

  log.info("Sync run complete.");
}

// Main execution
if (import.meta.main) {
  const config = await loadConfig();

  // Initial Run
  await runSync();

  // Schedule if cron is configured
  if (config.scheduler?.cron) {
    log.info(`Scheduling cron job: ${config.scheduler.cron}`);
    Deno.cron("RoteFeeder Sync", config.scheduler.cron, () => {
      return runSync();
    });
  } else {
    log.info("No cron schedule configured. Exiting after single run.");
  }
}

import { loadConfig } from "./config.ts";
import { fetchFeed } from "./core/rss.ts";
import { isSeen, markSeen } from "./core/dedupe.ts";
import { pushToRote } from "./core/rote.ts";
import * as log from "@std/log";

// Setup logging
log.setup({
  handlers: {
    console: new log.ConsoleHandler("INFO"),
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

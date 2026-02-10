import { parse as parseYaml } from "@std/yaml";
import type { AppConfig } from "./types.ts";

export async function loadConfig(
  path: string = "config.yaml",
): Promise<AppConfig> {
  // First try to load config from environment variables
  const envConfig = loadFromEnv();
  if (envConfig) {
    return envConfig;
  }

  // If environment variable config is incomplete, try to load from config file
  try {
    const text = await Deno.readTextFile(path);
    const config = parseYaml(text) as AppConfig;

    // Basic validation
    if (!config.rote?.api_base || !config.rote?.openkey) {
      throw new Error("Missing 'rote' configuration in config.yaml");
    }
    if (!config.feeds || !Array.isArray(config.feeds)) {
      throw new Error("Missing 'feeds' list in config.yaml");
    }

    return config;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      console.error(`Config file not found: ${path}`);
      console.error(
        "Please copy config.example.yaml to config.yaml and edit it, or use environment variables for configuration.",
      );
      Deno.exit(1);
    }
    throw error;
  }
}

function loadFromEnv(): AppConfig | null {
  const apiBase = Deno.env.get("ROTE_API_BASE");
  const openkey = Deno.env.get("ROTE_OPENKEY");
  const feedsStr = Deno.env.get("ROTE_FEEDS");

  // Check if key configuration items exist
  if (!apiBase || !openkey || !feedsStr) {
    return null;
  }

  try {
    // 尝试解析配置值，先尝试 JSON，再尝试 YAML
    const parseValue = (value: string) => {
      try {
        return JSON.parse(value);
      } catch {
        try {
          return parseYaml(value);
        } catch {
          return value;
        }
      }
    };

    const feeds = parseValue(feedsStr);

    const config: AppConfig = {
      rote: {
        api_base: apiBase,
        openkey: openkey,
        append_source_tag: Deno.env.get("ROTE_APPEND_SOURCE_TAG") === "true",
        default_tags: Deno.env.get("ROTE_DEFAULT_TAGS")
          ? parseValue(Deno.env.get("ROTE_DEFAULT_TAGS")!)
          : ["RoteFeeder", "RSS"],
        state: (() => {
          const stateValue = Deno.env.get("ROTE_STATE");
          if (stateValue === "public" || stateValue === "private") {
            return stateValue;
          }
          const numState = Number(stateValue);
          if (!isNaN(numState)) {
            return numState;
          }
          return "public"; // 默认值
        })(),
      },
      feeds: feeds,
    };

    const cron = Deno.env.get("ROTE_CRON");
    if (cron) {
      config.scheduler = { cron };
    }

    // 验证配置
    if (!Array.isArray(config.feeds) || config.feeds.length === 0) {
      return null;
    }

    return config;
  } catch (error) {
    console.error("Error parsing configuration from environment variables:", error);
    return null;
  }
}

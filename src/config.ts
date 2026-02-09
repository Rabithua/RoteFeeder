import { parse as parseYaml } from "@std/yaml";
import type { AppConfig } from "./types.ts";

export async function loadConfig(
  path: string = "config.yaml",
): Promise<AppConfig> {
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
        "Please copy config.example.yaml to config.yaml and edit it.",
      );
      Deno.exit(1);
    }
    throw error;
  }
}

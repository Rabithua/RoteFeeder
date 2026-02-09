export interface RoteConfig {
  api_base: string;
  openkey: string;
  append_source_tag?: boolean;
  default_tags?: string[];
}

export interface FeedConfig {
  name: string;
  url: string;
}

export interface SchedulerConfig {
  cron: string;
}

export interface AppConfig {
  rote: RoteConfig;
  feeds: FeedConfig[];
  scheduler?: SchedulerConfig;
}

export interface FeedItem {
  title: string;
  link: string;
  pubDate?: Date;
  content?: string;
  guid?: string;
}

<p align="right">English | <a href="README.zh.md">中文</a></p>

<p align="left">
  <img src="assets/RoteFeeder_logo.svg" alt="RoteFeeder Logo" width="400">
</p>

A Deno-based service that periodically fetches RSS feeds and forwards them to Rote via the OpenKey interface.

## Features

- **RSS/Atom Support**: Fetches content from standard feeds.
- **Deduplication**: Uses DenoKV to prevent sending duplicate items.
- **Configurable**: Manage feeds and API credentials via `config.yaml`.
- **Cron Scheduling**: Built-in scheduler to run tasks periodically.

## Usage

### Configuration Methods

RoteFeeder supports two configuration methods:

#### Method 1: Environment Variables (Recommended)

Supports configuration using Docker Compose environment variables. Here are the available environment variables:

| Environment Variable   | Description                        | Default Value         |
| ---------------------- | ---------------------------------- | --------------------- |
| ROTE_API_BASE          | Rote API Base URL                  | -                     |
| ROTE_OPENKEY           | Rote OpenKey                       | -                     |
| ROTE_STATE             | Note state ("public" or "private") | "public"              |
| ROTE_APPEND_SOURCE_TAG | Whether to append source tag       | true                  |
| ROTE_DEFAULT_TAGS      | Default tags (JSON array)          | ["RoteFeeder", "RSS"] |
| ROTE_FEEDS             | Feed list (JSON array)             | -                     |
| ROTE_CRON              | Scheduled task expression (Cron)   | -                     |

**Optimized Configuration**: Now supports using YAML native syntax for arrays and objects, avoiding JSON string escaping issues, making configuration more elegant and readable.

Example (Docker Compose - YAML Native Syntax):

```yaml
services:
  rote-feeder:
    image: ghcr.io/rabithua/rotefeeder:latest
    user: "0:0"
    environment:
      ROTE_API_BASE: "https://api.rote.ink"
      ROTE_OPENKEY: "your_openkey_here"
      ROTE_STATE: "public"
      ROTE_APPEND_SOURCE_TAG: "true"
      # Using YAML native list syntax
      ROTE_DEFAULT_TAGS: >-
        - RoteFeeder
        - RSS
      # Using YAML native array and object syntax
      ROTE_FEEDS: >-
        - name: "Hacker News"
          url: "https://hnrss.org/newest?points=100"
        - name: "Design Fragments"
          url: "https://df.fenx.work/rss/all"
        - name: "Fatbobman's Blog"
          url: "https://fatbobman.com/rss.xml"
        - name: "月球背面"
          url: "https://moonvy.com/blog/rss.xml"
      ROTE_CRON: "*/10 * * * *"
    volumes:
      - denokv:/app/denokv
    restart: unless-stopped

volumes:
  denokv:
```

#### Method 2: Configuration File

Copy `config.example.yaml` to `config.yaml` and edit it.

```yaml
rote:
  api_base: "https://api.rote.ink"
  openkey: "your_openkey_here"
  state: "public" # Optional: "public" or "private" (default: public)

feeds:
  - name: "Hacker News"
    url: "https://hnrss.org/newest"
```

### Running the Service

```bash
deno task start
```

## Development

```bash
deno task dev
```

## Docker Deployment

1.  **Configure**:
    Ensure `config.yaml` is present in the project root with your desired configuration.
    The database is persisted in a Docker named volume `denokv` by default.
    Compose runs the container as root (`user: "0:0"`) so `Deno.openKv("./denokv/dedupe.db")` can always initialize on fresh volumes.
    If you remove `user: "0:0"` and run as `deno` user, ensure the host directory is writable by container user `1000:1000`.

2.  **Run with Docker Compose**:

    The `docker-compose.yml` is configured to pull the latest image from GitHub Container Registry.

    ```bash
    docker compose up -d
    ```

    To rebuild and run locally:

    ```bash
    docker compose -f docker-compose.build.yml up -d --build
    ```

    To view logs:

    ```bash
    docker compose logs -f
    ```

    To stop the service:

    ```bash
    docker compose down
    ```

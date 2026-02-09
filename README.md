# RoteFeeder

A Deno-based service that periodically fetches RSS feeds and forwards them to Rote via the OpenKey interface.

## Features

- **RSS/Atom Support**: Fetches content from standard feeds.
- **Deduplication**: Uses DenoKV to prevent sending duplicate items.
- **Configurable**: Manage feeds and API credentials via `config.yaml`.
- **Cron Scheduling**: Built-in scheduler to run tasks periodically.

## Usage

1.  **Configure**:
    Copy `config.example.yaml` to `config.yaml` and edit it.

    ```yaml
    rote:
      api_base: "https://api.rote.app"
      openkey: "your_openkey_here"
      state: "public" # Optional: "public" or "private" (default: private/archived depending on system)

    feeds:
      - name: "Hacker News"
        url: "https://hnrss.org/newest"
    ```

2.  **Run**:

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
    The database will be persisted in the `./denokv` directory.

2.  **Run with Docker Compose**:

    The `docker-compose.yml` is configured to pull the latest image from GitHub Container Registry.

    ```bash
    docker compose up -d
    ```

    To build locally:

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

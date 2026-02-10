# RoteFeeder

A Deno-based service that periodically fetches RSS feeds and forwards them to Rote via the OpenKey interface.

## Features

- **RSS/Atom Support**: Fetches content from standard feeds.
- **Deduplication**: Uses DenoKV to prevent sending duplicate items.
- **Configurable**: Manage feeds and API credentials via `config.yaml`.
- **Cron Scheduling**: Built-in scheduler to run tasks periodically.

## Usage

### 配置方式

RoteFeeder 支持两种配置方式：

#### 方式一：配置文件 (推荐)

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

#### 方式二：环境变量

支持使用 Docker Compose 的环境变量进行配置。以下是可用的环境变量：

| 环境变量               | 说明                             | 默认值                |
| ---------------------- | -------------------------------- | --------------------- |
| ROTE_API_BASE          | Rote API 基础 URL                | -                     |
| ROTE_OPENKEY           | Rote OpenKey                     | -                     |
| ROTE_STATE             | 笔记状态 ("public" 或 "private") | "public"              |
| ROTE_APPEND_SOURCE_TAG | 是否追加源标签                   | true                  |
| ROTE_DEFAULT_TAGS      | 默认标签 (JSON 数组)             | ["RoteFeeder", "RSS"] |
| ROTE_FEEDS             | 订阅源列表 (JSON 数组)           | -                     |
| ROTE_CRON              | 定时任务表达式 (Cron 格式)       | -                     |

**优化配置**：现在支持使用 YAML 原生语法配置数组和对象，避免了 JSON 字符串转义问题，使配置更加优雅易读。

示例（Docker Compose - YAML 原生语法）：

```yaml
services:
  rote-feeder:
    image: ghcr.io/rabithua/rotefeeder:latest
    environment:
      ROTE_API_BASE: "https://api.rote.ink"
      ROTE_OPENKEY: "your_openkey_here"
      ROTE_STATE: "public"
      ROTE_APPEND_SOURCE_TAG: "true"
      # 使用 YAML 原生列表语法
      ROTE_DEFAULT_TAGS: >-
        - RoteFeeder
        - RSS
      # 使用 YAML 原生数组和对象语法
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
      - ./denokv:/app/denokv
    restart: unless-stopped
```

### 运行方式

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

<p align="right"><a href="README.md">English</a> | 中文</p>

# RoteFeeder

一个基于 Deno 的服务，定期获取 RSS 订阅源并通过 OpenKey 接口转发到 Rote。

## 功能特性

- **RSS/Atom 支持**: 从标准订阅源获取内容。
- **去重机制**: 使用 DenoKV 防止发送重复条目。
- **可配置性**: 通过 `config.yaml` 管理订阅源和 API 凭据。
- **定时任务**: 内置调度器定期运行任务。

## 使用方法

### 配置方式

RoteFeeder 支持两种配置方式：

#### 方式一：环境变量 (推荐)

支持使用 Docker Compose 的环境变量进行配置。以下是可用的环境变量：

| 环境变量               | 说明                             | 默认值                |
|------------------------|----------------------------------|-----------------------|
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

#### 方式二：配置文件

将 `config.example.yaml` 复制为 `config.yaml` 并进行编辑。

```yaml
rote:
  api_base: "https://api.rote.ink"
  openkey: "your_openkey_here"
  state: "public" # 可选: "public" 或 "private" (默认: public)

feeds:
  - name: "Hacker News"
    url: "https://hnrss.org/newest"
```

### 运行方式

```bash
deno task start
```

## 开发

```bash
deno task dev
```

## Docker 部署

1.  **配置**:
    确保项目根目录存在 `config.yaml` 并包含您的配置。
    数据库将持久化存储在 `./denokv` 目录中。

2.  **使用 Docker Compose 运行**:

    `docker-compose.yml` 配置为从 GitHub Container Registry 拉取最新镜像。

    ```bash
    docker compose up -d
    ```

    要本地重建和运行：

    ```bash
    docker compose -f docker-compose.build.yml up -d --build
    ```

    查看日志：

    ```bash
    docker compose logs -f
    ```

    停止服务：

    ```bash
    docker compose down
    ```

FROM denoland/deno:alpine

# The port that your application listens to.
# EXPOSE 1993

WORKDIR /app
RUN chown -R deno:deno /app

# Prefer not to run as root.
USER deno

# Cache the dependencies as a layer (the following two steps are re-run only when deps.ts or deno.lock changes).
# These steps are not strictly necessary as they will be cached by the next step,
# but they help to avoid re-downloading dependencies when source code changes.
COPY --chown=deno:deno deno.json deno.lock ./
RUN deno install

# These steps will be re-run upon each file change in your working directory:
COPY --chown=deno:deno src ./src
COPY --chown=deno:deno config.example.yaml ./

# Compile the main app so that it doesn't need to be compiled each startup/entry.
RUN deno cache src/main.ts

CMD ["task", "start"]

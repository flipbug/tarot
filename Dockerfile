# The Moonlit Grimoire is a fully prerendered SvelteKit site (adapter-static),
# so we build it with bun and serve the static output with nginx — lighter and
# cheaper than a Node server.

# ---- build the static site ----
FROM oven/bun:1.3-alpine AS build
WORKDIR /app

# Don't let the playwright devDependency pull browsers during install.
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

COPY package.json bun.lock ./
RUN bun install

COPY . .
RUN bun run build

# ---- serve the prerendered output ----
FROM nginx:1.27-alpine AS serve
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

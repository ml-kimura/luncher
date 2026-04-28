ARG VARIANT=24.14-bookworm-slim
FROM node:${VARIANT} AS atlas-base

ARG ATLAS_VERSION
ARG GITLEAKS_VERSION
ARG PLAYWRIGHT_VERSION
ARG POSTGRES_VERSION

ENV DEBIAN_FRONTEND=noninteractive 
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
ENV PLAYWRIGHT_BROWSERS_PATH=/workspace/.cache/playwright
ENV TURBO_TELEMETRY_DISABLED=1
ENV NEXT_TELEMETRY_DISABLED=1
ENV STORYBOOK_DISABLE_TELEMETRY=true
ENV TZ=Asia/Tokyo 
ENV LANG=ja_JP.UTF-8
ENV LC_ALL=ja_JP.UTF-8

SHELL ["/bin/bash", "-c"]

# For Node 25 and later: assume Corepack is not bundled, so install it explicitly.
# Let the version be resolved from `packageManager` in /workspace/package.json.
#
# Install Atlas CLI and minimum required runtime packages.
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      bash \
      tzdata \
      locales \
      curl \
      ca-certificates \
 && sed -i '/ja_JP.UTF-8/s/^# //g' /etc/locale.gen \
 && locale-gen \
 && curl -sSf https://atlasgo.sh | sh -s -- --community \
 && rm -rf /var/lib/apt/lists/*

# Workspace image extends atlas-base with full development tooling.
FROM atlas-base AS workspace

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
    postgresql-common \
 && YES=yes /usr/share/postgresql-common/pgdg/apt.postgresql.org.sh \
 && apt-get update \
 && apt-get install -y --no-install-recommends \
    sudo \
    openssh-client \
    git \
    vim \
    fonts-noto-cjk \
    tar \
    postgresql-client-${POSTGRES_VERSION} \
 && printf '%s\n' \
    'set encoding=utf-8' \
    'set fileencoding=utf-8' \
    'set fileencodings=utf-8,cp932' \
    'set ts=2 sw=2 et ru nu' \
    >> /etc/vim/vimrc.local \
 && usermod -aG sudo node \
 && echo "node ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/node \
 && chmod 0440 /etc/sudoers.d/node \
 && npm install -g corepack \
 && corepack enable \
 && npm install -g playwright@${PLAYWRIGHT_VERSION} \
 && playwright install-deps chromium \
 && ARCH="$(dpkg --print-architecture)" \
 && case "$ARCH" in \
      amd64) GITLEAKS_ARCH=x64 ;; \
      arm64) GITLEAKS_ARCH=arm64 ;; \
      *) echo "gitleaks: unsupported architecture: $ARCH" >&2; exit 1 ;; \
    esac \
 && GITLEAKS_VER="${GITLEAKS_VERSION#v}" \
 && curl -fsSL "https://github.com/gitleaks/gitleaks/releases/download/${GITLEAKS_VERSION}/gitleaks_${GITLEAKS_VER}_linux_${GITLEAKS_ARCH}.tar.gz" -o /tmp/gitleaks.tgz \
 && tar -xzf /tmp/gitleaks.tgz -C /usr/local/bin gitleaks \
 && chmod +x /usr/local/bin/gitleaks \
 && rm -f /tmp/gitleaks.tgz \
 && rm -rf /var/lib/apt/lists/*

USER node
RUN echo "set -o vi" >> ~/.bashrc

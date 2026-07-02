#!/bin/sh
set -e

# Nitro's c12 config scanner does lstatSync('.config/nitro') at startup.
# If .config is a FILE (not a directory) this crashes with ENOTDIR.
# Fix: run nuxt from /nuxt-workspace which mirrors /app via symlinks, excluding .config.
# c12 finds no .config at cwd -> skips gracefully.
if [ -f /app/.config ]; then
    mkdir -p /nuxt-workspace
    # Copy config into public/ so nuxt dev server serves it at /.config
    cp /app/.config /app/public/.config
    # Symlink everything from /app except .config
    find /app -maxdepth 1 -mindepth 1 ! -name '.config' | while IFS= read -r item; do
        ln -sf "$item" "/nuxt-workspace/$(basename "$item")"
    done
    cd /nuxt-workspace
fi

exec "$@"

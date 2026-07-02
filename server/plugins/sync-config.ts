import { existsSync, copyFileSync, statSync, watch } from 'node:fs'
import { join } from 'node:path'

export default defineNitroPlugin(() => {
  // In Docker dev the entrypoint runs nuxt from /nuxt-workspace (no .config there).
  // Read from /app/.config directly; write to public/.config which nuxt dev serves at /.config.
  // In local dev (no .config at root) this is a no-op.
  const src = existsSync('/app/.config') && statSync('/app/.config').isFile()
    ? '/app/.config'
    : join(process.cwd(), '.config')

  const dest = join(process.cwd(), 'public', '.config')

  const sync = () => {
    try {
      if (existsSync(src) && statSync(src).isFile()) copyFileSync(src, dest)
    } catch {}
  }

  sync()
  try {
    if (existsSync(src)) watch(src, { persistent: false }, sync)
  } catch {}
})

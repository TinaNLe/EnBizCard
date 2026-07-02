// Eagerly load all SVG icons as raw strings at build time.
// Path is relative to this file (app/composables/ → app/assets/icons/).
const svgModules = import.meta.glob('../assets/icons/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

function randomStr(len: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  return Array.from({ length: len }, () =>
    chars[Math.floor(Math.random() * chars.length)],
  ).join('')
}

export function useIcons() {
  function getIcon(name: string): string {
    const key = Object.keys(svgModules).find((k) => k.endsWith(`/${name}.svg`))
    return key ? svgModules[key] : ''
  }

  function getSVG(item: { icon: string; gradientIcon?: boolean | number }): string {
    let svg = getIcon(item.icon)
    if (item.gradientIcon && svg) {
      for (let i = 1; i < 10; i++) {
        const regex = new RegExp(`gradient${i}`, 'g')
        if (regex.test(svg)) svg = svg.replace(regex, randomStr(7))
        else break
      }
    }
    return svg
  }

  return { getIcon, getSVG }
}

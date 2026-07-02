const theme = useState<number>('theme', () => 1)

export function useTheme() {
  function changeTheme(value: number) {
    theme.value = value
  }
  return { theme, changeTheme }
}

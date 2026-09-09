export function projectSlug(name: string): string {
  return name.trim().toLowerCase().replaceAll(" ", "-")
}

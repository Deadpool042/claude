export function splitCamelCase(value: string): string {
  return value.replace(/([a-z])([A-Z])/g, "$1 $2");
}

export function capitalizeFirst(value: string): string {
  return value.replace(/^./, (s) => s.toUpperCase());
}

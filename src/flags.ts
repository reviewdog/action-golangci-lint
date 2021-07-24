export function parse(flags: string): string[] {
  flags = flags.trim();
  if (flags === '') {
    return [];
  }

  // TODO: need to simulate bash?
  return flags.split(/\s+/);
}

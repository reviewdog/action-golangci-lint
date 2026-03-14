export function parse(flags) {
    flags = flags.trim();
    if (flags === "") {
        return [];
    }
    // TODO: need to simulate bash?
    return flags.split(/\s+/);
}

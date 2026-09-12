export {};

// The Screeps: Arena sandbox exposes a console global with no bundled type
// declarations, so it's declared here for use across every arena.
declare global {
  const console: {
    log(...args: unknown[]): void;
    warn(...args: unknown[]): void;
    error(...args: unknown[]): void;
    info(...args: unknown[]): void;
  };
}

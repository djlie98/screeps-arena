export const QueueSpawnerState = {
  SPAWN: "SPAWN",
} as const;
export type QueueSpawnerState =
  (typeof QueueSpawnerState)[keyof typeof QueueSpawnerState];

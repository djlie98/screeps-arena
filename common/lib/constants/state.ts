import { AttackerState } from "common/objects/states/attacker-state";
import { HarvesterState } from "common/objects/states/harvest-state";
import { HealerState } from "common/objects/states/healer-state";
import { QueueSpawnerState } from "common/objects/states/queue-spawner-state";

export const BaseState = {
  IDLE: "IDLE",
} as const;

export const State = {
  ...BaseState,
  ...AttackerState,
  ...HarvesterState,
  ...HealerState,
  ...QueueSpawnerState,
} as const;
export type State = (typeof State)[keyof typeof State];

import { Handler, StateMachine } from "../lib/states/state-machine";
import { AttackerState } from "./creep/attacker";
import { HarvesterState } from "./creep/harvester";
import { HealerState } from "./creep/healer";
import { QueueSpawnerState } from "./spawner/queue-spawner";

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

export class Unit<T> {
  unit: T;
  machine = new StateMachine();

  constructor(unit: T, handlers: Array<Handler<T>>) {
    this.unit = unit;

    handlers.forEach((handler) => {
      this.machine.registerHandler(handler);
    });
  }

  run() {
    this.machine.handle(this);
  }

  overrideState(state: State) {
    this.machine.currentState = state;
  }
}

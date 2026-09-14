import { Creep } from "game/prototypes";
import { BaseSpawner } from "../spawn";

export const QueueSpawnerState = {
  SPAWN: "SPAWN",
} as const;
export type QueueSpawnerState =
  (typeof QueueSpawnerState)[keyof typeof QueueSpawnerState];

export class QueueSpawner extends BaseSpawner {
  queue?: Array<Creep>;

  fetus?: Creep;
}

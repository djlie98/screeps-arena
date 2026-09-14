import { Creep, StructureSpawn } from "game/prototypes";
import { BaseSpawner } from "../spawn";
import { BaseCreep } from "../creep";
import { SpawnHandler } from "common/lib/states/handlers/spawner/spawn-handler";
import { BodyPartType } from "game/prototypes/creep";

const handlers = [new SpawnHandler()];

export const QueueSpawnerState = {
  SPAWN: "SPAWN",
} as const;
export type QueueSpawnerState =
  (typeof QueueSpawnerState)[keyof typeof QueueSpawnerState];

export interface CreepQueueItem {
  desiredBodies: Array<BodyPartType>;
  roleCreator: new (c: Creep) => BaseCreep;
  creep?: Creep;
}

interface CreepConstructor {
  new (creep: Creep): BaseCreep;
  desiredBodies: Array<BodyPartType>;
}

export const queueSpawnerFactory = (
  creeps: Array<CreepConstructor>,
): Array<CreepQueueItem> => {
  return creeps.map(
    (c): CreepQueueItem => ({
      desiredBodies: c.desiredBodies,
      roleCreator: c,
    }),
  );
};

export class QueueSpawner extends BaseSpawner {
  queue?: Array<CreepQueueItem>;

  fetus?: CreepQueueItem;

  constructor(spawner: StructureSpawn) {
    super(spawner, handlers);
  }
}

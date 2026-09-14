import { Creep, StructureSpawn } from "game/prototypes";
import { BaseCreep } from "../creep";
import { HarvestHandler } from "common/lib/states/handlers/creep/harvester/harvest-handler";
import { StoreHandler } from "common/lib/states/handlers/creep/harvester/store-handler";
import { CARRY, MOVE, WORK } from "game/constants";

const handlers = [new HarvestHandler(), new StoreHandler()];

export const HarvesterState = {
  HARVEST: "HARVEST",
  STORE: "STORE",
} as const;
export type HarvesterState =
  (typeof HarvesterState)[keyof typeof HarvesterState];

export class Harvester extends BaseCreep {
  storeTarget?: StructureSpawn;

  constructor(creep: Creep) {
    super(creep, handlers);

    Harvester.desiredBodies = [MOVE, WORK, CARRY];
  }

  isFull(): boolean {
    return this.unit.store.getFreeCapacity() === 0;
  }

  isEmpty(): boolean {
    return this.unit.store.getUsedCapacity() === 0;
  }
}

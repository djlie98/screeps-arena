import { Creep, StructureSpawn } from "game/prototypes";
import { BaseCreep } from "../creep";
import { HarvestHandler } from "common/lib/states/handlers/creep/harvester/harvest-handler";
import { StoreHandler } from "common/lib/states/handlers/creep/harvester/store-handler";
import { CARRY, MOVE, WORK } from "game/constants";
import { State } from "common/lib/constants/state";
import { BodyPartType } from "game/prototypes/creep";

const handlers = [new HarvestHandler(), new StoreHandler()];

export class Harvester extends BaseCreep {
  static desiredBodies: Array<BodyPartType> = [MOVE, WORK, CARRY];
  storeTarget?: StructureSpawn;

  constructor(creep: Creep) {
    super(creep, handlers);

    this.machine.currentState = State.HARVEST;
  }

  isFull(): boolean {
    return this.unit.store.getFreeCapacity() === 0;
  }

  isEmpty(): boolean {
    return this.unit.store.getUsedCapacity() === 0;
  }
}

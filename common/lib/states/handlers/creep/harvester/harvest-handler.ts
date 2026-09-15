import { State } from "common/lib/constants/state";
import { Handler } from "common/lib/states/state-machine";
import { Harvester } from "common/objects/creep/harvester";
import { ERR_NOT_IN_RANGE, RESOURCE_ENERGY } from "game/constants";
import { Creep, StructureContainer } from "game/prototypes";
import { getObjectsByPrototype } from "game/utils";

export class HarvestHandler implements Handler<Creep> {
  state: State = State.HARVEST;

  run(unit: Harvester): void {
    const containers = getObjectsByPrototype(StructureContainer);

    const closestContainer = unit.unit.findClosestByPath(containers);
    const err = unit.unit.withdraw(closestContainer, RESOURCE_ENERGY);
    if (closestContainer && err === ERR_NOT_IN_RANGE) {
      unit.unit.moveTo(closestContainer);
    }
  }

  getNextState(unit: Harvester): State {
    if (unit.isFull()) {
      return State.STORE;
    }
    return State.HARVEST;
  }
}

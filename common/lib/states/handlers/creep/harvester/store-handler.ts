import { Handler } from "common/lib/states/state-machine";
import { State } from "common/objects/base";
import { Harvester } from "common/objects/creep/harvester";
import { ERR_NOT_IN_RANGE, RESOURCE_ENERGY } from "game/constants";
import { Creep } from "game/prototypes";

export class StoreHandler implements Handler<Creep> {
  state: State = State.HARVEST;

  run(unit: Harvester) {
    if (
      unit.storeTarget &&
      unit.unit.transfer(unit.storeTarget, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE
    ) {
      unit.unit.moveTo(unit.storeTarget);
    }
  }

  getNextState(unit: Harvester): State {
    if (unit.isEmpty()) {
      return State.HARVEST;
    }
    return State.STORE;
  }
}

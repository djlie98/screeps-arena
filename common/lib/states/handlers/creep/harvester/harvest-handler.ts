import { Handler } from "common/lib/states/state-machine";
import { State } from "common/objects/base";
import { Harvester } from "common/objects/creep/harvester";
import { ERR_NOT_IN_RANGE } from "game/constants";
import { Creep, Source } from "game/prototypes";
import { getObjectsByPrototype } from "game/utils";

export class HarvestHandler implements Handler<Creep> {
  state: State = State.HARVEST;

  run(unit: Harvester): void {
    const sources = getObjectsByPrototype(Source);

    const closestSource = unit.unit.findClosestByPath(sources);
    const err = unit.unit.harvest(closestSource);
    if (closestSource && err === ERR_NOT_IN_RANGE) {
      unit.unit.moveTo(closestSource);
    }
  }

  getNextState(unit: Harvester): State {
    if (unit.isFull()) {
      return State.STORE;
    }
    return State.HARVEST;
  }
}

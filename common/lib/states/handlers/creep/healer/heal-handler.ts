import { ERR_NOT_IN_RANGE } from "game/constants";
import { Handler } from "../../../state-machine";
import { Creep } from "game/prototypes";
import { State } from "common/objects/base";
import { Healer } from "common/objects/creep/healer";

export class HealHandler implements Handler<Creep> {
  state = State.HEAL;

  getNextState(creep: Healer): State {
    if (!creep.healTarget || !creep.healTarget.exists) {
      return State.IDLE;
    }

    return State.HEAL;
  }

  run(creep: Healer): void {
    if (!creep.healTarget) {
      return;
    }

    if (creep.unit.heal(creep.healTarget) === ERR_NOT_IN_RANGE) {
      creep.unit.moveTo(creep.healTarget);
    }
  }
}

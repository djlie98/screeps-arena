import { ATTACK, ERR_NOT_IN_RANGE, RANGED_ATTACK } from "game/constants";
import { Handler } from "../../../state-machine";
import { Creep } from "game/prototypes";
import { Attacker } from "common/objects/creep/attacker";
import { State } from "common/lib/constants/state";

export class AttackHandler implements Handler<Creep> {
  state = State.ATTACK;

  getNextState(creep: Attacker): State {
    if (!creep.target || !creep.target.exists) {
      return State.IDLE;
    }

    return State.ATTACK;
  }

  run(creep: Attacker): void {
    if (!creep.target) {
      return;
    }

    if (creep.unit.body.some((bodyPart) => bodyPart.type === ATTACK)) {
      if (creep.unit.attack(creep.target) === ERR_NOT_IN_RANGE) {
        creep.unit.moveTo(creep.target);
      }
    }

    if (creep.unit.body.some((bodyPart) => bodyPart.type === RANGED_ATTACK)) {
      if (creep.unit.rangedAttack(creep.target) === ERR_NOT_IN_RANGE) {
        creep.unit.moveTo(creep.target);
      }
    }
  }
}

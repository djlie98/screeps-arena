import { Creep, GameObject } from "game/prototypes";
import { BaseCreep } from "../creep";
import { AttackHandler } from "common/lib/states/handlers/creep/attacker/attack-handler";
import { ATTACK, MOVE } from "game/constants";
import { State } from "common/lib/constants/state";
import { BodyPartType } from "game/prototypes/creep";

const handlers = [new AttackHandler()];

export class Attacker extends BaseCreep {
  static desiredBodies: Array<BodyPartType> = [MOVE, ATTACK];
  target?: GameObject;

  constructor(creep: Creep) {
    super(creep, handlers);

    this.machine.currentState = State.ATTACK;
  }
}

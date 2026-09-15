import { Creep } from "game/prototypes";
import { BaseCreep } from "../creep";
import { HealHandler } from "common/lib/states/handlers/creep/healer/heal-handler";
import { HEAL, MOVE } from "game/constants";
import { State } from "common/lib/constants/state";
import { BodyPartType } from "game/prototypes/creep";

const handlers = [new HealHandler()];

export class Healer extends BaseCreep {
  static desiredBodies: Array<BodyPartType> = [MOVE, HEAL];
  healTarget?: Creep;

  constructor(creep: Creep) {
    super(creep, handlers);

    this.machine.currentState = State.HEAL;
  }
}

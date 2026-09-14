import { Creep, GameObject } from "game/prototypes";
import { BaseCreep } from "../creep";
import { AttackHandler } from "common/lib/states/handlers/creep/attacker/attack-handler";
import { ATTACK, MOVE } from "game/constants";

const handlers = [new AttackHandler()];

export const AttackerState = {
  ATTACK: "ATTACK",
} as const;
export type AttackerState = (typeof AttackerState)[keyof typeof AttackerState];

export class Attacker extends BaseCreep {
  target?: GameObject;

  constructor(creep: Creep) {
    super(creep, handlers);

    Attacker.desiredBodies = [MOVE, ATTACK];
  }
}

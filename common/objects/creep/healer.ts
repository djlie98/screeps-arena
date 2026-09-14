import { Creep } from "game/prototypes";
import { BaseCreep } from "../creep";
import { HealHandler } from "common/lib/states/handlers/creep/healer/heal-handler";
import { HEAL, MOVE } from "game/constants";

const handlers = [new HealHandler()];

export const HealerState = {
  HEAL: "HEAL",
} as const;
export type HealerState = (typeof HealerState)[keyof typeof HealerState];

export class Healer extends BaseCreep {
  healTarget?: Creep;

  constructor(creep: Creep) {
    super(creep, handlers);

    Healer.desiredBodies = [MOVE, HEAL];
  }
}

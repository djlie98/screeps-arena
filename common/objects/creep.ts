import { Creep } from "game/prototypes";
import { Unit } from "./base";
import { BodyPartType } from "game/prototypes/creep";

export class BaseCreep extends Unit<Creep> {
  static desiredBodies: Array<BodyPartType> = [];
}

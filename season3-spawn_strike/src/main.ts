import { getObjectsByPrototype } from "game/utils";
import { ATTACK, MOVE } from "game/constants";
import { Creep, StructureSpawn } from "game/prototypes";

let attacker: Creep | undefined;

export function loop(): void {
  if (!attacker) {
    const mySpawn = getObjectsByPrototype(StructureSpawn).find((s) => s.my);
    attacker = mySpawn?.spawnCreep([MOVE, ATTACK]).object;
    return;
  }

  const enemySpawn = getObjectsByPrototype(StructureSpawn).find((s) => !s.my);
  if (!enemySpawn) {
    return;
  }
  attacker.moveTo(enemySpawn);
  attacker.attack(enemySpawn);
}

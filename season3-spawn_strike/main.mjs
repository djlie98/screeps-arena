// shared/rush.ts
import { getObjectsByPrototype } from "game/utils";
import { ATTACK, MOVE } from "game/constants";
import { StructureSpawn } from "game/prototypes";
var attacker;
function runSpawnRush() {
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

// season3-spawn_strike/src/main.ts
function loop() {
  runSpawnRush();
}
export {
  loop
};

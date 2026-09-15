import { Global } from "common/lib/constants/global";
import { State } from "common/lib/constants/state";
import { Handler } from "common/lib/states/state-machine";
import { QueueSpawner } from "common/objects/spawner/queue-spawner";
import { StructureSpawn } from "game/prototypes";

export class SpawnHandler implements Handler<StructureSpawn> {
  state = State.SPAWN;

  run(unit: QueueSpawner): void {
    if (unit.fetus?.creep?.exists && !unit.unit.spawning) {
      const newUnit = new unit.fetus.roleCreator(unit.fetus.creep);

      Global.creeps.push(newUnit);
      unit.fetus = undefined;
    }

    if (!unit.fetus && unit.queue && unit.queue.length > 0) {
      unit.fetus = unit.queue.shift()!;
      unit.fetus.creep = unit.unit.spawnCreep(unit.fetus.desiredBodies).object;
    }

    if (unit.fetus && !unit.fetus.creep?.exists) {
      unit.fetus.creep = unit.unit.spawnCreep(unit.fetus.desiredBodies).object;
    }
  }

  getNextState(unit: QueueSpawner): State {
    if (unit.queue?.length === 0 && !unit.fetus) {
      return State.IDLE;
    }

    return State.SPAWN;
  }
}

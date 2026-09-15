import { StructureSpawn } from "game/prototypes";
import { getObjectsByPrototype } from "game/utils";
import {
  QueueSpawner,
  queueSpawnerFactory,
} from "common/objects/spawner/queue-spawner";
import { Harvester } from "common/objects/creep/harvester";
import { Attacker } from "common/objects/creep/attacker";
import { Global } from "common/lib/constants/global";

const spawner = getObjectsByPrototype(StructureSpawn).find((s) => s.my);

const queue = queueSpawnerFactory([Harvester, Attacker]);
const queueSpawner = new QueueSpawner(spawner!);
queueSpawner.queue = queue;

export function loop(): void {
  queueSpawner.run();

  Global.creeps.forEach((c) => {
    c.run();
  });
}

// season4-spawn_and_swamp/src/main.ts
import { StructureSpawn } from "game/prototypes";
import { getObjectsByPrototype as getObjectsByPrototype2 } from "game/utils";

// common/lib/states/state-machine.ts
var StateMachine = class {
  constructor() {
    this.handlers = /* @__PURE__ */ new Map();
    this.currentState = State.IDLE;
  }
  registerHandler(handler) {
    this.handlers.set(handler.state, handler);
  }
  handle(unit) {
    const handler = this.handlers.get(this.currentState);
    handler?.run(unit);
    this.currentState = handler?.getNextState(unit) || State.IDLE;
  }
};

// common/objects/creep.ts
var BaseCreep = class extends Unit2 {
};
BaseCreep.desiredBodies = [];

// common/lib/states/handlers/creep/attacker/attack-handler.ts
import { ATTACK, ERR_NOT_IN_RANGE, RANGED_ATTACK } from "game/constants";
var AttackHandler = class {
  constructor() {
    this.state = State.ATTACK;
  }
  getNextState(creep) {
    if (!creep.target || !creep.target.exists) {
      return State.IDLE;
    }
    return State.ATTACK;
  }
  run(creep) {
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
};

// common/objects/creep/attacker.ts
import { ATTACK as ATTACK2, MOVE } from "game/constants";
var handlers = [new AttackHandler()];
var AttackerState = {
  ATTACK: "ATTACK"
};

// common/lib/states/handlers/creep/harvester/harvest-handler.ts
import { ERR_NOT_IN_RANGE as ERR_NOT_IN_RANGE2 } from "game/constants";
import { Source } from "game/prototypes";
import { getObjectsByPrototype } from "game/utils";
var HarvestHandler = class {
  constructor() {
    this.state = State.HARVEST;
  }
  run(unit) {
    const sources = getObjectsByPrototype(Source);
    const closestSource = unit.unit.findClosestByPath(sources);
    const err = unit.unit.harvest(closestSource);
    if (closestSource && err === ERR_NOT_IN_RANGE2) {
      unit.unit.moveTo(closestSource);
    }
  }
  getNextState(unit) {
    if (unit.isFull()) {
      return State.STORE;
    }
    return State.HARVEST;
  }
};

// common/lib/states/handlers/creep/harvester/store-handler.ts
import { ERR_NOT_IN_RANGE as ERR_NOT_IN_RANGE3, RESOURCE_ENERGY } from "game/constants";
var StoreHandler = class {
  constructor() {
    this.state = State.HARVEST;
  }
  run(unit) {
    if (unit.storeTarget && unit.unit.transfer(unit.storeTarget, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE3) {
      unit.unit.moveTo(unit.storeTarget);
    }
  }
  getNextState(unit) {
    if (unit.isEmpty()) {
      return State.HARVEST;
    }
    return State.STORE;
  }
};

// common/objects/creep/harvester.ts
import { CARRY, MOVE as MOVE2, WORK } from "game/constants";
var handlers2 = [new HarvestHandler(), new StoreHandler()];
var HarvesterState = {
  HARVEST: "HARVEST",
  STORE: "STORE"
};
var Harvester = class _Harvester extends BaseCreep {
  constructor(creep) {
    super(creep, handlers2);
    _Harvester.desiredBodies = [MOVE2, WORK, CARRY];
  }
  isFull() {
    return this.unit.store.getFreeCapacity() === 0;
  }
  isEmpty() {
    return this.unit.store.getUsedCapacity() === 0;
  }
};

// common/lib/states/handlers/creep/healer/heal-handler.ts
import { ERR_NOT_IN_RANGE as ERR_NOT_IN_RANGE4 } from "game/constants";
var HealHandler = class {
  constructor() {
    this.state = State.HEAL;
  }
  getNextState(creep) {
    if (!creep.healTarget || !creep.healTarget.exists) {
      return State.IDLE;
    }
    return State.HEAL;
  }
  run(creep) {
    if (!creep.healTarget) {
      return;
    }
    if (creep.unit.heal(creep.healTarget) === ERR_NOT_IN_RANGE4) {
      creep.unit.moveTo(creep.healTarget);
    }
  }
};

// common/objects/creep/healer.ts
import { HEAL, MOVE as MOVE3 } from "game/constants";
var handlers3 = [new HealHandler()];
var HealerState = {
  HEAL: "HEAL"
};

// common/objects/base.ts
var BaseState = {
  IDLE: "IDLE"
};
var State = {
  ...BaseState,
  ...AttackerState,
  ...HarvesterState,
  ...HealerState,
  ...QueueSpawnerState
};
var Unit2 = class {
  constructor(unit, handlers5) {
    this.machine = new StateMachine();
    this.unit = unit;
    handlers5.forEach((handler) => {
      this.machine.registerHandler(handler);
    });
  }
  run() {
    this.machine.handle(this);
  }
  overrideState(state) {
    this.machine.currentState = state;
  }
};

// common/objects/spawn.ts
var BaseSpawner = class extends Unit2 {
};

// common/lib/constants/global.ts
var Global = class {
};
Global.creeps = [];

// common/lib/states/handlers/spawner/spawn-handler.ts
var SpawnHandler = class {
  constructor() {
    this.state = State.SPAWN;
  }
  run(unit) {
    if (unit.fetus?.creep?.exists) {
      const newUnit = new unit.fetus.roleCreator(unit.fetus.creep);
      Global.creeps.push(newUnit);
      unit.fetus = void 0;
    }
    if (!unit.fetus && unit.queue && unit.queue.length > 0) {
      unit.fetus = unit.queue.shift();
      unit.fetus.creep = unit.unit.spawnCreep(unit.fetus.desiredBodies).object;
    }
  }
  getNextState(unit) {
    if (unit.queue?.length === 0 && !unit.fetus) {
      return State.IDLE;
    }
    return State.SPAWN;
  }
};

// common/objects/spawner/queue-spawner.ts
var handlers4 = [new SpawnHandler()];
var QueueSpawnerState = {
  SPAWN: "SPAWN"
};
var queueSpawnerFactory = (creeps) => {
  return creeps.map(
    (c) => ({
      desiredBodies: c.desiredBodies,
      roleCreator: c
    })
  );
};
var QueueSpawner = class extends BaseSpawner {
  constructor(spawner2) {
    super(spawner2, handlers4);
  }
};

// season4-spawn_and_swamp/src/main.ts
var spawner = getObjectsByPrototype2(StructureSpawn).find((s) => s.my);
var queue = queueSpawnerFactory([Harvester]);
function loop() {
  const queueSpawner = new QueueSpawner(spawner);
  queueSpawner.queue = queue;
  queueSpawner.run();
  Global.creeps.forEach((c) => {
    c.run();
  });
}
export {
  loop
};

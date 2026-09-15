// season4-spawn_and_swamp/src/main.ts
import { StructureSpawn } from "game/prototypes";
import { getObjectsByPrototype as getObjectsByPrototype2 } from "game/utils";

// common/objects/states/attacker-state.ts
var AttackerState = {
  ATTACK: "ATTACK"
};

// common/objects/states/harvest-state.ts
var HarvesterState = {
  HARVEST: "HARVEST",
  STORE: "STORE"
};

// common/objects/states/healer-state.ts
var HealerState = {
  HEAL: "HEAL"
};

// common/objects/states/queue-spawner-state.ts
var QueueSpawnerState = {
  SPAWN: "SPAWN"
};

// common/lib/constants/state.ts
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
    console.log(handler);
    handler?.run(unit);
    this.currentState = handler?.getNextState(unit) || State.IDLE;
  }
};

// common/objects/base.ts
var Unit = class {
  constructor(unit, handlers4) {
    this.machine = new StateMachine();
    this.unit = unit;
    handlers4.forEach((handler) => {
      this.machine.registerHandler(handler);
    });
  }
  run() {
    this.machine.handle(this);
  }
};

// common/objects/spawn.ts
var BaseSpawner = class extends Unit {
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
    if (unit.fetus?.creep?.exists && !unit.unit.spawning) {
      const newUnit = new unit.fetus.roleCreator(unit.fetus.creep);
      Global.creeps.push(newUnit);
      unit.fetus = void 0;
    }
    if (!unit.fetus && unit.queue && unit.queue.length > 0) {
      unit.fetus = unit.queue.shift();
      unit.fetus.creep = unit.unit.spawnCreep(unit.fetus.desiredBodies).object;
    }
    if (unit.fetus && !unit.fetus.creep?.exists) {
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
var handlers = [new SpawnHandler()];
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
    super(spawner2, handlers);
    this.machine.currentState = State.SPAWN;
  }
};

// common/objects/creep.ts
var BaseCreep = class extends Unit {
};
BaseCreep.desiredBodies = [];

// common/lib/states/handlers/creep/harvester/harvest-handler.ts
import { ERR_NOT_IN_RANGE, RESOURCE_ENERGY } from "game/constants";
import { StructureContainer } from "game/prototypes";
import { getObjectsByPrototype } from "game/utils";
var HarvestHandler = class {
  constructor() {
    this.state = State.HARVEST;
  }
  run(unit) {
    const containers = getObjectsByPrototype(StructureContainer);
    const closestContainer = unit.unit.findClosestByPath(containers);
    const err = unit.unit.withdraw(closestContainer, RESOURCE_ENERGY);
    if (closestContainer && err === ERR_NOT_IN_RANGE) {
      unit.unit.moveTo(closestContainer);
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
import { ERR_NOT_IN_RANGE as ERR_NOT_IN_RANGE2, RESOURCE_ENERGY as RESOURCE_ENERGY2 } from "game/constants";
var StoreHandler = class {
  constructor() {
    this.state = State.STORE;
  }
  run(unit) {
    if (unit.storeTarget && unit.unit.transfer(unit.storeTarget, RESOURCE_ENERGY2) === ERR_NOT_IN_RANGE2) {
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
import { CARRY, MOVE, WORK } from "game/constants";
var handlers2 = [new HarvestHandler(), new StoreHandler()];
var Harvester = class extends BaseCreep {
  constructor(creep) {
    super(creep, handlers2);
    this.machine.currentState = State.HARVEST;
  }
  isFull() {
    return this.unit.store.getFreeCapacity() === 0;
  }
  isEmpty() {
    return this.unit.store.getUsedCapacity() === 0;
  }
};
Harvester.desiredBodies = [MOVE, WORK, CARRY];

// common/lib/states/handlers/creep/attacker/attack-handler.ts
import { ATTACK, ERR_NOT_IN_RANGE as ERR_NOT_IN_RANGE3, RANGED_ATTACK } from "game/constants";
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
      if (creep.unit.attack(creep.target) === ERR_NOT_IN_RANGE3) {
        creep.unit.moveTo(creep.target);
      }
    }
    if (creep.unit.body.some((bodyPart) => bodyPart.type === RANGED_ATTACK)) {
      if (creep.unit.rangedAttack(creep.target) === ERR_NOT_IN_RANGE3) {
        creep.unit.moveTo(creep.target);
      }
    }
  }
};

// common/objects/creep/attacker.ts
import { ATTACK as ATTACK2, MOVE as MOVE2 } from "game/constants";
var handlers3 = [new AttackHandler()];
var Attacker = class extends BaseCreep {
  constructor(creep) {
    super(creep, handlers3);
    this.machine.currentState = State.ATTACK;
  }
};
Attacker.desiredBodies = [MOVE2, ATTACK2];

// season4-spawn_and_swamp/src/main.ts
var spawner = getObjectsByPrototype2(StructureSpawn).find((s) => s.my);
var queue = queueSpawnerFactory([Harvester, Attacker]);
var queueSpawner = new QueueSpawner(spawner);
queueSpawner.queue = queue;
function loop() {
  queueSpawner.run();
  Global.creeps.forEach((c) => {
    c.run();
  });
}
export {
  loop
};

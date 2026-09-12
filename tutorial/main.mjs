import { createConstructionSite, getObjectsByPrototype } from "game/utils";
import {
  Creep,
  Source,
  StructureContainer,
  StructureSpawn,
  StructureTower,
} from "game/prototypes";
import {
  ATTACK,
  CARRY,
  ERR_NOT_IN_RANGE,
  MOVE,
  RANGED_ATTACK,
  RESOURCE_ENERGY,
  WORK,
} from "game/constants";

const State = Object.freeze({
  HARVEST: "HARVEST",
  BUILD: "BUILD",
  STORE: "STORE",
  ATTACK: "ATTACK",
  STANDBY: "STANDBY",
});

const sources = getObjectsByPrototype(Source);
var constructionSite;
const enemies = getObjectsByPrototype(Creep).filter((creep) => !creep.my);
var target;

const spawner = getObjectsByPrototype(StructureSpawn).find(
  (struct) => struct.my,
);
var harvest;
var builder;
var vanguard;
var archer;

const runner = {
  [State.HARVEST]: (creep) => {
    const closestSource = creep?.findClosestByPath(sources);
    console.log(creep);
    console.log(closestSource);
    const err = creep.harvest(closestSource);
    console.log(err);
    if (closestSource && creep && err === ERR_NOT_IN_RANGE) {
      console.log("MOVE");
      creep.moveTo(closestSource);
    }
  },
  [State.BUILD]: (creep) => {
    if (!constructionSite) {
      constructionSite = createConstructionSite(
        { x: 50, y: 55 },
        StructureTower,
      ).object;
    }
    if (
      creep &&
      constructionSite &&
      creep.build(constructionSite) == ERR_NOT_IN_RANGE
    ) {
      creep.moveTo(constructionSite);
    }
  },
  [State.STORE]: (creep) => {
    if (creep && creep.transfer(spawner, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveTo(spawner);
    }
  },
  [State.STANDBY]: (creep) => {},
  [State.ATTACK]: (creep) => {
    if (creep.body.some((bodyPart) => bodyPart.type == ATTACK)) {
      if (creep.attack(target) == ERR_NOT_IN_RANGE) {
        creep.moveTo(target);
      }
    }
    if (creep.body.some((bodyPart) => bodyPart.type == RANGED_ATTACK)) {
      if (creep.rangedAttack(target) == ERR_NOT_IN_RANGE) {
        creep.moveTo(target);
      }
    }
  },
};

function handleSpawner() {
  if (!harvest) {
    harvest = spawner?.spawnCreep([MOVE, WORK, CARRY]).object;
    return;
  }

  if (!builder && harvest.exists) {
    builder = spawner?.spawnCreep([MOVE, WORK, CARRY]).object;
    return;
  }

  if (!vanguard && harvest.exists && builder.exists) {
    vanguard = spawner?.spawnCreep([MOVE, ATTACK]).object;
    return;
  }

  if (!archer && harvest.exists && builder.exists && vanguard.exists) {
    archer = spawner?.spawnCreep([MOVE, RANGED_ATTACK]).object;
    return;
  }
}

function handleHarvester() {
  if (!harvest || !harvest.exists) {
    return;
  }

  function getState() {
    if (
      harvest &&
      harvest.store[RESOURCE_ENERGY] < harvest.store.getCapacity()
    ) {
      return State.HARVEST;
    } else {
      return State.STORE;
    }
  }

  const state = getState();
  console.log(state);
  runner[state](harvest);
}

var currentState = State.STANDBY;

function handleAttacker(creep) {
  if (!creep || !creep.exists) {
    return;
  }

  function getState(current) {
    if (current === State.STANDBY) {
      for (const e of enemies) {
        if (creep.getRangeTo(e) < 10) {
          target = e;
          return State.ATTACK;
        }
      }
    } else {
      if (!target) {
        return State.STANDBY;
      }

      if (target.hits === 0) {
        target = undefined;
        return State.STANDBY;
      }
    }
    return State.STANDBY;
  }

  currentState = getState(currentState);
  console.log(currentState);
  runner[currentState](creep);
}

export function loop() {
  handleSpawner();
  handleHarvester();
  handleAttacker(vanguard);
  handleAttacker(archer);
}

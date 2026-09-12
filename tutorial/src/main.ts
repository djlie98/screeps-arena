import { createConstructionSite, getObjectsByPrototype } from "game/utils";
import {
  Creep,
  ConstructionSite,
  Source,
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
} as const);

type StateName = (typeof State)[keyof typeof State];

const sources = getObjectsByPrototype(Source);
let constructionSite: ConstructionSite | undefined;
const enemies = getObjectsByPrototype(Creep).filter((creep) => !creep.my);
let target: Creep | undefined;

const spawner = getObjectsByPrototype(StructureSpawn).find(
  (struct) => struct.my,
);
let harvest: Creep | undefined;
let builder: Creep | undefined;
let vanguard: Creep | undefined;
let archer: Creep | undefined;

const runner: Record<StateName, (creep: Creep) => void> = {
  [State.HARVEST]: (creep) => {
    const closestSource = creep.findClosestByPath(sources);
    const err = creep.harvest(closestSource);
    if (closestSource && err === ERR_NOT_IN_RANGE) {
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
    if (constructionSite && creep.build(constructionSite) === ERR_NOT_IN_RANGE) {
      creep.moveTo(constructionSite);
    }
  },
  [State.STORE]: (creep) => {
    if (spawner && creep.transfer(spawner, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
      creep.moveTo(spawner);
    }
  },
  [State.STANDBY]: (_creep) => {},
  [State.ATTACK]: (creep) => {
    if (!target) {
      return;
    }
    if (creep.body.some((bodyPart) => bodyPart.type === ATTACK)) {
      if (creep.attack(target) === ERR_NOT_IN_RANGE) {
        creep.moveTo(target);
      }
    }
    if (creep.body.some((bodyPart) => bodyPart.type === RANGED_ATTACK)) {
      if (creep.rangedAttack(target) === ERR_NOT_IN_RANGE) {
        creep.moveTo(target);
      }
    }
  },
};

function handleSpawner(): void {
  if (!harvest) {
    harvest = spawner?.spawnCreep([MOVE, WORK, CARRY]).object;
    return;
  }
  if (!harvest.exists) {
    return;
  }

  if (!builder) {
    builder = spawner?.spawnCreep([MOVE, WORK, CARRY]).object;
    return;
  }
  if (!builder.exists) {
    return;
  }

  if (!vanguard) {
    vanguard = spawner?.spawnCreep([MOVE, ATTACK]).object;
    return;
  }
  if (!vanguard.exists) {
    return;
  }

  if (!archer) {
    archer = spawner?.spawnCreep([MOVE, RANGED_ATTACK]).object;
  }
}

function handleHarvester(): void {
  if (!harvest || !harvest.exists) {
    return;
  }
  const activeHarvest = harvest;

  function getState(): StateName {
    if (activeHarvest.store[RESOURCE_ENERGY] < (activeHarvest.store.getCapacity() ?? 0)) {
      return State.HARVEST;
    }
    return State.STORE;
  }

  const state = getState();
  console.log(state);
  runner[state](activeHarvest);
}

let currentState: StateName = State.STANDBY;

function handleAttacker(creep: Creep | undefined): void {
  if (!creep || !creep.exists) {
    return;
  }
  const activeCreep = creep;

  function getState(current: StateName): StateName {
    if (current === State.STANDBY) {
      for (const enemy of enemies) {
        if (activeCreep.getRangeTo(enemy) < 10) {
          target = enemy;
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
  runner[currentState](activeCreep);
}

export function loop(): void {
  handleSpawner();
  handleHarvester();
  handleAttacker(vanguard);
  handleAttacker(archer);
}

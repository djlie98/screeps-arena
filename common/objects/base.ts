import { Handler, StateMachine } from "../lib/states/state-machine";

export class Unit<T> {
  unit: T;
  machine = new StateMachine();

  constructor(unit: T, handlers: Array<Handler<T>>) {
    this.unit = unit;

    handlers.forEach((handler) => {
      this.machine.registerHandler(handler);
    });
  }

  run() {
    this.machine.handle(this);
  }
}

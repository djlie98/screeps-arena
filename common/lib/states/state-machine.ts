import { Unit } from "common/objects/base";
import { State } from "../constants/state";

export interface Handler<T> {
  state: State;

  run(unit: Unit<T>): void;
  getNextState(unit: Unit<T>): State;
}

export class StateMachine<T> {
  handlers = new Map<State, Handler<T>>();
  currentState: State = State.IDLE;

  registerHandler(handler: Handler<T>) {
    this.handlers.set(handler.state, handler);
  }

  handle(unit: Unit<T>) {
    const handler = this.handlers.get(this.currentState);
    console.log(handler);
    handler?.run(unit);
    this.currentState = handler?.getNextState(unit) || State.IDLE;
  }
}

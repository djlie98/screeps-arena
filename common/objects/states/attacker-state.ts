export const AttackerState = {
  ATTACK: "ATTACK",
} as const;
export type AttackerState = (typeof AttackerState)[keyof typeof AttackerState];

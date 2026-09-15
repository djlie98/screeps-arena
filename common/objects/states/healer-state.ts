export const HealerState = {
  HEAL: "HEAL",
} as const;
export type HealerState = (typeof HealerState)[keyof typeof HealerState];

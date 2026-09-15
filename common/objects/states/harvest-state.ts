export const HarvesterState = {
  HARVEST: "HARVEST",
  STORE: "STORE",
} as const;
export type HarvesterState =
  (typeof HarvesterState)[keyof typeof HarvesterState];

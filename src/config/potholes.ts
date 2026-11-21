/**
 * POTHOLE TYPES
 * Add a new type by adding a new entry below, then use its name in levels.ts.
 */

export interface PotholeType {
  depth: number; // how deep it is drawn
  damage: number; // HP lost when you hit it
  halfWidth: number; // half of its width
  label: string; // text shown above it ('' for none)
  trapsCar: boolean; // true = car gets stuck and the tow truck comes
}

export const POTHOLES = {
  shallow: { depth: 8, damage: 5, halfWidth: 15, label: '', trapsCar: false },
  medium: { depth: 22, damage: 15, halfWidth: 22, label: '', trapsCar: false },
  deep: { depth: 40, damage: 30, halfWidth: 30, label: 'DEEP', trapsCar: false },
  abyss: { depth: 68, damage: 0, halfWidth: 38, label: 'ABYSS', trapsCar: true },
} satisfies Record<string, PotholeType>;

export type PotholeId = keyof typeof POTHOLES;

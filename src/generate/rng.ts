const ZERO = 0;
const ONE = 1;
const UINT32 = 0x1_0000_0000;
const MUL_A = 0x6d2b_79f5;
const SHIFT_15 = 15;
const SHIFT_7 = 7;
const SHIFT_14 = 14;
const OR_61 = 61;

export type Rng = {
  next: () => number;
  int: (maxExclusive: number) => number;
};

export const makeRng = (seed: number): Rng => {
  let state = seed >>> ZERO;
  const next = (): number => {
    state = (state + MUL_A) >>> ZERO;
    let value = Math.imul(state ^ (state >>> SHIFT_15), state | ONE);
    value ^= value + Math.imul(value ^ (value >>> SHIFT_7), value | OR_61);
    return ((value ^ (value >>> SHIFT_14)) >>> ZERO) / UINT32;
  };
  return {
    int: (maxExclusive) => Math.floor(next() * maxExclusive),
    next,
  };
};

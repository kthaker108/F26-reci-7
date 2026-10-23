import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { mergeIntervals, type Interval } from '../src/intervals';

// Recitation Part 2 (groups) and problem set Task 2.
// Read the spec in src/intervals/mergeIntervals.ts, then check your progress
// with `npm run mutants:intervals`.
//
// Label every property with its pattern, on the line above its `it(`:
//   // Pattern: invariant. The output is sorted.
// (invariant, algebraic, metamorphic, differential, or conditional)

// A first attempt at a generator. It has a problem: run the tests and read
// the counterexample.
// Fixed: two independent integers often give start > end, which the spec
// rejects. Picking a start and a non-negative length keeps start <= end.
const interval: fc.Arbitrary<Interval> = fc.tuple(fc.integer(), fc.nat()).map(([start, len]): Interval => [start, start + len]);
const intervalList = fc.array(interval);

describe('mergeIntervals', () => {
  // Pattern: invariant. Every input interval lies inside some output interval.
  it('every input interval lies inside some output interval', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        const out = mergeIntervals(xs);
        const uncovered = xs.filter(([s, e]) => !out.some(([a, b]) => a <= s && e <= b));
        expect(uncovered).toEqual([]);
      }),
    );
  });

  // Add your properties here. Aim for at least one of each pattern:
  // invariant, algebraic, metamorphic, differential, conditional.

  // Small range, so intervals often overlap, touch ([1, 3] and [3, 5]),
  // or sit one apart ([1, 2] and [3, 4]).
  const smallInterval: fc.Arbitrary<Interval> = fc
    .tuple(fc.integer({ min: -10, max: 10 }), fc.nat({ max: 5 }))
    .map(([start, len]): Interval => [start, start + len]);
  const smallIntervalList = fc.array(smallInterval);

  // Pattern: invariant. The output is sorted.
  it('the output is sorted', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        const out = mergeIntervals(xs);
        for (let i = 0; i < out.length - 1; i++) {
          expect(out[i][0]).toBeLessThanOrEqual(out[i + 1][0]);
        }
      }),
    );
  });

  // Pattern: invariant. Consecutive output intervals neither overlap nor touch.
  it('the output intervals do not overlap or touch', () => {
    fc.assert(
      fc.property(smallIntervalList, xs => {
        const out = mergeIntervals(xs);
        for (let i = 0; i < out.length - 1; i++) {
          expect(out[i][1]).toBeLessThan(out[i + 1][0]);
        }
      }),
    );
  });

  // Pattern: invariant. The input array and its intervals are not modified.
  it('does not modify the input', () => {
    fc.assert(
      fc.property(smallIntervalList, xs => {
        const before = structuredClone(xs);
        mergeIntervals(xs);
        expect(xs).toEqual(before);
      }),
    );
  });

  // Pattern: algebraic. Merging an already-merged list changes nothing.
  it('merging twice is the same as merging once', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        const once = mergeIntervals(xs);
        expect(mergeIntervals(once)).toEqual(once);
      }),
    );
  });

  // Pattern: metamorphic. Reversing the input order does not change the output.
  it('reversing the input gives the same output', () => {
    fc.assert(
      fc.property(smallIntervalList, xs => {
        expect(mergeIntervals([...xs].reverse())).toEqual(mergeIntervals(xs));
      }),
    );
  });

  // Pattern: differential. Input and output cover the same points, including non-integers.
  it('every point covered by the input is covered by the output', () => {
    fc.assert(
      fc.property(smallIntervalList, xs => {
        const out = mergeIntervals(xs);
        // Endpoints plus half-points, to catch gaps like 2 < x < 3.
        const pointsToCheck = xs.flatMap(([s, e]) => [s, e, s - 0.5, e + 0.5]);
        for (const p of pointsToCheck) {
          const inInput = xs.some(([s, e]) => s <= p && p <= e);
          const inOutput = out.some(([s, e]) => s <= p && p <= e);
          expect(inOutput).toBe(inInput);
        }
      }),
    );
  });

  // Pattern: conditional. If the input intervals are already disjoint, the output equals the input.
  it('if the input intervals are disjoint, the output is the same as the input', () => {
    const disjointIntervals = fc
      .array(fc.nat({ max: 8 }), { minLength: 1 })
      .map(lens => lens.map((len, i): Interval => [10 * i, 10 * i + len]));

    fc.assert(
      fc.property(disjointIntervals, xs => {
        expect(mergeIntervals(xs)).toEqual(xs);
      }),
    );
  });
});

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

// Valid by construction: pick a start and a non-negative length, so
// start <= end always holds (the spec's precondition). Two independent
// integers would give start > end about half the time, which is invalid input.
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

  //invariant
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
  //What must always be true of the output's shape?
  it('the output intervals do not overlap or touch', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        const out = mergeIntervals(xs);
        for (let i = 0; i < out.length - 1; i++) {
          expect(out[i][1]).toBeLessThan(out[i + 1][0]);
        }
      }),
    );
  });

  //algebraic
  it('merging twice is the same as merging once', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        const once = mergeIntervals(xs);
        const twice = mergeIntervals(once);
        expect(twice).toEqual(once);
      }),
    );
  });


  //metamorphic
  it('merging the output with itself gives the same output', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        const out = mergeIntervals(xs);
        const mergedAgain = mergeIntervals(out);
        expect(mergedAgain).toEqual(out);
      }),
    );
  });


  //differential: Can you write a tiny, obviously correct check of "is point p covered?" and compare input with output?
  it('every point covered by the input is covered by the output', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        const out = mergeIntervals(xs);
        const pointsToCheck = xs.flatMap(([s, e]) => [s, e]); 
        for (const p of pointsToCheck) {
          const inInput = xs.some(([s, e]) => s <= p && p <= e);
          const inOutput = out.some(([s, e]) => s <= p && p <= e);
          expect(inInput).toBe(inOutput);
        }
      }),
    );
  });

  //conditional: If the input intervals already don't overlap or touch, what should the output be? (Generate such inputs directly.)
  it('if the input intervals are disjoint, the output is the same as the input', () => {
    const disjointIntervals = fc.array(
      fc.tuple(fc.integer(), fc.nat()).map(([start, len]) => [start, start + len] as Interval),
      { minLength: 1 }
    ).filter(intervals => {
      intervals.sort((a, b) => a[0] - b[0]);
      for (let i = 0; i < intervals.length - 1; i++) {
        if (intervals[i][1] >= intervals[i + 1][0]) return false; 
      }
      return true;
    });

    fc.assert(
      fc.property(disjointIntervals, xs => {
        const out = mergeIntervals(xs);
        expect(out).toEqual(xs);
      }),
    );
  });
});

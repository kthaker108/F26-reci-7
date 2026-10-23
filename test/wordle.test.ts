import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { matchGuess } from '../src/wordle';

// Recitation Part 1: follow along with your TA, filling in the todos below.
// Problem set Task 1: keep adding properties until `npm run mutants:wordle`
// kills every mutant. Read the spec in src/wordle/matchGuess.ts.
//
// Label every property with its pattern, on the line above its `it(`:
//   // Pattern: invariant. The result always has exactly five colors.
// (invariant, algebraic, metamorphic, differential, or conditional)

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Step 1: a generator for five-letter uppercase words.
const wordFrom = (letters: string) => 
  fc.array(fc.constantFrom(...letters), {minLength: 5, maxLength: 5}).map(cs => cs.join(''));
const word = wordFrom(ALPHABET);
// Few letters, so words often share and repeat letters (the tricky cases).
const smallWord = wordFrom('ABC');

// Pattern: invariant. The result always has exactly five colors.
it('returns exactly five colors', () => {
  fc.assert(
    fc.property(word, word, (secret, guess) => {
      expect(matchGuess(secret, guess)).toHaveLength(5);
    })
  );
})

// Pattern: invariant. Every color is G, Y, or B.
it('only uses the colors G, Y, B', () => {
  fc.assert(
    fc.property(word, word, (secret, guess) => {
      for (const c of matchGuess(secret, guess)) {
        expect(['G', 'Y', 'B']).toContain(c);
      }
    })
  );
})

// Pattern: conditional. If the guess is the secret, all colors are green.
it('guessing the secret gives all greens', () => {
  fc.assert(
    fc.property(word, w => {
      expect(matchGuess(w,w)).toEqual(['G','G','G','G','G']);
    })
  );
})

// Pattern: invariant. No letter is credited (G or Y) more times than the secret contains it.
it('never credits a letter more times than the secret contains it', () => {
  fc.assert(
    fc.property(smallWord, smallWord, (secret, guess) => {
      const result = matchGuess(secret, guess);
      for (const letter of new Set(guess)) {
        const credited = [...guess].filter((c,i) => c === letter && result[i] !== 'B').length;
        const inSecret = [...secret].filter(c => c === letter).length;
        expect(credited).toBeLessThanOrEqual(inSecret);
      }
    })
  );
})

// Targeted generator: builds a [secret, guess] pair where the guess is the
// secret rotated, so it always uses exactly the secret's letters.
const secretAndRearrangement = word.map(secret => [secret, secret.slice(1) + secret[0]] as const);

// Pattern: conditional. If the guess uses exactly the secret's letters, no color is black.
it('a rearrangement of the secret has no blacks', () => {
  fc.assert(
    fc.property(secretAndRearrangement, ([secret, guess]) => {
      expect(matchGuess(secret, guess)).not.toContain('B');
    })
  );
})

// Shifts every letter forward by k in the alphabet (Z wraps to A).
const shift = (w: string, k: number) =>
  [...w].map(c => ALPHABET[(ALPHABET.indexOf(c) + k) % 26]).join('');

// Pattern: metamorphic. Renaming letters the same way in both words does not change the colors.
it('shifting every letter in both words gives the same colors', () => {
  fc.assert(
    fc.property(word, word, fc.integer({ min: 1, max: 25 }), (secret, guess, k) => {
      expect(matchGuess(shift(secret, k), shift(guess, k))).toEqual(matchGuess(secret, guess));
    })
  );
})

describe('matchGuess', () => {
  it.todo('returns exactly five colors');
  it.todo('only uses the colors G, Y, B');
  it.todo('guessing the secret gives all greens');
  it.todo('never credits a letter more times than the secret contains it');
});

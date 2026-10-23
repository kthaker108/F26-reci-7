# Reflection

**Name / Andrew ID:** Khushi Thaker (kthaker)

**Recitation group members (Task 2):** Anna David and Sanika Jain

---

### 1. Valid but weak

Pick a property you wrote that passes on the correct implementation but
kills few or no mutants. Why is it still a *valid* property? Describe a
concrete bug (not one of our mutants) that it *would* catch.

The metamorphic property in the Wordle implementation (swapping the secret and the guess keeps the same greens) passes but does not catch any mutants. However, it is still a valid property because in Wordle, a position is green only when the guess and secret have the same letter there, so it doesn't even matter specific word the secret is. Thus, if you swap the two words, the greens should stay in the same places.
A bug that this property would catch is a version that gives yellows before greens, so an earlier yellow can use up a letter that a later green needed. For instance, matchGuess('BACCC', 'AADDD') would output 'Y B B B B' (no greens). After swapping, matchGuess('AADDD', 'BACCC') would output 'B G B B B'. The greens differ and the outputs are different, so the property fails.


### 2. A generator problem, not a property problem

Describe a mutant, from either task, that survived or was flaky because of
your **generator** rather than your property. What did the generator fail to
produce? How did you fix it? Paste the runner output from before and after.

The singlePass mutant in Wordle was flaky because of my generator. The 'never credits a letter more times than the secret contains it' property was correct, but the generator picked letters from the full 26-letter alphabet, so random words rarely shared or repeated letters. singlePass only goes wrong when the same letter shows up more than once (an early yellow uses up a letter that a later green needed), so the generator rarely produced an input that exposed the bug. I fixed it by running that property on a small alphabet, wordFrom('ABC'), so repeated letters show up almost every time.

Before:
```
  ~ singlePass     flaky: killed in 3/5 runs  by: never credits a letter more times than the secret contains it
      Counterexample: ["AHAAA","HHAAA"]
      AssertionError: expected 2 to be less than or equal to 1
```

After:
```
  ✔ singlePass     killed  by: never credits a letter more times than the secret contains it
      Counterexample: ["AAABA","AAAAA"]
      AssertionError: expected 5 to be less than or equal to 4
```



### 3. Reading a counterexample

Paste one counterexample that the mutation runner printed for a killed
mutant. In 2–3 sentences, explain using the *specification* why that input
exposes the bug.

Counterexample for the ignoresCounts mutant in Wordle:
```
  ✔ ignoresCounts  killed  by: never credits a letter more times than the secret contains it
      Counterexample: ["AAQAA","AAQQA"]
      AssertionError: expected 2 to be less than or equal to 1
```
The secret AAQAA has one Q, and the guess AAQQA has two. The first Q in the guess is in the same spot as the secret's Q, so it is green and uses up that Q. The spec says a letter can only be yellow if there is an unused copy of it left in the secret, and there isn't one, so the second Q should be black. ignoresCounts marks it yellow anyway because Q is somewhere in the secret, so the guess gets credit for two Qs when the secret only has one.



### 4. Your project

Name one function or module in your team's project that would benefit from
property-based testing. State two properties in English, name the pattern of
each, and describe the generator you'd need, including anything about its
inputs that a naive generator would get wrong.

Feature: the skill modes feature (Beginner, Intermediate, Expert). The user selects a mode and then types their prompt, and the function takes the selected mode and the prompt and builds the response.

Property 1 (invariant): For any mode and any prompt, the request always contains the user's prompt unchanged and exactly one set of mode instructions, the one for the selected mode.

Property 2 (metamorphic): Changing only the selected mode (keeping the same prompt) changes the mode instructions in the request, but the user's prompt part stays exactly the same.

Generator: The mode can be picked with fc.constantFrom('beginner', 'intermediate', 'expert'), and the prompt can be a random string. A naive string generator would mostly produce short, plain text, so it would miss the tricky cases: empty prompts, very long prompts, code with special characters, and prompts that contain words like "beginner" or "expert" themselves. That last case matters because it could make the request look like it has two sets of mode instructions, so the generator should sometimes mix those words into the prompt on purpose.


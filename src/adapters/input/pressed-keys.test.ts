import { expect, test } from "bun:test";
import { isKeyPressed } from "./pressed-keys";

test("key feedback maps arrows, simultaneous presses, jump and reset", () => {
  const keys = new Set(["ArrowUp", "KeyA", "Space", "KeyR"]);
  expect(isKeyPressed(keys, "W")).toBe(true);
  expect(isKeyPressed(keys, "A")).toBe(true);
  expect(isKeyPressed(keys, "SPACE")).toBe(true);
  expect(isKeyPressed(keys, "R")).toBe(true);
  expect(isKeyPressed(keys, "D")).toBe(false);
  keys.add("KeyW");
  keys.delete("ArrowUp");
  expect(isKeyPressed(keys, "W")).toBe(true);
  keys.clear();
  expect(isKeyPressed(keys, "W")).toBe(false);
  expect(isKeyPressed(keys, "SPACE")).toBe(false);
});

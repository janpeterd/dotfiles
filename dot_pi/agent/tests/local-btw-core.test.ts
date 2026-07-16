import assert from "node:assert/strict";
import test from "node:test";
import { selectBtwCheckpoint } from "../extensions/local-btw/core.ts";

test("an idle main thread forks from its current leaf", () => {
	assert.equal(selectBtwCheckpoint(true, "current", "settled"), "current");
});

test("a running main thread forks from the last settled leaf", () => {
	assert.equal(selectBtwCheckpoint(false, "in-progress", "settled"), "settled");
});

test("a first running turn can start a btw thread with empty context", () => {
	assert.equal(selectBtwCheckpoint(false, "first-user-message", undefined), undefined);
});

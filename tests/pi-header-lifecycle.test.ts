import { describe, expect, test } from "bun:test";

import { HeaderLifecycle } from "../dot_pi/agent/extensions/header-lifecycle";

describe("HeaderLifecycle", () => {
	test("runs every teardown exactly once when stopped", () => {
		const calls: string[] = [];
		const lifecycle = new HeaderLifecycle();
		lifecycle.add(() => calls.push("animation"));
		lifecycle.add(() => calls.push("clock"));
		lifecycle.add(() => calls.push("updates"));

		lifecycle.stop();
		lifecycle.stop();

		expect(lifecycle.isActive).toBe(false);
		expect(calls).toEqual(["animation", "clock", "updates"]);
	});

	test("immediately tears down work registered after shutdown", () => {
		let calls = 0;
		const lifecycle = new HeaderLifecycle();
		lifecycle.stop();

		lifecycle.add(() => calls++);

		expect(calls).toBe(1);
	});
});

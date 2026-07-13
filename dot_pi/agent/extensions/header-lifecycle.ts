export class HeaderLifecycle {
	private active = true;
	private readonly teardowns = new Set<() => void>();

	get isActive(): boolean {
		return this.active;
	}

	add(teardown: () => void): void {
		if (!this.active) {
			teardown();
			return;
		}
		this.teardowns.add(teardown);
	}

	stop(): void {
		if (!this.active) return;
		this.active = false;
		for (const teardown of this.teardowns) teardown();
		this.teardowns.clear();
	}
}

// Pi auto-discovers every top-level TypeScript file in the extensions directory.
// This module primarily supports jp-header, but must also be a valid extension
// when Pi loads it independently.
export default function headerLifecycleExtension(): void {}

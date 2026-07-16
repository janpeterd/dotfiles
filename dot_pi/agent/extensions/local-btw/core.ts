export function selectBtwCheckpoint(
	isMainIdle: boolean,
	currentLeafId: string | null | undefined,
	lastSettledLeafId: string | null | undefined,
): string | undefined {
	return (isMainIdle ? currentLeafId : lastSettledLeafId) ?? undefined;
}

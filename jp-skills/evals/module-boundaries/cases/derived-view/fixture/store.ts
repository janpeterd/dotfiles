export type Item = Readonly<{id: string; title: string; completed: boolean}>;
export type Snapshot = Readonly<{revision: number; items: readonly Item[]; remaining: number}>;
export type Edit = Readonly<{id: string; title?: string; completed?: boolean}>;

export class BoardStore {
  private items: Item[];
  private revision = 0;
  private cached: Snapshot | undefined;
  private listeners = new Set<() => void>();

  constructor(items: readonly Item[]) {
    if (new Set(items.map(item => item.id)).size !== items.length) throw new Error('duplicate id');
    this.items = items.map(item => Object.freeze({...item}));
  }
  getSnapshot(): Snapshot {
    if (!this.cached) this.cached = Object.freeze({
      revision: this.revision,
      items: Object.freeze([...this.items]),
      remaining: this.items.filter(item => !item.completed).length,
    });
    return this.cached;
  }
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }
  setCompleted(id: string, completed: boolean): void {
    const index = this.items.findIndex(item => item.id === id);
    if (index < 0) throw new Error('unknown id');
    if (this.items[index].completed === completed) return;
    this.items[index] = Object.freeze({...this.items[index], completed});
    this.revision++;
    this.cached = undefined;
    for (const listener of this.listeners) listener();
  }
}

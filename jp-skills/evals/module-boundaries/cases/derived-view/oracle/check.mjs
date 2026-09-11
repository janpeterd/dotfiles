import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const {BoardStore} = await import(pathToFileURL(path.join(process.env.EVAL_WORKSPACE, 'store.ts')));
const initial = [{id:'a',title:'Alpha',completed:false},{id:'b',title:'Beta',completed:true}];
const board = new BoardStore(initial);
const original = board.getSnapshot();
const notifications = [];
const unsubscribe = board.subscribe(() => notifications.push(board.getSnapshot()));
board.applyEdits([{id:'a',title:'Updated'},{id:'b',completed:false},{id:'a',completed:true}]);
const next = board.getSnapshot();
assert.deepEqual(next.items, [{id:'a',title:'Updated',completed:true},{id:'b',title:'Beta',completed:false}]);
assert.equal(next.remaining, 1);
assert.equal(next.revision, original.revision + 1);
assert.equal(notifications.length, 1);
assert.equal(notifications[0], next);
assert.equal(board.getSnapshot(), next);
assert.deepEqual(original.items, initial);
assert.ok(Object.isFrozen(next) && Object.isFrozen(next.items) && next.items.every(Object.isFrozen));
board.applyEdits([]);
board.applyEdits([{id:'a',title:'Temporary'},{id:'a',title:'Updated'}]);
assert.equal(board.getSnapshot(), next);
assert.equal(notifications.length, 1);
assert.throws(() => board.applyEdits([{id:'a',title:'Partial'},{id:'unknown',completed:true}]));
assert.equal(board.getSnapshot(), next);
assert.equal(notifications.length, 1);
board.setCompleted('a', false);
assert.equal(board.getSnapshot().remaining, 2);
assert.equal(board.getSnapshot().items[0].title, 'Updated');
assert.equal(notifications.length, 2);
unsubscribe();
board.applyEdits([{id:'a',completed:true}]);
assert.equal(notifications.length, 2);
// Deterministic stateful replay covers interactions beyond the example batch.
const replay = new BoardStore(initial);
let expected = initial.map(item => ({...item}));
let calls = 0;
replay.subscribe(() => { calls++; });
for (let i = 0; i < 32; i++) {
  const before = replay.getSnapshot();
  const preserved = JSON.stringify(before);
  const batch = [
    {id: i % 2 ? 'a' : 'b', title: i % 3 ? `Title ${i}` : ''},
    {id: 'a', completed: Boolean(i % 2)},
    {id: 'b', completed: Boolean(i % 3)},
  ];
  const updated = expected.map(item => ({...item}));
  for (const edit of batch) Object.assign(updated.find(item => item.id === edit.id), edit);
  const changed = JSON.stringify(updated) !== JSON.stringify(expected);
  const count = calls;
  replay.applyEdits(batch);
  const after = replay.getSnapshot();
  assert.deepEqual(after.items, updated);
  assert.equal(after.remaining, updated.filter(item => !item.completed).length);
  assert.equal(after.revision, before.revision + Number(changed));
  assert.equal(calls, count + Number(changed));
  assert.equal(JSON.stringify(before), preserved);
  assert.equal(replay.getSnapshot(), after);
  if (!changed) assert.equal(after, before);
  expected = updated;
}
console.log('derived-view oracle passed');

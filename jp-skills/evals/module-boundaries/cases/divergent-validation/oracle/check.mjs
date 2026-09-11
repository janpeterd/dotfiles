import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const {validateProjectName: project,validateDeviceCode: device} = await import(pathToFileURL(path.join(process.env.EVAL_WORKSPACE, 'validation.ts')));
for (const [input,value] of [['  Côte Nord  ','Côte Nord'],['Cafe\u0301','Café'],['東京 第２','東京 第２'],['𝒜'.repeat(25),'𝒜'.repeat(25)],['x'.repeat(48),'x'.repeat(48)]]) {
  assert.deepEqual(project(input), {ok:true,value}, input);
}
for (const [input,error] of [['  ab  ','length'],['x'.repeat(49),'length'],['---','characters'],['\u0301\u0301\u0301','characters'],['A_B','characters'],['A\tB','characters'],['😀abc','characters'],['//','length']]) {
  assert.deepEqual(project(input), {ok:false,error}, JSON.stringify(input));
}
for (const input of ['AbC','---','x'.repeat(24),'a-4']) assert.deepEqual(device(input), {ok:true,value:input});
for (const [input,error] of [['  abc  ','characters'],['Café','characters'],['東京 第２','characters'],['x'.repeat(25),'length'],['a_','length']]) {
  assert.deepEqual(device(input), {ok:false,error});
}
console.log('divergent-validation oracle passed');

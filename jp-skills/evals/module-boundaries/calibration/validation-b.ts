export type Validation = {ok: true; value: string} | {ok: false; error: string};

type Rule = {
  trim: boolean;
  normalize: boolean;
  unicode: boolean;
  codePoints: boolean;
  spaces: boolean;
  min: number;
  max: number;
  meaningful: boolean;
};
function validate(input: string, rule: Rule): Validation {
  let value = rule.trim ? input.trim() : input;
  if (rule.normalize) value = value.normalize('NFC');
  const length = rule.codePoints ? [...value].length : value.length;
  if (length < rule.min || length > rule.max) return {ok:false, error:'length'};
  const alphabet = rule.unicode ? '\\p{L}\\p{M}\\p{Nd}' : 'A-Za-z0-9';
  const pattern = new RegExp('^[' + alphabet + (rule.spaces ? ' ' : '') + '-]+$', rule.unicode ? 'u' : '');
  if (!pattern.test(value)) return {ok:false, error:'characters'};
  if (rule.meaningful && !(rule.unicode ? /[\p{L}\p{Nd}]/u : /[A-Za-z0-9]/).test(value)) return {ok:false, error:'characters'};
  return {ok:true, value};
}
export function validateProjectName(input: string): Validation {
  return validate(input, {trim:true, normalize:true, unicode:true, codePoints:true, spaces:true, min:3, max:48, meaningful:true});
}
export function validateDeviceCode(input: string): Validation {
  return validate(input, {trim:false, normalize:false, unicode:false, codePoints:false, spaces:false, min:3, max:24, meaningful:false});
}

export type Validation = {ok: true; value: string} | {ok: false; error: string};

export function validateProjectName(input: string): Validation {
  const value = input.trim().normalize('NFC');
  const size = [...value].length;
  if (size < 3 || size > 48) return {ok:false, error:'length'};
  if (!/^[\p{L}\p{M}\p{Nd} -]+$/u.test(value) || !/[\p{L}\p{Nd}]/u.test(value)) return {ok:false, error:'characters'};
  return {ok:true, value};
}

export function validateDeviceCode(input: string): Validation {
  if (input.length < 3 || input.length > 24) return {ok:false, error:'length'};
  if (!/^[A-Za-z0-9-]+$/.test(input)) return {ok:false, error:'characters'};
  return {ok:true, value:input};
}

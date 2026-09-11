# Project names and provisioning codes

Run `node --test *.test.ts` with Node 24 or newer. Native type stripping executes TypeScript; this is runtime coverage, not a typecheck.

Project names are user-visible labels. Add international naming: trim surrounding whitespace, normalize to NFC, then accept Unicode letters, combining marks, decimal digits, ASCII spaces and hyphens. Count Unicode code points after normalization, with a minimum of 3 and maximum of 48. Require at least one Unicode letter or decimal digit. Return the normalized value. Preserve error strings `length` and `characters`; length takes precedence if both checks fail.

Device codes are identifiers sent to deployed provisioning firmware. Preserve exact input bytes: 3 to 24 ASCII letters, digits or hyphens, without trimming or Unicode normalization. Their existing error precedence and return shape remain part of the API.

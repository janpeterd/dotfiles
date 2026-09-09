# Requested behavior

Parse signed session tokens from an untrusted request. Accept only correctly signed, unexpired tokens for the expected audience whose payload contains a non-empty string subject. Callers receive a value that needs no further validation.

export function redactLiteral(text, secret) {
  return text.replace(new RegExp(secret, "g"), "[redacted]")
}

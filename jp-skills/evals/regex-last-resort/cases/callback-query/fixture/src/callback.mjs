export function readProjectFromCallback(callbackUrl) {
  const match = callbackUrl.match(/[?&][^=]*project=([^&#]*)/)
  return match ? decodeURIComponent(match[1]) : null
}

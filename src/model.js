export const types = {
  information: "Information",
  exercise: "Übung",
  appointment: "Termin",
  milestone: "Meilenstein",
};
export function resolveQR(manifest, payload) {
  return manifest.cards.find((card) => card.qrPayload === payload) || null;
}
export function visibleEvents(manifest, keys, role) {
  return manifest.timeline.filter(
    (e) =>
      (e.kind === "past" || keys.includes(e.eventKey)) &&
      (!e.visibility || e.visibility === role),
  );
}
export function addEvent(manifest, keys, key) {
  return manifest.timeline.some(
    (e) => e.eventKey === key && e.requiresConfirmation,
  )
    ? [...new Set([...keys, key])]
    : keys;
}

const API_URL = "http://raindrop:3000";

export function sendDiagnostics() {
  const diag = window.__DIAG;
  fetch(API_URL + "/diag", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(diag),
  });
}

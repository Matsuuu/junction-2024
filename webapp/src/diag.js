import { API_URL } from "./request";

export function sendDiagnostics() {
    return;
    const diag = window.__DIAG;
    fetch(API_URL() + "/diag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(diag),
    });
}

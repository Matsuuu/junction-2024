import "./location-watcher.js";
import "./image-handler.js";
import "./ifc-element.js";
import { sendDiagnostics } from "./diag.js";
import { FILE_API_URL } from "./request.js";

window.__DIAG = {};

setInterval(() => {
    sendDiagnostics();
}, 3000);

document.addEventListener("submit-photo", (/** @type { CustomEvent } */ e) => {
    const formData = new FormData();
    formData.set("file", e.detail.photo);
    formData.set("filename", `user-posted-image-${new Date().toISOString()}.png`);
    formData.set("x", e.detail.x ?? 0);
    formData.set("y", e.detail.y ?? 0);
    formData.set("w", e.detail.w ?? 100);
    formData.set("h", e.detail.h ?? 10);

    fetch(`${FILE_API_URL()}/file-coordinates`, {
        method: "POST",
        body: formData,
    });
});

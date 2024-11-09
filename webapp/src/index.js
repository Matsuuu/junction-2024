import "./thatopen.js";
import "./location-watcher.js";
import "./image-handler.js";
import { sendDiagnostics } from "./diag.js";

window.__DIAG = {};

setInterval(() => {
    sendDiagnostics();
}, 3000);

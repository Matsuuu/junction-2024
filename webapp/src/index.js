import { getLocation } from "./location.js";
import "./thatopen.js";
import "./location-watcher.js";
import { sendDiagnostics } from "./diag.js";

window.__DIAG = {};

const API_URL = "http://100.121.173.96:3000";
console.log("Foo");

async function ping() {
  const result = await fetch(API_URL + "/ping").then((res) => res.json());

  document.body.innerHTML += JSON.stringify(result);
}

getLocation().then((location) => {
  console.log("LOC", location);
});

setInterval(() => {
  sendDiagnostics();
}, 1000);

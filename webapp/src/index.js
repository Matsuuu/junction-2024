import "./location-watcher.js";
import "./image-handler.js";
import "./ifc-element.js";
import { sendDiagnostics } from "./diag.js";
import { FILE_API_URL } from "./request.js";
import { registerIconLibrary, setBasePath } from "@shoelace-style/shoelace";

window.__DIAG = {};

setInterval(() => {
    sendDiagnostics();
}, 3000);

document.addEventListener("submit-photo", async (/** @type { CustomEvent } */ e) => {
    const formData = new FormData();
    formData.set("file", e.detail.photo);
    formData.set("filename", `user-posted-image-${new Date().toISOString()}.png`);
    formData.set("x", e.detail.x ?? 0);
    formData.set("y", e.detail.y ?? 0);
    formData.set("w", e.detail.w ?? 100);
    formData.set("h", e.detail.h ?? 10);

    // const result = await fetch(`${FILE_API_URL()}/file-coordinates`, {
    //     method: "POST",
    //     body: formData,
    // }).then(res => res.json());

    const testResult = {
        others: ["Mukulaku ja 3, FIN-04300 Tuusula"],
        Tel: " +358-9-274 4000, Fax +358-9-274 40044",
        "Projekti / Project": " 18817",
        "Pvm/Date": " 19.06.2006",
        Tyyppi: " RECAIR 6E",
        Konetunnus: " TK1",
        "Ilmavirta (m3/s)": " 7.2",
    };

    const { others, ...foundResults } = testResult;

    document.querySelector("image-handler").setImageResults({ others, foundResults });
});

setBasePath("https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.16.0/dist");

registerIconLibrary("fa", {
    resolver: name => {
        const filename = name.replace(/^fa[rbs]-/, "");
        let folder = "regular";
        if (name.substring(0, 4) === "fas-") folder = "solid";
        if (name.substring(0, 4) === "fab-") folder = "brands";
        return `https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.6.0/svgs/${folder}/${filename}.svg`;
    },
    mutator: svg => svg.setAttribute("fill", "currentColor"),
});

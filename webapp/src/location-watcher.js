import { html, LitElement } from "lit";
import { getLocation } from "./location";

export class LocationWatcher extends LitElement {
    static get properties() {
        return {
            latitude: { type: Number },
            longitude: { type: Number },
        };
    }

    constructor() {
        super();
        this.latitude = 0;
        this.longitude = 0;

        this.referenceLocation = undefined;
        window.__LOCATION_WATCHER = this;
    }

    get position() {
        return { lat: this.latitude, lng: this.longitude };
    }

    get diff() {
        if (!this.referenceLocation) {
            return { lat: "NOT_SET", lng: "NOT_SET" };
        }
        return {
            lat: this.referenceLocation.lat - this.latitude,
            lng: this.referenceLocation.lng - this.longitude,
        };
    }

    async firstUpdated() {
        const getUserLocation = () => {
            getLocation().then(loc => {
                // Update reference if it's not set
                if (!this.referenceLocation) {
                    this.referenceLocation = {
                        lat: loc.coords.latitude,
                        lng: loc.coords.longitude,
                    };
                }

                this.latitude = loc.coords.latitude;
                this.longitude = loc.coords.longitude;

                // Broadcast change
                this.dispatchEvent(
                    new CustomEvent("location-updated", {
                        detail: { location: this.position, diff: this.diff },
                    }),
                );
                window.__DIAG.location = this.position;
            });
            // Let's just poll every 1s for reactivity
            setTimeout(() => getUserLocation(), 1000);
        };

        getUserLocation();
    }

    render() {
        return html`
            <ul>
                <li>Lat: ${this.latitude}</li>
                <li>Lng: ${this.longitude}</li>
            </ul>

            <p>Diff</p>
            <ul>
                <li>Lat: ${this.diff.lat}</li>
                <li>Lng: ${this.diff.lng}</li>
            </ul>
        `;
    }
}

if (!customElements.get("location-watcher")) {
    customElements.define("location-watcher", LocationWatcher);
}

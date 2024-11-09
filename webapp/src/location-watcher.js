import { Geolocation } from "@capacitor/geolocation";
import { html, LitElement } from "lit";

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
    window.__LOCATION_WATCHER = this;
  }

  get position() {
    return { lat: this.latitude, lng: this.longitude };
  }

  updated(_changedProperties) {
    if (
      _changedProperties.has("latitude") ||
      _changedProperties.has("longitude")
    ) {
      this.dispatchEvent(
        new CustomEvent("location-updated", {
          detail: { location: this.position },
        }),
      );
      window.__DIAG.location = this.position;
    }
  }

  async firstUpdated() {
    await Geolocation.watchPosition(
      { enableHighAccuracy: true },
      (location) => {
        this.latitude = location.coords.latitude;
        this.longitude = location.coords.longitude;
      },
    );
  }

  render() {
    return html`
      <ul>
        <li>Lat: ${this.latitude}</li>
        <li>Lng: ${this.longitude}</li>
      </ul>
    `;
  }
}

if (!customElements.get("location-watcher")) {
  customElements.define("location-watcher", LocationWatcher);
}

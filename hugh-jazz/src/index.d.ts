import { LocationWatcher } from "./location-watcher";

declare global {
  interface Window {
    __LOCATION_WATCHER: LocationWatcher;
    __DIAG: any;
  }
}

import { Geolocation } from "@capacitor/geolocation";

export async function getLocation() {
  const coordinates = await Geolocation.getCurrentPosition();

  console.log("Current position:", coordinates);

  return coordinates;
}

export async function getLocation() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (location) => {
        resolve(location);
      },
      (error) => {
        reject(error);
      },
      { enableHighAccuracy: true },
    );
  });
}

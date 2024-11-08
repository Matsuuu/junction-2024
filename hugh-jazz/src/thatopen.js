import * as THREE from "three";
import * as OBC from "@thatopen/components";
import { getLocation } from "./location.js";

// IT SEEMS that -z would be towards true north. Let's play with that.
const CUBE_SIZE = 1.5;

const boxGeometry = new THREE.SphereGeometry(CUBE_SIZE);
const cubeMaterial = new THREE.MeshStandardMaterial({ color: "#6528D7" });

const components = new OBC.Components();
const CUBE_START_POINT = { x: 12, y: CUBE_SIZE * 2.5, z: 1 };
const cube = new THREE.Mesh(boxGeometry, cubeMaterial);

const worlds = components.get(OBC.Worlds);

const world = worlds.create();
const container = document.querySelector("#thatopen-container");

const fragments = components.get(OBC.FragmentsManager);
const fragmentIfcLoader = components.get(OBC.IfcLoader);

fragmentIfcLoader.setup();

async function initThatOpen() {
  world.scene = new OBC.SimpleScene(components);
  // @ts-ignore
  world.renderer = new OBC.SimpleRenderer(components, container);

  const camera = (world.camera = new OBC.SimpleCamera(components));

  components.init();

  // @ts-ignore
  world.scene.setup();

  // @ts-ignore
  world.scene.three.background = null;
}

async function loadIfc() {
  const file = await fetch(window.location.origin + "/kaapelitehdas.ifc");
  const data = await file.arrayBuffer();
  const buffer = new Uint8Array(data);
  const model = await fragmentIfcLoader.load(buffer);
  model.name = "example";

  world.scene.three.add(model, cube);

  const fragmentBbox = components.get(OBC.BoundingBoxer);
  fragmentBbox.add(model);

  world.camera.controls.fitToSphere(fragmentBbox.getMesh(), true);

  cube.position.x = CUBE_START_POINT.x;
  cube.position.y = CUBE_START_POINT.y;
  cube.position.z = CUBE_START_POINT.z;

  const hoverMaterial = new THREE.MeshStandardMaterial({ color: "#b9ce9f" });
  const casters = components.get(OBC.Raycasters);
  const caster = casters.get(world);

  let previousSelection = null;
  let previousMaterial = null;

  let referenceLocation = undefined;

  window.__LOCATION_WATCHER.addEventListener(
    "location-updated",
    (/** @type { CustomEvent } */ event) => {
      const location = event.detail.location;
      if (!referenceLocation && location.lat > 0) {
        referenceLocation = location;
      }
      /** @type {{ lat: number, lng: number }} */
      console.log("Updated");
      const diff = {
        lat: referenceLocation.lat - location.lat,
        lng: referenceLocation.lng - location.lng,
      };

      console.log("Diff to start position: ", diff);

      const scaledDiff = { z: diff.lat * 100, x: diff.lng * 100 };

      window.__DIAG.diff = diff;
      window.__DIAG.scaledDiff = scaledDiff;
    },
  );

  window.onmousemove = () => {
    const result = caster.castRay([model]);
    if (previousSelection) {
      previousSelection.material = previousMaterial;
    }
    if (!result || !(result.object instanceof THREE.Mesh)) {
      return;
    }

    previousMaterial = result.object.material;
    result.object.material = hoverMaterial;
    previousSelection = result.object;
  };

  window.onclick = () => {
    const result = caster.castRay([model]);
    if (!result || !(result.object instanceof THREE.Mesh)) {
      return;
    }

    console.log(result);
  };
}

initThatOpen();
loadIfc();

window.addEventListener("keydown", (e) => {
  console.log(e.key);
  if (e.key === "ArrowLeft") {
    cube.position.x -= 1;
  }
  if (e.key === "ArrowRight") {
    cube.position.x += 1;
  }
  if (e.key === "ArrowUp") {
    cube.position.z -= 1;
  }
  if (e.key === "ArrowDown") {
    cube.position.z += 1;
  }
});

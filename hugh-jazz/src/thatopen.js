import * as THREE from "three";
import * as OBC from "@thatopen/components";
import tinycolor from "tinycolor2";

const container = document.querySelector("#thatopen-container");

const components = new OBC.Components();

const worlds = components.get(OBC.Worlds);

const world = worlds.create();

world.scene = new OBC.SimpleScene(components);
world.renderer = new OBC.SimpleRenderer(components, container);
world.camera = new OBC.SimpleCamera(components);

components.init();

world.scene.setup();

world.scene.three.background = null;

const fragments = components.get(OBC.FragmentsManager);
const fragmentIfcLoader = components.get(OBC.IfcLoader);

await fragmentIfcLoader.setup();

async function loadIfc() {
  const file = await fetch(window.location.origin + "/kaapelitehdas.ifc");
  const data = await file.arrayBuffer();
  const buffer = new Uint8Array(data);
  const model = await fragmentIfcLoader.load(buffer);
  model.name = "example";
  world.scene.three.add(model);

  const greenMaterial = new THREE.MeshStandardMaterial({ color: "#b9ce9f" });
  const casters = components.get(OBC.Raycasters);
  const caster = casters.get(world);

  let previousSelection = null;
  let previousMaterial = null;

  window.onmousemove = () => {
    const result = caster.castRay([model]);
    if (previousSelection) {
      previousSelection.material = previousMaterial;
    }
    if (!result || !(result.object instanceof THREE.Mesh)) {
      return;
    }

    previousMaterial = result.object.material;
    result.object.material = greenMaterial;
    previousSelection = result.object;
  };

  window.onclick = () => {
    const result = caster.castRay([model]);
    if (!result || !(result.object instanceof THREE.Mesh)) {
      return;
    }
  };
}

loadIfc();

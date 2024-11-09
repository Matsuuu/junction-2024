import {
    BoundingBoxer,
    Components,
    FragmentsManager,
    IfcLoader,
    Raycasters,
    SimpleCamera,
    SimpleScene,
    Worlds,
    SimpleRenderer,
} from "@thatopen/components";
import { Mesh, MeshStandardMaterial, SphereGeometry } from "three";
import { css, html, LitElement } from "lit";

// IT SEEMS that -z would be towards true north. Let's play with that.
const CUBE_SIZE = 1.5;

const boxGeometry = new SphereGeometry(CUBE_SIZE);
const cubeMaterial = new MeshStandardMaterial({ color: "#6528D7" });

const components = new Components();
const worlds = components.get(Worlds);
const world = worlds.create();

const CUBE_START_POINT = { x: 12, y: CUBE_SIZE * 2.5, z: 1 };
const cube = new Mesh(boxGeometry, cubeMaterial);

const fragments = components.get(FragmentsManager);
const fragmentIfcLoader = components.get(IfcLoader);

fragmentIfcLoader.setup();

export class IfcElement extends LitElement {
    firstUpdated() {
        this.init();
    }

    init() {
        const container = this.shadowRoot.querySelector("#thatopen-container");

        world.scene = new SimpleScene(components);
        // @ts-ignore
        world.renderer = new SimpleRenderer(components, container);

        world.camera = new SimpleCamera(components);

        components.init();

        // @ts-ignore
        world.scene.setup();

        // @ts-ignore
        world.scene.three.background = null;

        this.loadIfc();
    }

    async loadIfc() {
        const file = await fetch(window.location.origin + "/kaapelitehdas.ifc");
        const data = await file.arrayBuffer();
        const buffer = new Uint8Array(data);
        const model = await fragmentIfcLoader.load(buffer);
        model.name = "example";

        world.scene.three.add(model, cube);

        const fragmentBbox = components.get(BoundingBoxer);
        fragmentBbox.add(model);

        world.camera.controls.fitToSphere(fragmentBbox.getMesh(), true);

        cube.position.x = CUBE_START_POINT.x;
        cube.position.y = CUBE_START_POINT.y;
        cube.position.z = CUBE_START_POINT.z;
        const cubeReferencePosition = { ...cube.position };

        const hoverMaterial = new MeshStandardMaterial({ color: "#b9ce9f" });
        const casters = components.get(Raycasters);
        const caster = casters.get(world);

        let previousSelection = null;
        let previousMaterial = null;

        window.onmousemove = () => {
            const result = caster.castRay([model]);
            if (previousSelection) {
                previousSelection.material = previousMaterial;
            }
            if (!result || !(result.object instanceof Mesh)) {
                return;
            }

            previousMaterial = result.object.material;
            result.object.material = hoverMaterial;
            previousSelection = result.object;
        };

        window.onclick = () => {
            const result = caster.castRay([model]);
            if (!result || !(result.object instanceof Mesh)) {
                return;
            }

            console.log(result);
        };

        window.__LOCATION_WATCHER.addEventListener("location-updated", (/** @type { CustomEvent } */ event) => {
            const { location, diff } = event.detail;

            const MULTIPLIER = 10000;
            cube.position.z = cubeReferencePosition.z + diff.lat * MULTIPLIER;
            cube.position.x = cubeReferencePosition.x + diff.lng * MULTIPLIER;
        });
    }

    render() {
        return html` <div id="thatopen-container"></div> `;
    }

    static get styles() {
        return css``;
    }
}

if (!customElements.get("ifc-element")) {
    customElements.define("ifc-element", IfcElement);
}

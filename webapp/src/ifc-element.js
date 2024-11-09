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

// const CUBE_START_POINT = { x: 12, y: CUBE_SIZE * 2.5, z: 1 };
const CUBE_START_POINT = { x: 0, y: 2, z: 0 };
const COORDINATE_ZERO_POINT = { lat: 60.16145136865442, lng: 24.902894420257443 };

/**
 * @typedef Coordinates
 * @prop { number } lat
 * @prop { number } lng
 * */

/**
 * @typedef Geometry
 * @prop { number } x
 * @prop { number } z
 * */

function coordinateOffsetToGeometryOffset(coordinates) {
    const offset = {
        lat: COORDINATE_ZERO_POINT.lat - coordinates.lat,
        lng: COORDINATE_ZERO_POINT.lng - coordinates.lng,
    };

    const MODIFIER = 40000;
    return {
        x: offset.lng * MODIFIER,
        z: offset.lat * MODIFIER,
    };
}

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

        const cubePosition = CUBE_START_POINT;

        const offset = coordinateOffsetToGeometryOffset({ lat: 60.16175136865442, lng: 24.902894420257443 });
        console.log("Off", offset);
        cubePosition.z += offset.z;
        cubePosition.x += offset.x;

        cube.position.x = cubePosition.x;
        cube.position.y = cubePosition.y;
        cube.position.z = cubePosition.z;
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
            // cube.position.z = cubeReferencePosition.z + diff.lat * MULTIPLIER;
            // cube.position.x = cubeReferencePosition.x + diff.lng * MULTIPLIER;
        });
    }

    render() {
        return html` <div id="thatopen-container"></div> `;
    }

    static get styles() {
        return css`
            :host {
                display: flex;
                width: 100%;
                height: 100%;
            }

            #thatopen-container {
                width: 100%;
                height: 100%;
            }
        `;
    }
}

if (!customElements.get("ifc-element")) {
    customElements.define("ifc-element", IfcElement);
}

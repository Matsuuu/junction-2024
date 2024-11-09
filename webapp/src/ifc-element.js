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
import { BoxGeometry, Mesh, MeshStandardMaterial, SphereGeometry } from "three";
import { css, html, LitElement } from "lit";
import { API_URL } from "./request";

// IT SEEMS that -z would be towards true north. Let's play with that.
const CUBE_SIZE = 1;

const cubes = [];
const cubeItemMap = new Map();

const boxGeometry = new BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
const cubeMaterial = new MeshStandardMaterial({ color: "#6528D7" });

const components = new Components();
const worlds = components.get(Worlds);
const world = worlds.create();

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

function coordinateOffsetToGeometryOffset(coordinates, modifier = 55000) {
    const offset = {
        lat: COORDINATE_ZERO_POINT.lat - coordinates.lat,
        lng: coordinates.lng - COORDINATE_ZERO_POINT.lng,
    };

    return {
        x: offset.lng * modifier,
        z: offset.lat * modifier * 2,
    };
}

/**
 * @param {Coordinates} position
 */
function createCube(position, item) {
    const cube = new Mesh(boxGeometry, cubeMaterial);

    const offset = coordinateOffsetToGeometryOffset(position);
    cube.position.x = offset.x;
    cube.position.z = offset.z;
    cube.position.y = 3;

    world.scene.three.add(cube);
    cubes.push(cube);

    cube.userData.item = item;
    cubeItemMap.set(cube.id, item);
}

const cube = new Mesh(boxGeometry, cubeMaterial);

const fragments = components.get(FragmentsManager);
const fragmentIfcLoader = components.get(IfcLoader);

fragmentIfcLoader.setup();

export class IfcElement extends LitElement {
    static get properties() {
        return {
            selectedItem: { type: Object },
        };
    }

    constructor() {
        super();
        this.selectedItem = undefined;
        this.selectedCube = undefined;
    }

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
            const result = caster.castRay([...cubes]);
            if (previousSelection && previousSelection !== this.selectedCube) {
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
            const result = caster.castRay([...cubes]);
            if (!result || !(result.object instanceof Mesh)) {
                return;
            }

            this.selectedItem = cubeItemMap.get(result.object.id);

            if (this.selectedCube) {
                this.selectedCube.material = cubeMaterial;
            }
            this.selectedCube = result.object;
            this.selectedCube.material = hoverMaterial;
        };

        this.loadItems();
    }

    async loadItems() {
        const response = await fetch(API_URL() + "/items").then(res => res.json());

        cubes.forEach(cube => cube.remove());

        console.log(response);
        const lastItem = response.items.at(-1);
        console.log("Last:", lastItem);

        const offset = coordinateOffsetToGeometryOffset({ lat: lastItem.lat, lng: lastItem.lon });
        cube.position.x = offset.x;
        cube.position.z = offset.z;

        window.addEventListener("keydown", e => {
            if (e.key === "ArrowDown") {
                cube.position.z -= 1;
            }
            if (e.key === "ArrowUp") {
                cube.position.z += 1;
            }
        });

        response.items.forEach(item => {
            createCube({ lat: item.lat, lng: item.lon }, item);
        });
    }

    render() {
        return html`
            <div id="thatopen-container"></div>
            ${this.selectedItem
                ? html`
                      <div class="selected-item">
                          ${[...Object.entries(this.selectedItem)].map(
                              ([key, value]) => html` <p><span>${key}:</span> ${value}</p> `,
                          )}
                      </div>
                  `
                : ""}
        `;
    }

    static get styles() {
        return css`
            :host {
                display: flex;
                width: 100%;
                height: 100%;
                flex-direction: column;
                position: relative;
            }

            #thatopen-container {
                width: 100%;
                height: 100%;
            }

            .selected-item {
                position: absolute;
                top: 0;
                left: 0;
                padding: 1rem;
                display: flex;
                flex-direction: column;
                gap: 0.2rem;
                background: rgba(255, 255, 255, 0.9);
            }

            .selected-item p {
                margin: 0;
                display: flex;
                justify-content: space-between;
                gap: 1rem;
            }

            .selected-item span {
                display: inline-block;
                padding-right: 1rem;
            }
        `;
    }
}

if (!customElements.get("ifc-element")) {
    customElements.define("ifc-element", IfcElement);
}

import { css, html, LitElement } from "lit";
import "@shoelace-style/shoelace/dist/components/button/button.js";
import "@shoelace-style/shoelace/dist/components/icon/icon.js";
import "@shoelace-style/shoelace/dist/components/input/input.js";

export class ImageHandler extends LitElement {
    static get properties() {
        return {
            currentImage: { type: Object },
        };
    }

    constructor() {
        super();
        this.currentImage = undefined;

        this.isDrawing = false;

        this.rectStart = undefined;
        this.drawedRect = undefined;

        this.imageResults = undefined;
    }

    firstUpdated() {
        this.initVideo();
    }

    /** @returns { HTMLCanvasElement } */
    get imageCanvas() {
        return this.shadowRoot.querySelector("canvas#img-canvas");
    }

    /** @returns { HTMLCanvasElement } */
    get drawingCanvas() {
        return this.shadowRoot.querySelector("canvas#drawing-canvas");
    }

    /** @returns { HTMLVideoElement } */
    get video() {
        return this.shadowRoot.querySelector("video");
    }

    async initVideo() {
        this.video.addEventListener(
            "canplay",
            ev => {
                const videoWidth = this.video.clientWidth;
                const videoHeight = this.video.clientHeight;

                this.imageCanvas.setAttribute("width", videoWidth + "");
                this.imageCanvas.setAttribute("height", videoHeight + "");
                this.drawingCanvas.setAttribute("width", videoWidth + "");
                this.drawingCanvas.setAttribute("height", videoHeight + "");

                this.video.parentElement.style.height = videoHeight + "px";
            },
            false,
        );

        const stream = await navigator.mediaDevices
            .getUserMedia({
                video: { facingMode: "environment" },
                audio: false,
            })
            .catch(ex => console.error(ex));
        if (stream) {
            this.video.srcObject = stream;
            this.video.play();
        }
    }

    get videoHeight() {
        return this.video.clientHeight;
    }

    get videoWidth() {
        return this.video.clientWidth;
    }

    takePhoto() {
        const canvas = this.shadowRoot.querySelector("canvas");
        const video = this.shadowRoot.querySelector("video");

        const context = canvas.getContext("2d");
        if (this.videoWidth && this.videoHeight) {
            context.drawImage(video, 0, 0, this.videoWidth, this.videoHeight);

            const data = canvas.toDataURL("image/png");
            this.currentImage = data;
        }
    }

    clearPhoto() {
        this.currentImage = undefined;
        this.drawedRect = undefined;

        this.clearDrawing();
    }

    clearDrawing() {
        this.isDrawing = false;
        this.drawingCanvas.getContext("2d").clearRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
        this.imageCanvas.getContext("2d").clearRect(0, 0, this.imageCanvas.width, this.imageCanvas.height);
    }

    /**
     * @param {number} clientX
     * @param {number} clientY
     * @param {HTMLElement} target
     */
    getMousePositionInsideElement(clientX, clientY, target) {
        const rect = target.getBoundingClientRect();

        // position within the element.
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        return { x, y };
    }
    /**
     * @param {TouchEvent} e
     */
    onTouchStart(e) {
        const touch = e.touches[0];
        this.onCanvasDrawStart(touch.clientX, touch.clientY, /** @type { HTMLElement } */ (e.target));
    }

    /**
     * @param {TouchEvent} e
     */
    onTouchMove(e) {
        const touch = e.touches[0];
        this.onCanvasPointerMove(touch.clientX, touch.clientY, /** @type { HTMLElement } */ (e.target));
    }

    /**
     * @param {TouchEvent} e
     */
    onTouchEnd(e) {
        const touch = e.changedTouches[0];
        this.onCanvasDrawEnd(touch.clientX, touch.clientY, /** @type { HTMLElement } */ (e.target));
    }

    /**
     * @param { MouseEvent} e
     * */
    onMouseDown(e) {
        this.onCanvasDrawStart(e.clientX, e.clientY, /** @type { HTMLElement } */ (e.target));
    }
    /**
     * @param { MouseEvent} e
     * */
    onMouseMove(e) {
        this.onCanvasPointerMove(e.clientX, e.clientY, /** @type { HTMLElement } */ (e.target));
    }
    /**
     * @param { MouseEvent} e
     * */
    onMouseUp(e) {
        this.onCanvasDrawEnd(e.clientX, e.clientY, /** @type { HTMLElement } */ (e.target));
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {HTMLElement} target
     */
    onCanvasPointerMove(x, y, target) {
        if (!this.isDrawing) {
            return;
        }

        const mousePosition = this.getMousePositionInsideElement(x, y, target);
        const width = mousePosition.x - this.rectStart.x;
        const height = mousePosition.y - this.rectStart.y;

        const ctx = this.drawingCanvas.getContext("2d");

        ctx.clearRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
        ctx.strokeRect(this.rectStart.x, this.rectStart.y, width, height);
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {HTMLElement} target
     */
    onCanvasDrawStart(x, y, target) {
        this.isDrawing = true;

        const mousePosition = this.getMousePositionInsideElement(x, y, target);
        this.rectStart = mousePosition;

        const ctx = this.drawingCanvas.getContext("2d");
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#ff0000";
        ctx.clearRect(0, 0, this.imageCanvas.width, this.imageCanvas.height);
        ctx.beginPath();
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {HTMLElement} target
     */
    onCanvasDrawEnd(x, y, target) {
        this.isDrawing = false;

        const mousePosition = this.getMousePositionInsideElement(x, y, target);
        const width = mousePosition.x - this.rectStart.x;
        const height = mousePosition.y - this.rectStart.y;

        this.drawedRect = {
            x: this.rectStart.x,
            y: this.rectStart.y,
            w: width,
            h: height,
        };
    }

    submitPhoto() {
        const compressedImage = this.imageCanvas.toDataURL("image/jpeg", 0.3);

        this.dispatchEvent(
            new CustomEvent("submit-photo", {
                detail: {
                    photo: compressedImage,
                    ...this.drawedRect,
                },
                bubbles: true,
            }),
        );
    }

    setImageResults({ others, foundResults }) {
        console.log("Setting image results");
        this.imageResults = {
            others: others ?? [],
            foundResults: foundResults ?? {},
        };

        this.requestUpdate();
    }

    /**
     * @param {InputEvent} e
     */
    async onFileUpload(e) {
        const file = e.target.files[0];

        const reader = new FileReader();

        reader.onload = () => {
            const fileUrl = reader.result;

            const ctx = this.imageCanvas.getContext("2d");

            const image = new Image();
            image.onload = () => {
                const widthRatio = image.width / this.videoWidth;

                const imageWidth = this.videoWidth;
                const imageHeight = image.height / widthRatio;

                // Resize image to fit. THen we can use that image to make the actual shippable img
                ctx.drawImage(image, 0, 0, imageWidth, imageHeight);

                this.currentImage = this.imageCanvas.toDataURL(file.type);
            };
            image.src = fileUrl;
        };

        //const compressedFile = await compressImage(file, { quality: 0.5 });
        reader.readAsDataURL(file);
    }

    onFoundResultsSubmit(event) {
        event.preventDefault();

        // TODO: Send to DB
        this.imageResults = undefined;
        this.clearPhoto();
    }

    render() {
        return html`
            <div class="camera">
                <div class="video-wrapper">
                    <video ?hidden=${this.currentImage}>Loading video source...</video>
                </div>
            </div>

            <div class="editing-canvas" ?hidden=${!this.currentImage}>
                <canvas id="img-canvas"></canvas>
                <canvas
                    id="drawing-canvas"
                    @mousedown=${this.onMouseDown}
                    @mouseup=${this.onMouseUp}
                    @mousemove=${this.onMouseMove}
                    @touchstart=${this.onTouchStart}
                    @touchmove=${this.onTouchMove}
                    @touchend=${this.onTouchEnd}
                ></canvas>
            </div>

            ${!this.imageResults
                ? html`
                      <div class="camera-controls">
                          ${this.currentImage
                              ? html`
                                    <sl-button @click=${this.clearPhoto}>Clear photo</sl-button>
                                    <sl-button @click=${this.submitPhoto}>Submit photo</sl-button>
                                `
                              : html`
                                    <sl-button id="take-photo" @click=${this.takePhoto}>
                                        <sl-icon library="fa" name="fas-camera"></sl-icon>
                                    </sl-button>

                                    <sl-input type="file">
                                        <sl-icon slot="prefix" library="fa" name="fas-file-arrow-up"></sl-icon>
                                    </sl-input>
                                `}
                      </div>
                  `
                : html`
                      <form class="image-results" @submit=${this.onFoundResultsSubmit}>
                          <p>Found matches:</p>
                          ${[...Object.entries(this.imageResults.foundResults)].map(
                              ([key, value]) => html`
                                  <sl-input label="${key}" type="text" value="${value}"></sl-input>
                              `,
                          )}

                          <p>Metadata</p>

                          ${this.imageResults.others.map(
                              other => html` <sl-input type="text" value="${other}"></sl-input> `,
                          )}

                          <sl-button type="submit" label="" variant="primary">Submit</sl-button>
                      </form>
                  `}
        `;
    }

    static get styles() {
        return css`
            :host {
                display: flex;
                width: 100%;
                position: relative;
                height: 100%;
                flex-direction: column;
                align-items: center;
            }

            .camera {
                display: flex;
                flex-direction: column;
                width: 100%;
            }

            .video-wrapper {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            video {
                height: 100%;
                width: 100%;
            }
            .camera-controls {
                position: absolute;
                bottom: 1rem;
                background: #fff;
                display: flex;
                padding: 1rem;
                width: 100%;
                z-index: 100;
                justify-content: space-between;
                gap: 2rem;
                box-sizing: border-box;
            }

            .editing-canvas {
                position: absolute;
                top: 0;
                left: 0;
            }

            .editing-canvas * {
                position: absolute;
                top: 0;
                left: 0;
            }

            canvas {
                touch-action: none;
            }

            *[hidden] {
                opacity: 0;
                pointer-events: none;
            }

            .image-results {
                display: flex;
                flex-direction: column;
                width: 100%;
                gap: 0.5rem;
                font-size: 1.6rem;
                margin-top: 2rem;
                padding: 1rem;
                box-sizing: border-box;
            }

            .image-results p {
                font-weight: bold;
            }

            .image-results input {
                font-size: 1.6rem;
            }

            sl-input[type="file"]::part(input) {
                opacity: 0;
            }

            sl-icon {
                color: #000;
            }

            .camera-controls #take-photo,
            .camera-controls sl-input {
                width: 3rem;
            }
        `;
    }
}

if (!customElements.get("image-handler")) {
    customElements.define("image-handler", ImageHandler);
}

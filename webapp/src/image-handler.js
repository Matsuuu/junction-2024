import { css, html, LitElement } from "lit";

export class ImageHandler extends LitElement {
    static get properties() {
        return {
            currentImage: { type: Object },
        };
    }

    constructor() {
        super();
        this.videoHeight = 0;
        this.videoWidth = 400;

        this.currentImage = undefined;

        this.isDrawing = false;

        this.rectStart = undefined;
        this.drawedRect = undefined;
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
                const width = 400;
                this.videoHeight = (this.video.videoHeight / this.video.videoWidth) * this.videoWidth;
                //this.videoHeight = 0.75 * width;

                this.video.setAttribute("width", this.videoWidth + "");
                this.video.setAttribute("height", this.videoHeight + "");
                this.imageCanvas.setAttribute("width", this.videoWidth + "");
                this.imageCanvas.setAttribute("height", this.videoHeight + "");
                this.drawingCanvas.setAttribute("width", this.videoWidth + "");
                this.drawingCanvas.setAttribute("height", this.videoHeight + "");
            },
            false,
        );

        const stream = await navigator.mediaDevices
            .getUserMedia({
                video: true,
                audio: false,
            })
            .catch(ex => console.error(ex));
        if (stream) {
            this.video.srcObject = stream;
            this.video.play();
        }
    }

    takePhoto() {
        const canvas = this.shadowRoot.querySelector("canvas");
        const video = this.shadowRoot.querySelector("video");
        const photo = this.shadowRoot.querySelector("img");

        const context = canvas.getContext("2d");
        if (this.videoWidth && this.videoHeight) {
            context.drawImage(video, 0, 0, this.videoWidth, this.videoHeight);

            const data = canvas.toDataURL("image/png");
            photo.setAttribute("src", data);
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
        const touch = e.touches[0];
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

    render() {
        return html`
            <div class="camera">
                <video>Loading video source...</video>

                <div class="camera-controls">
                    ${this.currentImage
                        ? html` <button @click=${this.clearPhoto}>Clear photo</button> `
                        : html` <button @click=${this.takePhoto}>Take a photo</button> `}
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

            <div class="output-image">
                <img style="display: none" />
            </div>
        `;
    }

    static get styles() {
        return css`
            :host {
                display: flex;
                width: 100%;
                position: relative;
            }

            .camera {
                display: flex;
                width: 100%;
            }

            .camera-controls {
                display: flex;
                flex-direction: column;
            }

            .editing-canvas {
                position: absolute;
                top: 0;
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
                visibility: hidden;
            }
        `;
    }
}

if (!customElements.get("image-handler")) {
    customElements.define("image-handler", ImageHandler);
}

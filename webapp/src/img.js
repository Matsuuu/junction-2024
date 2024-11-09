// Thank mr stack overflow
export async function compressImage(file, { quality = 1, type = file.type }) {
    // Get as image data
    const imageBitmap = await createImageBitmap(file);

    // Draw to canvas
    const canvas = document.createElement("canvas");
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(imageBitmap, 0, 0);

    // Turn into Blob
    const blob = await new Promise(resolve => canvas.toBlob(resolve, type, quality));

    // Turn Blob into File
    return new File([blob], file.name, {
        type: blob.type,
    });
}

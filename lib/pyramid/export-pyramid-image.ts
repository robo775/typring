export async function downloadSvgAsPng(svgElement: SVGSVGElement, fileName: string) {
  const serializer = new XMLSerializer();
  const source = serializer.serializeToString(svgElement);
  const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  try {
    const image = await loadImage(url);
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 1200;

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("canvas_context_missing");
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const pngUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = fileName;
    link.href = pngUrl;
    link.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("image_load_failed"));
    image.src = src;
  });
}

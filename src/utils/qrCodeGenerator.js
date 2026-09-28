import QRCode from "qrcode";

// Payload builders (WiFi, vCard, UPI, ...) live in src/qrTypes/registry.mjs.
// This module only turns a payload string plus the customisation form values
// into an image.

export const generateQRCode = async (qrData, options) => {
  const qrOptions = {
    version: options.optionVersion,
    type: options.optionImageType,
    quality: options.optionQuality,
    margin: options.optionMargin,
    color: {
      dark:
        typeof options.optionDarkColor === "string"
          ? options.optionDarkColor
          : options.optionDarkColor.toHexString(),
      light:
        typeof options.optionLightColor === "string"
          ? options.optionLightColor
          : options.optionLightColor.toHexString(),
    },
    scale: options.optionScale,
    maskPattern: options.optionMaskPattern,
    width: options.optionWidth,
    errorCorrectionLevel: options.errorCorrectionLevel || "M",
  };

  try {
    // Handle SVG separately: qrcode library uses toString with type: 'svg'
    if (options.optionImageType === "image/svg+xml") {
      const svgString = await QRCode.toString(qrData, {
        ...qrOptions,
        type: "svg",
      });

      // Build a data URL for the SVG so it can render in an <img>
      const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
        svgString
      )}`;
      return { url: svgDataUrl, mime: "image/svg+xml" };
    }

    // Raster formats (png, jpeg, webp)
    const dataUrl = await QRCode.toDataURL(qrData, qrOptions);
    return { url: dataUrl, mime: options.optionImageType || "image/png" };
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw error;
  }
};

export const getDefaultQRCodeOptions = () => ({
  optionImageType: "image/png",
  optionMargin: 2,
  optionQuality: 1,
  optionDarkColor: "#392B58",
  optionLightColor: "#ebe9ee",
  optionMaskPattern: 2,
  optionWidth: 600,
  errorCorrectionLevel: "M",
});

import fetch from "node-fetch";
import { FormData } from "formdata-node";
import { getToken } from "./TokenService.js";

export async function sendPostRequestForTrueColorImage(coordinates) {
  const token = await getToken();
  const request_data = {
    input: {
      bounds: {
        properties: {
          crs: "http://www.opengis.net/def/crs/OGC/1.3/CRS84",
        },
        geometry: {
          type: "Polygon",
          coordinates: [coordinates],
        },
      },
      data: [
        {
          type: "sentinel-2-l1c",
          dataFilter: {
            timeRange: {
              from: "2024-05-01T00:00:00Z",
              to: "2024-05-05T00:00:00Z",
            },
          },
        },
      ],
    },
    output: {
      width: 512,
      height: 512,
    },
  };

  const evalscript = `
//VERSION=3
function setup() {
  return {
    input: ["B02", "B03", "B04"],
    output: {
      bands: 3,
      sampleType: "AUTO"
     }
  }
}

function evaluatePixel(sample) {
  return [2.5 * sample.B04, 2.5 * sample.B03, 2.5 * sample.B02];
}`;

  const form = new FormData();
  form.append("request", JSON.stringify(request_data));
  form.append("evalscript", evalscript);

  const response = await fetch(
    "https://services.sentinel-hub.com/api/v1/process",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    }
  );

  const contentType = response.headers.get("Content-Type");
  if (contentType.includes("application/json")) {
    const result = await response.json();
    console.error(result);
    return null;
  } else if (
    contentType.includes("image/png") ||
    contentType.includes("application/octet-stream")
  ) {
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer);
  } else {
    console.error("Received unexpected content type:", contentType);
    return null;
  }
}

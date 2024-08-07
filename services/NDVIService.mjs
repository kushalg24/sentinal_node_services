import fetch from 'node-fetch';
import { FormData } from 'formdata-node';
import fs from 'fs';
import { getToken } from './TokenService.mjs';
import { uploadToCms } from './uploadToCms.mjs';

function getUniqueFilename() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `ndvi-${timestamp}.jpg`;
}

export async function sendPostRequest(coordinates) {
  const token = await getToken();

  // Validate coordinates
  if (coordinates.flat().includes(null)) {
    console.error('Invalid coordinates:', coordinates);
    throw new Error('Invalid coordinates generated');
  }

  const request_data = {
    input: {
      bounds: {
        properties: {
          crs: 'http://www.opengis.net/def/crs/OGC/1.3/CRS84'
        },
        geometry: {
          type: 'Polygon',
          coordinates: [coordinates]
        }
      },
      data: [
        {
          type: 'sentinel-2-l1c',
          dataFilter: {
            timeRange: {
              from: '2024-05-01T00:00:00Z',
              to: '2024-05-05T00:00:00Z'
            }
          }
        }
      ]
    },
    output: {
      width: 512,
      height: 512,
      responses: [
        {
          identifier: 'default',
          format: {
            type: 'image/jpeg',
            quality: 80
          }
        }
      ]
    }
  };

  const evalscript = `
//VERSION=3
function setup() {
  return {
    input: ["B04", "B08"],
    output: {
      id: "default",
      bands: 3
    }
  };
}

function evaluatePixel(sample) {
  let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);

  if (ndvi < -0.5) return [0.05, 0.05, 0.05];
  else if (ndvi < -0.2) return [0.75, 0.75, 0.75];
  else if (ndvi < -0.1) return [0.86, 0.86, 0.86];
  else if (ndvi < 0) return [0.92, 0.92, 0.92];
  else if (ndvi < 0.025) return [1, 0.98, 0.8];
  else if (ndvi < 0.05) return [0.93, 0.91, 0.71];
  else if (ndvi < 0.075) return [0.87, 0.85, 0.61];
  else if (ndvi < 0.1) return [0.8, 0.78, 0.51];
  else if (ndvi < 0.125) return [0.74, 0.72, 0.42];
  else if (ndvi < 0.15) return [0.69, 0.76, 0.38];
  else if (ndvi < 0.175) return [0.64, 0.8, 0.35];
  else if (ndvi < 0.2) return [0.57, 0.75, 0.32];
  else if (ndvi < 0.25) return [0.5, 0.7, 0.28];
  else if (ndvi < 0.3) return [0.44, 0.64, 0.25];
  else if (ndvi < 0.35) return [0.38, 0.59, 0.21];
  else if (ndvi < 0.4) return [0.31, 0.54, 0.18];
  else if (ndvi < 0.45) return [0.25, 0.49, 0.14];
  else if (ndvi < 0.5) return [0.19, 0.43, 0.11];
  else if (ndvi < 0.55) return [0.13, 0.38, 0.07];
  else if (ndvi < 0.6) return [0.06, 0.33, 0.04];
  else return [0, 0.27, 0];
}`;

  const form = new FormData();
  form.append('request', JSON.stringify(request_data));
  form.append('evalscript', evalscript);

  const response = await fetch('https://services.sentinel-hub.com/api/v1/process', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: form
  });

  const contentType = response.headers.get('Content-Type');
  if (contentType.includes('application/json')) {
    const result = await response.json();
    console.error(result);
    return null;
  } else if (contentType.includes('image/jpeg') || contentType.includes('application/octet-stream')) {
    const buffer = await response.arrayBuffer();
    const localFilePath = getUniqueFilename();
    fs.writeFileSync(localFilePath, Buffer.from(buffer));

    try {
      const cdnUrl = await uploadToCms(localFilePath);
      fs.unlinkSync(localFilePath);
      return cdnUrl;
    } catch (error) {
      console.error('Error uploading file to CMS:', error);
      throw error;
    }
  } else {
    console.error('Received unexpected content type:', contentType);
    return null;
  }
}

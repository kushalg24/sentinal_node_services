import fetch from 'node-fetch';
import { getToken } from './TokenService.mjs';

export async function getStatistics(coordinates) {
    const token = await getToken();

    // Log coordinates
    // console.log('StatisticsService coordinates:', coordinates);

    // Validate coordinates
    if (coordinates.flat().includes(null)) {
        console.error('Invalid coordinates:', coordinates);
        throw new Error('Invalid coordinates generated');
    }

    const requestData = {
        input: {
            bounds: {
                geometry: {
                    type: "Polygon",
                    coordinates: [coordinates]
                },
                properties: {
                    crs: "http://www.opengis.net/def/crs/EPSG/0/32633"
                }
            },
            data: [
                {
                    type: "sentinel-2-l2a",
                    dataFilter: {
                        mosaickingOrder: "leastCC"
                    }
                }
            ]
        },
        aggregation: {
            timeRange: {
                from: "2024-06-01T00:00:00Z",
                to: "2024-07-18T00:00:00Z"
            },
            aggregationInterval: {
                of: "P30D"
            },
            evalscript: `//VERSION=3
function setup() {
  return {
    input: [{
      bands: [
        "B04",
        "B08",
        "SCL",
        "dataMask"
      ]
    }],
    output: [
      {
        id: "data",
        bands: 1
      },
      {
        id: "dataMask",
        bands: 1
      }]
  }
}

function evaluatePixel(samples) {
    let ndvi = (samples.B08 - samples.B04)/(samples.B08 + samples.B04)

    var validNDVIMask = 1
    if (samples.B08 + samples.B04 == 0 ){
        validNDVIMask = 0
    }

    var noWaterMask = 1
    if (samples.SCL == 6 ){
        noWaterMask = 0
    }

    return {
        data: [ndvi],
        dataMask: [samples.dataMask * validNDVIMask * noWaterMask]
    }
}`,
            resx: 10,
            resy: 10
        }
    };

    const response = await fetch('https://services.sentinel-hub.com/api/v1/statistics', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Statistics API Request Failed: ${errorText}`);
    }

    const result = await response.json();
    const stats = result.data[0]?.outputs?.data?.bands?.B0?.stats;

    if (!stats) {
        throw new Error('Invalid response from Statistics API: stats not found');
    }

    return stats;
}

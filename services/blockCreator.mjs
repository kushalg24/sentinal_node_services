// src/services/blockCreator.mjs
export function createBlocks(bbox, blockAreaKm2 = 100) {
  const [minLon, minLat, maxLon, maxLat] = bbox;
  const earthRadiusKm = 6371;

  function kmToLat(km) {
    return km / (earthRadiusKm * (Math.PI / 180));
  }

  function kmToLon(km, latitude) {
    return (
      km /
      (earthRadiusKm * (Math.PI / 180) * Math.cos((latitude * Math.PI) / 180))
    );
  }

  const blockWidthKm = Math.sqrt(blockAreaKm2);
  const blockHeightKm = Math.sqrt(blockAreaKm2);

  const blocks = {};
  let index = 1;
  let lat = minLat;

  while (lat < maxLat) {
    let lon = minLon;
    while (lon < maxLon) {
      const nextLat = lat + kmToLat(blockHeightKm);
      const nextLon = lon + kmToLon(blockWidthKm, lat);

      const topLat = Math.min(nextLat, maxLat);
      const rightLon = Math.min(nextLon, maxLon);

      blocks[index] = {
        coordinates: [
          [lon, lat],
          [rightLon, lat],
          [rightLon, topLat],
          [lon, topLat],
          [lon, lat],
        ]
      };

      lon = nextLon;
      index++;
    }
    lat = lat + kmToLat(blockHeightKm);
  }

  return blocks;
}



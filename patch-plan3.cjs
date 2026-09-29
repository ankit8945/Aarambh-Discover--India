const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const targetStr = `  // 2. Railway Stations and Available Trains
  const originStation = resolveNearestStationInfo(fromMeta.placeName, fromMeta.lat, fromMeta.lon);
  const destStation = resolveNearestStationInfo(toMeta.placeName, toMeta.lat, toMeta.lon);
  const availableTrains = findMatchingTrains(fromMeta.placeName, toMeta.placeName, tripDate);`;

const replacementStr = `  // 2. Railway Stations and Available Trains
  let originStation = resolveNearestStationInfo(fromMeta.placeName, fromMeta.lat, fromMeta.lon);
  let destStation = resolveNearestStationInfo(toMeta.placeName, toMeta.lat, toMeta.lon);
  let availableTrains = findMatchingTrains(fromMeta.placeName, toMeta.placeName, tripDate);

  try {
    const ai = getGenAI();
    if (ai && (originStation.code === 'STN' || destStation.code === 'STN' || availableTrains.length === 0)) {
      const p = \`You are an expert Indian Railways navigator.
For a trip from "\${fromMeta.placeName}" to "\${toMeta.placeName}", provide the nearest major railway stations and one realistic train that connects them.
Return ONLY a valid JSON object matching this schema:
{
  "originStation": { "name": "Station Name", "code": "CODE", "lat": number, "lon": number },
  "destStation": { "name": "Station Name", "code": "CODE", "lat": number, "lon": number },
  "train": {
    "trainNumber": "12345",
    "trainName": "Express Name",
    "departureTime": "08:00 AM",
    "arrivalTime": "04:00 PM",
    "durationHours": 8,
    "distanceKm": 500,
    "classes": ["3A", "2A", "SL"],
    "daysOfRun": ["Daily"]
  }
}\`;
      const rawStationInfo = await callGeminiWithFallback({
        contents: p,
        config: { temperature: 0.1, responseMimeType: 'application/json' }
      });
      if (rawStationInfo) {
        const info = JSON.parse(rawStationInfo);
        if (info.originStation) {
          originStation = { ...originStation, ...info.originStation };
        }
        if (info.destStation) {
          destStation = { ...destStation, ...info.destStation };
        }
        if (info.train) {
          availableTrains = [{
            ...info.train,
            originStation: originStation.name,
            originStationCode: originStation.code,
            destinationStation: destStation.name,
            destinationStationCode: destStation.code
          }];
        }
      }
    }
  } catch (e) {
    console.warn('AI station fallback failed:', e);
  }
`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('server.ts', code, 'utf-8');
console.log('patched 3');

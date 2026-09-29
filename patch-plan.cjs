const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const targetStr = `  // Generate Connected Days
  const days: any[] = [];
  const dayThemes = [`;

const replacementStr = `  // Generate Connected Days
  let generatedDays: any[] = [];
  try {
    const ai = getGenAI();
    if (ai) {
      const p = \`You are the master intelligent cultural trip orchestrator for AARAMBH.
Plan a realistic \${daysCount}-day itinerary for \${toMeta.placeName}, India.
Arrival Date: \${tripDate}
Number of Travelers: \${travelers}
Budget Level: \${budget}
Interests: \${userInterests.join(', ')}

GUIDELINES:
1. Provide exactly \${daysCount} day objects in an array.
2. For each day, include:
   - "dayNumber" (1 to \${daysCount})
   - "theme": "A cultural theme for the day"
   - "transitNotes": "Short local transport notes"
   - "activities": array of 3 activities.
3. Each activity must have:
   - "time": e.g. "09:00 AM"
   - "placeTitle": "Real heritage site, bazaar, or guild in \${toMeta.placeName}"
   - "durationMinutes": number
   - "description": "Authentic description of the cultural memory or history"
   - "culturalCategory": "Monument & Archival Heritage" or "Living Artisan & Craft Guilds" or "Culinary & Bazaar Traditions" or "Spiritual Rhythms & Sacred Sites"
   - "indoor": boolean
   - "lat": approximate latitude near \${toMeta.lat}
   - "lon": approximate longitude near \${toMeta.lon}

Return ONLY a valid JSON array of these day objects. Do not include markdown formatting.\`;

      const rawPlan = await callGeminiWithFallback({
        contents: p,
        config: { temperature: 0.2, responseMimeType: 'application/json' }
      });
      if (rawPlan) {
        generatedDays = JSON.parse(rawPlan);
      }
    }
  } catch (e) {
    console.warn('Connected plan AI fallback triggered:', e);
  }

  const days: any[] = [];
  const dayThemes = [`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('server.ts', code, 'utf-8');
console.log('patched');

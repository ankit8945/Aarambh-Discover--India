const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const loopTarget = `    days.push({
      dayNumber: i + 1,
      theme: dTheme.theme,
      transitNotes: dTheme.transit,
      activities: acts,
    });
  }`;

const loopReplacement = `    days.push({
      dayNumber: i + 1,
      theme: dTheme.theme,
      transitNotes: dTheme.transit,
      activities: acts,
    });
  }

  // Override with AI generated days if successful
  if (generatedDays && generatedDays.length === daysCount) {
    days.splice(0, days.length, ...generatedDays.map((gd, idx) => {
      // Map AI data to frontend expected schema, adding some extra fields
      return {
        dayNumber: gd.dayNumber || (idx + 1),
        theme: gd.theme || 'Heritage Exploration',
        transitNotes: gd.transitNotes || 'Local E-rickshaw and walking',
        activities: (gd.activities || []).map((a: any, actIdx: number) => ({
          id: \`act-\${idx + 1}-\${actIdx + 1}\`,
          time: a.time || '10:00 AM',
          placeTitle: a.placeTitle || 'Historic Site',
          durationMinutes: a.durationMinutes || 90,
          description: a.description || 'Cultural exploration.',
          culturalCategory: a.culturalCategory || 'Monument & Archival Heritage',
          indoor: a.indoor || false,
          lat: a.lat || toMeta.lat + (Math.random() * 0.02 - 0.01),
          lon: a.lon || toMeta.lon + (Math.random() * 0.02 - 0.01),
          transitFromPrevMin: actIdx === 0 ? 0 : 20,
          source: 'Aarambh AI Cultural Archives',
        }))
      };
    }));
  }`;

code = code.replace(loopTarget, loopReplacement);
fs.writeFileSync('server.ts', code, 'utf-8');
console.log('patched 2');

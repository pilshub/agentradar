const https = require('https');
const fs = require('fs');
const path = require('path');

// Player data with CORRECT SofaScore IDs (verified from sofascore.com)
const players = [
  // Real Betis
  { id: "isco", name: "Isco", sofascore: "103417" },
  { id: "lo-celso", name: "Lo Celso", sofascore: "796362" },
  { id: "chimy-avila", name: "Chimy Avila", sofascore: "858498" },
  { id: "abde", name: "Abde", sofascore: "1011375" },
  { id: "rui-silva", name: "Rui Silva", sofascore: "344407" },
  { id: "marc-bartra", name: "Marc Bartra", sofascore: "99519" },
  { id: "william-carvalho", name: "William Carvalho", sofascore: "137978" },
  { id: "johnny-cardoso", name: "Johnny Cardoso", sofascore: "990169" },
  // Sevilla FC
  { id: "lukebakio", name: "Lukebakio", sofascore: "823631" },
  { id: "saul", name: "Saul", sofascore: "116955" },
  { id: "isaac-romero", name: "Isaac Romero", sofascore: "993636" },
  { id: "jesus-navas", name: "Jesus Navas", sofascore: "11869" },
  { id: "en-nesyri", name: "En-Nesyri", sofascore: "862069" },
  { id: "gudelj", name: "Gudelj", sofascore: "68332" },
  { id: "loic-bade", name: "Loic Bade", sofascore: "934258" },
  { id: "djibril-sow", name: "Djibril Sow", sofascore: "799054" },
];

const outputDir = path.join(__dirname, '../public/players');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.sofascore.com/',
      }
    };

    https.get(url, options, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }

      const contentType = response.headers['content-type'] || '';
      if (!contentType.includes('image')) {
        reject(new Error('Not an image'));
        return;
      }

      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => {
        const buffer = Buffer.concat(chunks);
        if (buffer.length < 1000) {
          reject(new Error('Image too small'));
          return;
        }
        fs.writeFileSync(filepath, buffer);
        resolve(buffer.length);
      });
      response.on('error', reject);
    }).on('error', reject);
  });
}

async function downloadPlayerImage(player) {
  const filepath = path.join(outputDir, `${player.id}.png`);

  // Try SofaScore first
  const sofascoreUrl = `https://img.sofascore.com/api/v1/player/${player.sofascore}/image`;

  try {
    const size = await downloadImage(sofascoreUrl, filepath);
    console.log(`✓ ${player.name}: ${size} bytes (SofaScore)`);
    return true;
  } catch (err) {
    console.log(`✗ ${player.name}: SofaScore failed (${err.message})`);
  }

  // Try alternative SofaScore URL
  const sofascoreAlt = `https://api.sofascore.com/api/v1/player/${player.sofascore}/image`;
  try {
    const size = await downloadImage(sofascoreAlt, filepath);
    console.log(`✓ ${player.name}: ${size} bytes (SofaScore Alt)`);
    return true;
  } catch (err) {
    console.log(`✗ ${player.name}: SofaScore Alt failed (${err.message})`);
  }

  console.log(`✗ ${player.name}: All sources failed, will use fallback`);
  return false;
}

async function main() {
  console.log('Downloading player images...\n');

  let success = 0;
  let failed = 0;

  for (const player of players) {
    const result = await downloadPlayerImage(player);
    if (result) success++;
    else failed++;
  }

  console.log(`\nDone: ${success} downloaded, ${failed} failed`);
}

main();

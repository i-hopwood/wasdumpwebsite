import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

// --- CONFIGURATION ---
// Replace this with your YouTube Channel ID
// You can find it in your channel URL: https://www.youtube.com/channel/GetThisPart
const CHANNEL_ID = 'YOUR_CHANNEL_ID_HERE'; 
const OUTPUT_FILE = '../src/assets/videos.json';
// ---------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (CHANNEL_ID === 'YOUR_CHANNEL_ID_HERE') {
  console.error('Error: Please set your CHANNEL_ID in scripts/fetch-videos.js first!');
  process.exit(1);
}

const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

// Simple function to extract content between XML tags
function extractTag(xml, tag) {
  const regex = new RegExp(`<${tag}[^>]*>(.*?)<\/${tag}>`, 'g');
  const matches = [];
  let match;
  while ((match = regex.exec(xml)) !== null) {
      matches.push(match[1]);
  }
  return matches;
}

// Function to extract specific fields from an entry block
function parseEntry(entryXml) {
  const idMatch = /<yt:videoId>(.*?)<\/yt:videoId>/.exec(entryXml);
  const titleMatch = /<title>(.*?)<\/title>/.exec(entryXml);
  const publishedMatch = /<published>(.*?)<\/published>/.exec(entryXml);

  if (!idMatch) return null;

  const id = idMatch[1];
  return {
      id: id,
      title: titleMatch ? titleMatch[1] : 'No Title',
      date: publishedMatch ? publishedMatch[1] : new Date().toISOString(),
      thumbnail: `https://img.youtube.com/vi/${id}/mqdefault.jpg`,
      url: `https://www.youtube.com/watch?v=${id}`
  };
}

console.log(`Fetching RSS feed from: ${feedUrl}`);

https.get(feedUrl, (res) => {
  let data = '';

  res.on('data', (chunk) => {
      data += chunk;
  });

  res.on('end', () => {
      // Split by <entry> to process individual videos
      const entries = data.split('<entry>').slice(1);
      
      const videos = entries.map(entry => parseEntry(entry)).filter(v => v !== null);

      if (videos.length === 0) {
          console.log('No videos found or failed to parse XML.');
          return;
      }

      console.log(`Found ${videos.length} videos.`);

      const outputPath = path.resolve(__dirname, OUTPUT_FILE);
      
      // Preserve existing manual edits if desired, but here we overwrite for simplicity
      // Or you could merge: const existing = JSON.parse(fs.readFileSync(outputPath));
      
      fs.writeFileSync(outputPath, JSON.stringify(videos, null, 2));
      console.log(`Successfully updated ${outputPath}`);
  });

}).on('error', (err) => {
  console.error('Error fetching feed:', err.message);
});

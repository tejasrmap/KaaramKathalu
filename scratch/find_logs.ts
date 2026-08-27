import * as fs from 'fs';

const file = 'C:\\Users\\tejag\\.gemini\\antigravity-ide\\brain\\a96f1c14-8b0e-4ab4-ac84-37f76fb671b1\\.system_generated\\logs\\transcript_full.jsonl';
const lines = fs.readFileSync(file, 'utf-8').split('\n');

for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const data = JSON.parse(line);
    const content = JSON.stringify(data);
    if (content.includes('DEBUG') || content.includes('DEBUG ProductDetail') || content.includes('console_logs') || content.includes('ConsoleLog')) {
      console.log("MATCH:", content.substring(0, 800));
    }
  } catch (e) {
    // ignore
  }
}

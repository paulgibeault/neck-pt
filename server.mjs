/**
 * Neck PT Companion - Local Development Server
 * 
 * A zero-dependency dev server powered entirely by native Node.js built-ins.
 * Serves static assets for the PWA client, and hosts standard POST developer APIs
 * to write modifications directly back to the workspace disk.
 * 
 * Usage: npm start (launches 'node server.mjs' on port 8080)
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const PORT = 8080;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CWD = process.cwd();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
};

// Simple helper to read the request body safely
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('error', err => reject(err));
    req.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
  });
}

// JSON API Response Helper
function jsonResponse(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // =========================================================================
  // API ENDPOINTS (Local development write capabilities only)
  // =========================================================================

  if (pathname === '/api/save-program' && req.method === 'POST') {
    try {
      const bodyBuffer = await readBody(req);
      const payload = JSON.parse(bodyBuffer.toString('utf8'));

      if (!payload || !payload.exercises) {
        return jsonResponse(res, 400, { success: false, error: 'Malformed program payload' });
      }

      // Reformat the PROGRAM object back into src/data.js nicely.
      // We export it as const PROGRAM.
      const formattedCode = `/**
 * Neck PT Companion - Canonical Program Prescription Data
 *
 * This is the SINGLE SOURCE OF TRUTH for the program. The app reads only this file.
 * Automatically saved and managed via the Exercise Admin Panel.
 */

export const PROGRAM = ${JSON.stringify(payload, null, 2)};

// Valid clinical exercise categories
const VALID_CATEGORIES = new Set(['stretch', 'isometric', 'mobilization', 'nerve-glide', 'strengthening']);

/**
 * Validates the program schema at startup. Throws a descriptive Error if
 * data.js has been edited incorrectly, so problems surface immediately
 * rather than crashing mid-routine with a cryptic undefined read.
 * @param {Object} program - The PROGRAM export to validate
 * @returns {void}
 */
export function validateProgram(program) {
  if (!program || !Array.isArray(program.exercises) || program.exercises.length === 0) {
    throw new Error('[data] PROGRAM.exercises must be a non-empty array.');
  }

  program.exercises.forEach((ex, i) => {
    const id = \`exercises[\${i}] "\${ex.slug || '(no slug)'}"\`;

    if (typeof ex.slug !== 'string' || !ex.slug) throw new Error(\`\${id}: missing slug\`);
    if (typeof ex.title !== 'string' || !ex.title) throw new Error(\`\${id}: missing title\`);
    if (!VALID_CATEGORIES.has(ex.category)) {
      throw new Error(\`\${id}: invalid category "\${ex.category}". Must be one of: \${\[...VALID_CATEGORIES].join(', ')}\`);
    }
    if (typeof ex.folder !== 'string' || !ex.folder) throw new Error(\`\${id}: missing folder\`);
    if (typeof ex.unilateral !== 'boolean') throw new Error(\`\${id}: unilateral must be a boolean\`);
    if (typeof ex.example_image_count !== 'number' || ex.example_image_count < 1) {
      throw new Error(\`\${id}: example_image_count must be a positive number\`);
    }
    if (!ex.dosage || typeof ex.dosage !== 'object') throw new Error(\`\${id}: missing dosage\`);

    const d = ex.dosage;
    const hasHold = d.hold_seconds !== null && d.hold_seconds !== undefined;
    const hasReps = d.reps !== null && d.reps !== undefined;
    if (!hasHold && !hasReps) {
      throw new Error(\`\${id}: dosage must have either hold_seconds or reps\`);
    }
    if (hasHold && typeof d.hold_seconds !== 'number') throw new Error(\`\${id}: dosage.hold_seconds must be a number\`);
    if (hasReps && (typeof d.reps !== 'object' || !('min' in d.reps) || !('max' in d.reps))) {
      throw new Error(\`\${id}: dosage.reps must be an object with min and max\`);
    }
    if (!ex.setup) throw new Error(\`\${id}: missing setup text\`);
    if (!ex.movement) throw new Error(\`\${id}: missing movement text\`);
  });
}
`;

      const dataJsPath = path.join(CWD, 'src', 'data.js');
      fs.writeFileSync(dataJsPath, formattedCode, 'utf8');

      console.log(`[Server] Saved program changes successfully to src/data.js`);
      return jsonResponse(res, 200, { success: true });
    } catch (err) {
      console.error(`[Server] Error saving program:`, err);
      return jsonResponse(res, 500, { success: false, error: err.message });
    }
  }

  if (pathname === '/api/save-media' && req.method === 'POST') {
    try {
      const bodyBuffer = await readBody(req);
      const { folder, filename, base64Data } = JSON.parse(bodyBuffer.toString('utf8'));

      if (!folder || !filename || !base64Data) {
        return jsonResponse(res, 400, { success: false, error: 'Missing folder, filename, or image data' });
      }

      // Safe path traversal guard: restrict files to the local exercises folder
      const resolvedFolder = path.resolve(CWD, folder);
      if (!resolvedFolder.startsWith(path.join(CWD, 'exercises'))) {
        return jsonResponse(res, 403, { success: false, error: 'Access denied: Path must reside in exercises/' });
      }

      // Strip potential mime-type preamble (e.g. data:image/png;base64,...)
      const cleanedBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
      const binaryBuffer = Buffer.from(cleanedBase64, 'base64');

      // Create target directory if needed
      fs.mkdirSync(resolvedFolder, { recursive: true });

      const finalPath = path.join(resolvedFolder, filename);
      fs.writeFileSync(finalPath, binaryBuffer);

      console.log(`[Server] Wrote media file successfully to: ${folder}/${filename}`);
      return jsonResponse(res, 200, { success: true });
    } catch (err) {
      console.error(`[Server] Error saving media:`, err);
      return jsonResponse(res, 500, { success: false, error: err.message });
    }
  }

  if (pathname === '/api/delete-media' && req.method === 'POST') {
    try {
      const bodyBuffer = await readBody(req);
      const { folder, filename } = JSON.parse(bodyBuffer.toString('utf8'));

      if (!folder || !filename) {
        return jsonResponse(res, 400, { success: false, error: 'Missing folder or filename' });
      }

      // Safe path traversal guard
      const resolvedFolder = path.resolve(CWD, folder);
      if (!resolvedFolder.startsWith(path.join(CWD, 'exercises'))) {
        return jsonResponse(res, 403, { success: false, error: 'Access denied' });
      }

      const filePath = path.join(resolvedFolder, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`[Server] Deleted media file: ${folder}/${filename}`);
      }

      return jsonResponse(res, 200, { success: true });
    } catch (err) {
      console.error(`[Server] Error deleting media:`, err);
      return jsonResponse(res, 500, { success: false, error: err.message });
    }
  }

  // =========================================================================
  // STATIC ASSET SERVER
  // =========================================================================

  // Convert request URL to local disk path
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(CWD, safePath);

  // If path is a folder, check for index.html
  try {
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }
  } catch (e) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('File Not Found');
    return;
  }

  // Read and serve the file
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('File Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`Internal Server Error: ${err.code}`);
      }
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`  Neck PT Companion Dev Server is Running!`);
  console.log(`  Url: http://localhost:${PORT}`);
  console.log(`  Interactive Admin: http://localhost:${PORT}/admin.html`);
  console.log(`======================================================\n`);
});

const fs = require('fs');
const LOG_DIR = process.env.LOG_DIR || '/var/log/app';
const SERVICE = process.env.SERVICE_NAME || 'service';
const POD = process.env.POD_NAME || 'local';
const LOG_FILE = `${LOG_DIR}/${SERVICE}.log`;

try { fs.mkdirSync(LOG_DIR, { recursive: true }); } catch (e) {}

function writeLog(msg) {
  const line = `${new Date().toISOString()} [${SERVICE}/${POD}] ${msg}\n`;
  fs.appendFile(LOG_FILE, line, () => {});
}

// logs every request with its status code, skipping /health
function requestLogger(req, res, next) {
  if (req.path === '/health') return next();
  const start = Date.now();
  res.on('finish', () => {
    const user = req.user ? req.user.email : (req.headers['x-user-email'] || '-');
    writeLog(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start}ms) user=${user}`);
  });
  next();
}

module.exports = { writeLog, requestLogger };
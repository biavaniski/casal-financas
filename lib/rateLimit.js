// lib/rateLimit.js
const tracker = new Map();

export function checkRateLimit(identifier, limit = 20, windowMs = 60000) {
  const now = Date.now();
  const windowData = tracker.get(identifier) || { count: 0, time: now };

  if (now - windowData.time < windowMs) {
    if (windowData.count >= limit) {
      return false; // Bloqueado por excesso de requisições
    }
    windowData.count++;
  } else {
    tracker.set(identifier, { count: 1, time: now });
  }

  return true; // Permitido
}

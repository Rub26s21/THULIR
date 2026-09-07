// ============================================================
// Vercel Serverless Function — THULIR AI Ground Event Investigator
// ============================================================
// Endpoint: POST /api/ground-event-investigator

import { executeGroundInvestigation } from '../src/services/investigator/investigatorCore.ts';
import type { APODEvidencePackage } from '../src/services/investigator/investigatorTypes.ts';

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      available: false,
      status: 'AI_ERROR',
      reason: 'Method Not Allowed. Use POST.',
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const rawBody = req.body;
    const pkg = (typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody) as APODEvidencePackage;
    const apiKey = process.env.OPENROUTER_API_KEY;

    const result = await executeGroundInvestigation(pkg, apiKey);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({
      available: false,
      status: 'AI_ERROR',
      reason: `Server error: ${err?.message || 'Internal exception'}`,
      timestamp: new Date().toISOString(),
    });
  }
}

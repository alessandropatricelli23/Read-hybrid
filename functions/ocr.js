// Netlify Function: OCR proxy to OCR.space
// Set env var OCRSPACE_API_KEY in Netlify site settings

export async function handler(event) {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }
    const apiKey = process.env.OCRSPACE_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Missing OCRSPACE_API_KEY' }) };
    }
    const { imageBase64, language = 'ita' } = JSON.parse(event.body || '{}');
    if (!imageBase64) {
      return { statusCode: 400, body: JSON.stringify({ error: 'imageBase64 required' }) };
    }

    const params = new URLSearchParams();
    params.append('apikey', apiKey);
    params.append('language', language);       // ita o ita+eng
    params.append('isOverlayRequired', 'false');
    params.append('OCREngine', '2');           // motore migliore
    params.append('scale', 'true');
    params.append('base64Image', imageBase64); // data URL "data:image/jpeg;base64,..."

    const resp = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: params
    });
    const data = await resp.json();
    const parsed = data?.ParsedResults?.[0]?.ParsedText || '';
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ text: parsed })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message || 'unknown error' }) };
  }
}

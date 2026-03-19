const fs = require('fs');
const Tesseract = require('tesseract.js');

// Extract text from image using OCR
const extractTextFromImage = async (filePath) => {
  const result = await Tesseract.recognize(filePath, 'eng', {
    logger: m => console.log(m.status)
  });
  return result.data.text;
};

// Extract text from PDF
const extractTextFromPDF = async (filePath) => {
  try {
    const buffer = fs.readFileSync(filePath);
    const text = buffer.toString('utf8');
    const matches = text.match(/\(([^)]{3,})\)/g);
    if (matches && matches.length > 10) {
      const extracted = matches
        .map(m => m.slice(1, -1))
        .filter(t => /[a-zA-Z]/.test(t))
        .join(' ');
      if (extracted.length > 50) return extracted;
    }
    return await extractTextFromImage(filePath);
  } catch (err) {
    return await extractTextFromImage(filePath);
  }
};

// Extract text based on file type
const extractText = async (filePath, mimeType) => {
  if (mimeType === 'application/pdf') {
    return await extractTextFromPDF(filePath);
  } else {
    return await extractTextFromImage(filePath);
  }
};

// Analyze text using Groq API
const analyzeWithGemini = async (rawText) => {
  const apiKey = process.env.GROQ_API_KEY;
  const url = `https://api.groq.com/openai/v1/chat/completions`;

  const body = {
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: `You are a medical document interpreter helping patients understand their medical documents.

Analyze this medical document and respond with ONLY a valid JSON object in this exact format:
{
  "summary": "A 3-4 sentence plain English summary of what this document is about",
  "urgentFlags": ["list any urgent warnings here, or leave empty array"],
  "medications": [
    {
      "name": "medication name",
      "dose": "dosage",
      "frequency": "how often",
      "purpose": "what it is for in plain language"
    }
  ],
  "terms": [
    {
      "term": "medical term",
      "definition": "plain English definition"
    }
  ],
  "nextSteps": ["list recommended next steps here"]
}

Rules:
- Use simple language a 12 year old can understand
- Never give medical advice or diagnoses
- Always flag urgent warnings like allergies or overdose risks
- If no medications found, return empty array
- If no urgent flags, return empty array
- Return ONLY the JSON object, no other text before or after

Medical document text:
${rawText}`
      }
    ],
    temperature: 0.1,
    max_tokens: 1000
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  const responseText = data.choices[0].message.content;

  const cleaned = responseText.replace(/```json\s*/gi, '').replace(/```/g, '').trim();

  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not parse AI response');
  }

  return JSON.parse(jsonMatch[0]);
};

// Main function
const processDocument = async (filePath, mimeType) => {
  console.log('Extracting text from document...');
  const rawText = await extractText(filePath, mimeType);

  if (!rawText || rawText.trim().length < 10) {
    throw new Error('Could not extract text from document');
  }

  console.log('Analyzing with Groq AI...');
  const analysis = await analyzeWithGemini(rawText);

  return { rawText, analysis };
};

module.exports = { processDocument };
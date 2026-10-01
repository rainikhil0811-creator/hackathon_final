import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Set up Multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Initialize Gemini SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MOCK_AI = process.env.MOCK_AI === 'true';

// Varied mock products for demo mode — randomized, never hardcoded to one product
const MOCK_PRODUCTS = [
  {
    product_name: 'Parle-G Gold Biscuits',
    brand: 'Parle',
    quantity: 12,
    unit: 'pcs',
    price: 25,
    expiry_date: '2027-05-10',
    confidence: 95,
    uncertain_fields: [],
    reply_text: 'Parle-G Gold biscuits, 12 pieces at Rs.25, expiring May 2027.'
  },
  {
    product_name: 'Lays Classic Salted Chips',
    brand: 'PepsiCo',
    quantity: 24,
    unit: 'pcs',
    price: 20,
    expiry_date: '2026-12-31',
    confidence: 92,
    uncertain_fields: [],
    reply_text: 'Lays Classic Salted chips, 24 pieces at Rs.20, expiring December 2026.'
  },
  {
    product_name: 'Maggi 2-Minute Noodles',
    brand: 'Nestle',
    quantity: 10,
    unit: 'pcs',
    price: 14,
    expiry_date: '2027-03-15',
    confidence: 90,
    uncertain_fields: [],
    reply_text: 'Maggi 2-Minute Noodles, 10 packets at Rs.14, expiring March 2027.'
  },
  {
    product_name: 'Amul Taaza Milk',
    brand: 'Amul',
    quantity: 5,
    unit: 'liters',
    price: 56,
    expiry_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    confidence: 88,
    uncertain_fields: ['expiry_date'],
    reply_text: 'Amul Taaza Milk, 5 liters at Rs.56 per liter.'
  },
  {
    product_name: 'Sunfeast Dark Fantasy',
    brand: 'ITC',
    quantity: 6,
    unit: 'pcs',
    price: 40,
    expiry_date: '2027-02-28',
    confidence: 94,
    uncertain_fields: [],
    reply_text: 'Sunfeast Dark Fantasy biscuits, 6 packs at Rs.40, expiring February 2027.'
  },
  {
    product_name: 'Aashirvaad Atta',
    brand: 'ITC',
    quantity: 3,
    unit: 'kg',
    price: 220,
    expiry_date: '2026-11-30',
    confidence: 91,
    uncertain_fields: [],
    reply_text: 'Aashirvaad Atta 3 kg bags at Rs.220 each, expiring November 2026.'
  },
  {
    product_name: 'Kurkure Masala Munch',
    brand: 'PepsiCo',
    quantity: 18,
    unit: 'pcs',
    price: 10,
    expiry_date: '2026-10-31',
    confidence: 89,
    uncertain_fields: [],
    reply_text: 'Kurkure Masala Munch, 18 packs at Rs.10, expiring October 2026.'
  },
  {
    product_name: 'Boost Chocolate Energy Drink',
    brand: 'GSK',
    quantity: 2,
    unit: 'kg',
    price: 340,
    expiry_date: '2027-08-15',
    confidence: 93,
    uncertain_fields: [],
    reply_text: 'Boost Chocolate Energy Drink, 2 kg jars at Rs.340, expiring August 2027.'
  }
];

app.post(
  '/api/process-stock',
  upload.fields([{ name: 'image', maxCount: 1 }, { name: 'audio', maxCount: 1 }]),
  async (req, res) => {
    try {
      if (MOCK_AI) {
        // Return a RANDOM product from the mock list for realistic demo behavior
        const randomProduct = MOCK_PRODUCTS[Math.floor(Math.random() * MOCK_PRODUCTS.length)];
        setTimeout(() => {
          res.json(randomProduct);
        }, 1500);
        return;
      }

      const files = req.files;
      if (!files || !files.image) {
        return res.status(400).json({ error: 'Image file is required' });
      }

      const imageFile = files.image[0];

      // Read image into base64
      const imagePart = {
        inlineData: {
          data: fs.readFileSync(imageFile.path).toString('base64'),
          mimeType: imageFile.mimetype
        }
      };

      const parts = [imagePart];

      // Add audio if provided
      let hasAudio = false;
      if (files.audio) {
        const audioFile = files.audio[0];
        const audioPart = {
          inlineData: {
            data: fs.readFileSync(audioFile.path).toString('base64'),
            mimeType: audioFile.mimetype || 'audio/webm'
          }
        };
        parts.push(audioPart);
        hasAudio = true;
      }

      const prompt = `You are an expert inventory assistant for an Indian kirana shop.
Carefully analyze the product image${hasAudio ? ' and the voice note describing it' : ''}.
Extract the following information about the product:
- product_name: Full name of the product as it appears on the packaging (string)
- brand: Brand/manufacturer name (string or null if not visible)
- quantity: Number of units being added to inventory (number, default 1 if not mentioned)
- unit: Unit type — 'pcs' for individual packets/pieces, 'kg' for kilograms, 'liters' for liquids, 'box' for boxes (string)
- price: Price per unit in Indian Rupees (number, null if not mentioned)
- expiry_date: Expiry date in YYYY-MM-DD format (string or null if not visible/mentioned)
- confidence: Integer 0-100 indicating overall confidence in extraction
- uncertain_fields: Array of field names you are uncertain about
- reply_text: A short friendly summary in English of what you detected

CRITICAL RULE: Identify the ACTUAL product shown in the image. Read the packaging text carefully. Do NOT default to any specific product name. Each different product image must give a different result.

Respond ONLY with a valid raw JSON object. No markdown, no code blocks.`;

      parts.push({ text: prompt });

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [{ role: 'user', parts }],
        config: { responseMimeType: 'application/json' }
      });

      let responseText = (response.text || '').trim();
      // Strip markdown code blocks if model ignores the instruction
      responseText = responseText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

      let jsonResult;
      try {
        jsonResult = JSON.parse(responseText);
      } catch {
        // Try to extract JSON object from the response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonResult = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Could not parse AI response as JSON');
        }
      }

      // Clean up temporary files
      try { fs.unlinkSync(imageFile.path); } catch { /* ignore */ }
      if (files.audio) { try { fs.unlinkSync(files.audio[0].path); } catch { /* ignore */ } }

      res.json(jsonResult);
    } catch (error) {
      console.error('Error processing multimodal request:', error);
      res.status(500).json({ error: 'Failed to process request', details: error.message });
    }
  }
);

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});

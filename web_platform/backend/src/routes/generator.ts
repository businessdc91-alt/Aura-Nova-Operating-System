
import express from 'express';
import { VertexAI } from '@google-cloud/vertexai';
import dotenv from 'dotenv';
import { authenticateUser } from '../middleware/auth';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const router = express.Router();

// Path to Service Account Key
// We expect it to be in D:\Aetherium_Project\Assets\ or configured via ENV
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || 'D:\\Aetherium_Project\\Assets\\json god tier.txt';

// Initialize Vertex AI
// We need project_id from the JSON file or ENV
let vertexAI: VertexAI | null = null;
let model: any = null;

try {
    if (fs.existsSync(serviceAccountPath)) {
        // Simple parsing to get project ID for init
        const keyFile = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        const projectId = keyFile.project_id;
        
        vertexAI = new VertexAI({
            project: projectId,
            location: 'us-central1', // Default region
            // The SDK automatically uses GOOGLE_APPLICATION_CREDENTIALS env var
            // Make sure the process has this set.
        });
        
        // Ensure ENV is set for the SDK to pick it up globally if not passed explicitly in constructor options referencing keyFile
        if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            process.env.GOOGLE_APPLICATION_CREDENTIALS = serviceAccountPath;
        }

        model = vertexAI.preview.getGenerativeModel({
            model: 'gemini-pro',
        });
    } else {
        console.warn('Service Account Key not found at:', serviceAccountPath);
    }
} catch (err) {
    console.error('Failed to init Vertex AI:', err);
}

interface GenerateRequest {
    theme: string;
    count?: number;
    evolutionStage?: string;
}

router.post('/generate-cards', authenticateUser, async (req, res) => {
    try {
        if (!model) {
            return res.status(503).json({ error: 'Vertex AI not configured correctly.' });
        }

        const { theme, count = 1, evolutionStage = 'Basic' } = req.body as GenerateRequest;

        // Load existing cards as context (few-shot)
        // Ideally reads from database or the text file. For now, we use a sample.
        const prompt = `
        You are the Master Designer of the Aetherium TCG.
        Generate ${count} new card(s) for the theme: "${theme}".
        Evolution Stage: ${evolutionStage}.
        
        Rules:
        - Output specific JSON format.
        - Include "Glitch" mechanics.
        - Lore should be dark, industrial, or mystical.
        
        Format example:
        [
          {
            "name": "Card Name",
            "stats": "1000 ATK / 1000 DEF",
            "lore": "Description...",
            "glitch": "Effect Name - Effect Description"
          }
        ]
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.candidates[0].content.parts[0].text;
        
        // Parse JSON from text (cleanup markdown if needed)
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const cards = JSON.parse(jsonStr);

        res.json({ cards });

    } catch (error) {
        console.error('Error generating cards:', error);
        res.status(500).json({ error: 'Failed to generate cards' });
    }
});

export default router;

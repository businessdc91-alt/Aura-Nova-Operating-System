
import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { authenticateUser } from '../middleware/auth';

dotenv.config();

const router = express.Router();

// Initialize OpenAI client for Local LLM (e.g., LM Studio)
// Default to LM Studio port 1234 if not specified
const localLLMUrl = process.env.LOCAL_LLM_URL || 'http://localhost:1234/v1';

const openai = new OpenAI({
    baseURL: localLLMUrl,
    apiKey: 'not-needed', // Local LLMs usually don't need a key
});

interface CardChatRequest {
    cardName: string;
    suit: string;
    rank: string;
    personality?: string;
    context?: string;
    userMessage?: string;
}

// Generate dialogue for a card using Local LLM
router.post('/card-chat', authenticateUser, async (req, res) => {
    try {
        const { cardName, suit, rank, personality, context, userMessage } = req.body as CardChatRequest;

        // Construct the system prompt
        const systemPrompt = `
        You are a Sentient 'Living Card' in the Aetherium Trading Card Game.
        
        Identity:
        - Name: ${cardName}
        - Suit: ${suit}
        - Rank: ${rank}
        - Personality Traits: ${personality || 'Mysterious, ancient, somewhat glitchy'}
        
        Current Situation:
        ${context || 'The player is examining you.'}
        
        Instructions:
        - Respond as the character.
        - Keep it short (max 2 sentences).
        - Use *italics* for actions.
        - Be immersive.
        `;

        const completion = await openai.chat.completions.create({
            model: "local-model", // Identifier often ignored by local servers
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage || "Interact with me." }
            ],
            temperature: 0.7,
            max_tokens: 150,
        });

        const text = completion.choices[0]?.message?.content || "*Silence...*";

        res.json({ message: text });
    } catch (error) {
        console.error('Error generating local dialogue:', error);
        // Fallback or specific error for user
        res.json({ 
            message: `*The card remains still.* (Ensure LM Studio is running on ${localLLMUrl})`,
            isError: true 
        });
    }
});

export default router;

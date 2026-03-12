
import express from 'express';
import { CardParser } from '../utils/cardParser';

const router = express.Router();
const parser = new CardParser();

// Get all canonical cards
router.get('/', (req, res) => {
    res.json(parser.getAllCards());
});

// Simulate opening a booster pack
router.get('/pack', (req, res) => {
    const pack = parser.getPack(5);
    res.json(pack);
});

export default router;

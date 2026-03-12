
import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const ASSETS_DIR = 'D:\\Aetherium_Project\\Assets';
const MAPPING_FILE = path.join(ASSETS_DIR, 'assets.json');

// Ensure mapping file exists
if (!fs.existsSync(MAPPING_FILE)) {
    fs.writeFileSync(MAPPING_FILE, JSON.stringify({}));
}

// 1. List available image files
router.get('/images', (req, res) => {
    try {
        const files = fs.readdirSync(ASSETS_DIR)
            .filter(file => /\.(png|jpg|jpeg|jfif)$/i.test(file));
        res.json(files);
    } catch (error) {
        console.error('Error listing assets:', error);
        res.status(500).json({ error: 'Failed to list assets' });
    }
});

// 2. Get current mappings
router.get('/mappings', (req, res) => {
    try {
        if (fs.existsSync(MAPPING_FILE)) {
            const data = fs.readFileSync(MAPPING_FILE, 'utf-8');
            res.json(JSON.parse(data));
        } else {
            res.json({});
        }
    } catch (error) {
        console.error('Error reading mappings:', error);
        res.status(500).json({ error: 'Failed to read mappings' });
    }
});

// 3. Save a mapping
router.post('/mappings', (req, res) => {
    try {
        const { cardId, mapping } = req.body;
        // mapping: { fileName, x, y, width, height }
        
        let currentMappings: any = {};
        if (fs.existsSync(MAPPING_FILE)) {
            currentMappings = JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf-8'));
        }
        
        currentMappings[cardId] = mapping;
        
        fs.writeFileSync(MAPPING_FILE, JSON.stringify(currentMappings, null, 2));
        res.json({ success: true, mappings: currentMappings });
    } catch (error) {
        console.error('Error saving mapping:', error);
        res.status(500).json({ error: 'Failed to save mapping' });
    }
});

export default router;

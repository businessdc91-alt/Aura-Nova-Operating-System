import express from 'express';
import { db } from '../config/firebase';
import { authenticateUser } from '../middleware/auth';

const router = express.Router();

// Get channels for user
router.get('/channels', authenticateUser, async (req, res) => {
    try {
        const userId = req.user!.uid;
        
        // Get public channels
        const publicChannels = await db.collection('chatChannels')
            .where('type', '==', 'public')
            .get();

        // Get private channels where user is a member
        const privateChannels = await db.collection('chatChannels')
            .where('members', 'array-contains', userId)
            .get();

        const channels = [
            ...publicChannels.docs.map(d => ({ id: d.id, ...d.data() })),
            ...privateChannels.docs.map(d => ({ id: d.id, ...d.data() }))
        ];

        // Dedup by ID
        const uniqueChannels = Array.from(new Map(channels.map(c => [c.id, c])).values());

        res.json({ channels: uniqueChannels });
    } catch (error) {
        console.error('Error fetching channels:', error);
        res.status(500).json({ error: 'Failed to fetch channels' });
    }
});

// Create channel
router.post('/channels', authenticateUser, async (req, res) => {
    try {
        const { name, type, members } = req.body;
        const userId = req.user!.uid;

        const newChannel = {
            name,
            type,
            members: type === 'public' ? [] : [...(members || []), userId],
            createdBy: userId,
            createdAt: new Date(),
            lastMessage: null
        };

        const ref = await db.collection('chatChannels').add(newChannel);
        res.status(201).json({ id: ref.id, ...newChannel });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create channel' });
    }
});

// Get messages for channel
router.get('/channels/:channelId/messages', authenticateUser, async (req, res) => {
    try {
        const { channelId } = req.params;
        const limit = parseInt(req.query.limit as string) || 50;
        const before = req.query.before as string; // Timestamp for pagination

        let query = db.collection('chatMessages')
            .where('channelId', '==', channelId)
            .orderBy('createdAt', 'desc')
            .limit(limit);

        if (before) {
            query = query.startAfter(new Date(before));
        }

        const snapshot = await query.get();
        const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })).reverse(); // Return in chronological order

        res.json({ messages });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ error: 'Failed to get messages' });
    }
});

export default router;

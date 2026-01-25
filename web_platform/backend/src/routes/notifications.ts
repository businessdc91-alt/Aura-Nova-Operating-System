import express from 'express';
import { db } from '../config/firebase';
import { authenticateUser } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateUser, async (req, res) => {
    try {
        const userId = req.user!.uid;
        
        const snapshot = await db.collection('notifications')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();

        const notifications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json({ notifications });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

router.patch('/:id/read', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user!.uid;

        const docRef = db.collection('notifications').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) return res.status(404).json({ error: 'Not found' });
        if (doc.data()?.userId !== userId) return res.status(403).json({ error: 'Unauthorized' });

        await docRef.update({ isRead: true });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update notification' });
    }
});

export default router;

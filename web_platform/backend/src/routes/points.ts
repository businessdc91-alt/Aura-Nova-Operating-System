import express from 'express';
import { db, adminApp } from '../config/firebase';
import { authenticateUser } from '../middleware/auth';

const router = express.Router();

// Get user points balance
router.get('/balance/:userId', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Security check: ensure user is requesting their own balance or has admin role
    if (req.user?.uid !== userId && !req.user?.isAdmin) {
       return res.status(403).json({ error: 'Unauthorized' });
    }

    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const balance = userDoc.data()?.pointsBalance || 0;
    res.json({ userId, balance });
  } catch (error) {
    console.error('Error fetching balance:', error);
    res.status(500).json({ error: 'Failed to get balance' });
  }
});

// Get points history
router.get('/history/:userId', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    if (req.user?.uid !== userId && !req.user?.isAdmin) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    const historySnapshot = await db.collection('userPointsHistory')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    const history = historySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ history });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to get history' });
  }
});

// Award points (internal helper / admin endpoint)
export async function awardPoints(
  userId: string,
  amount: number,
  type: string,
  description: string,
  transactionId?: string
) {
  const batch = db.batch();

  // Add to history
  const historyRef = db.collection('userPointsHistory').doc();
  batch.set(historyRef, {
    userId,
    amount,
    type,
    description,
    transactionId: transactionId || null,
    createdAt: new Date()
  });

  // Update user balance
  const userRef = db.collection('users').doc(userId);
  batch.set(userRef, {
    pointsBalance: adminApp.firestore.FieldValue.increment(amount)
  }, { merge: true });

  await batch.commit();
  return amount;
}

// Spend points (internal helper)
export async function spendPoints(
  userId: string,
  amount: number,
  description: string,
  transactionId?: string
) {
  return db.runTransaction(async (transaction) => {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await transaction.get(userRef);
    
    if (!userDoc.exists) {
      throw new Error('User not found');
    }

    const balance = userDoc.data()?.pointsBalance || 0;

    if (balance < amount) {
      throw new Error('Insufficient points');
    }

    // Deduct points
    transaction.update(userRef, {
        pointsBalance: adminApp.firestore.FieldValue.increment(-amount)
    });

    // Add history record
    const historyRef = db.collection('userPointsHistory').doc();
    transaction.set(historyRef, {
        userId,
        amount: -amount,
        type: 'spend',
        description,
        transactionId: transactionId || null,
        createdAt: new Date()
    });
  });
}

export default router;

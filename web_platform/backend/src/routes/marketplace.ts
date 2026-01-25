import express from 'express';
import { db, adminApp } from '../config/firebase';
import { authenticateUser } from '../middleware/auth';
// We import helpers but we won't use them directly in the purchase transaction 
// to ensure we keep everything in a single atomic transaction block where possible,
// or carefully manage the logic. The roadmap implementation uses a single runTransaction.

const router = express.Router();

// List all items for sale
router.get('/items', authenticateUser, async (req, res) => {
  try {
    const itemsSnapshot = await db.collection('marketplaceItems')
      .where('isSold', '==', false)
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();

    const items = itemsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ items });
  } catch (error) {
    console.error('Error fetching marketplace items:', error);
    res.status(500).json({ error: 'Failed to get items' });
  }
});

// Purchase item
router.post('/purchase/:itemId', authenticateUser, async (req, res) => {
  const { itemId } = req.params;
  
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const buyerId = req.user.uid;

  try {
    // Run transaction to ensure atomicity
    await db.runTransaction(async (transaction) => {
      // 1. Get item
      const itemRef = db.collection('marketplaceItems').doc(itemId);
      const itemDoc = await transaction.get(itemRef);

      if (!itemDoc.exists) {
        throw new Error('Item not found');
      }

      const item = itemDoc.data();

      if (!item) throw new Error('Item data missing');

      if (item.isSold) {
        throw new Error('Item already sold');
      }

      if (item.sellerId === buyerId) {
        throw new Error('Cannot buy your own item');
      }

      // 2. Check buyer balance
      const buyerRef = db.collection('users').doc(buyerId);
      const buyerDoc = await transaction.get(buyerRef);
      
      if (!buyerDoc.exists) {
          throw new Error('Buyer user record not found');
      }
      
      const buyerBalance = buyerDoc.data()?.pointsBalance || 0;

      if (buyerBalance < item.pricePoints) {
        throw new Error('Insufficient points');
      }

      // 3. Create transaction record
      const transactionRef = db.collection('transactions').doc();
      transaction.set(transactionRef, {
        buyerId,
        sellerId: item.sellerId,
        itemId,
        pointsAmount: item.pricePoints,
        status: 'completed',
        createdAt: new Date(),
        completedAt: new Date()
      });

      // 4. Update item as sold
      transaction.update(itemRef, {
        isSold: true,
        soldTo: buyerId,
        soldAt: new Date()
      });

      // 5. Deduct from buyer
      transaction.update(buyerRef, {
        pointsBalance: adminApp.firestore.FieldValue.increment(-item.pricePoints)
      });

      // 6. Add to seller
      const sellerRef = db.collection('users').doc(item.sellerId);
      transaction.update(sellerRef, {
        pointsBalance: adminApp.firestore.FieldValue.increment(item.pricePoints)
      });

      // 7. Add point history for both
      const buyerHistoryRef = db.collection('userPointsHistory').doc();
      transaction.set(buyerHistoryRef, {
        userId: buyerId,
        amount: -item.pricePoints,
        type: 'spend',
        description: `Purchased: ${item.title}`,
        transactionId: transactionRef.id,
        createdAt: new Date()
      });

      const sellerHistoryRef = db.collection('userPointsHistory').doc();
      transaction.set(sellerHistoryRef, {
        userId: item.sellerId,
        amount: item.pricePoints,
        type: 'sale',
        description: `Sold: ${item.title}`,
        transactionId: transactionRef.id,
        createdAt: new Date()
      });

      // 8. Create notifications
      const buyerNotifRef = db.collection('notifications').doc();
      transaction.set(buyerNotifRef, {
        userId: buyerId,
        type: 'purchase',
        title: 'Purchase Complete',
        content: `You purchased "${item.title}" for ${item.pricePoints} points`,
        link: `/exchange/item/${itemId}`,
        isRead: false,
        createdAt: new Date()
      });

      const sellerNotifRef = db.collection('notifications').doc();
      transaction.set(sellerNotifRef, {
        userId: item.sellerId,
        type: 'sale',
        title: 'Item Sold!',
        content: `Your item "${item.title}" sold for ${item.pricePoints} points`,
        link: `/exchange/item/${itemId}`,
        isRead: false,
        createdAt: new Date()
      });
    });

    res.json({ success: true, message: 'Purchase completed' });
  } catch (error: any) {
    console.error('Purchase error:', error);
    res.status(400).json({ error: error.message || 'Transaction failed' });
  }
});

// Create listing
router.post('/list', authenticateUser, async (req, res) => {
  try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
      const sellerId = req.user.uid;
      const { title, description, pricePoints, type, fileUrl, previewUrl } = req.body;

      if (!title || !pricePoints || !type) {
          return res.status(400).json({ error: 'Missing required fields' });
      }

      const itemRef = await db.collection('marketplaceItems').add({
          sellerId,
          title,
          description,
          type,
          pricePoints: Number(pricePoints),
          fileUrl,
          previewUrl,
          isSold: false,
          soldTo: null,
          soldAt: null,
          createdAt: new Date()
      });

      res.status(201).json({ success: true, itemId: itemRef.id });

  } catch (error) {
      console.error('Error creating listing:', error);
      res.status(500).json({ error: 'Failed to create listing' });
  }
});

export default router;

const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const { protect, adminOnly } = require('../middleware/auth');
const auth = require('../controllers/authController');
const games = require('../controllers/gameController');
const orders = require('../controllers/orderController');

// Public endpoints
router.post('/register', asyncHandler(auth.register));
router.post('/login', asyncHandler(auth.login));
router.get('/games', asyncHandler(games.index));
router.get('/games/:id', asyncHandler(games.show));

// Authenticated customer endpoints
router.post('/logout', protect, auth.logout);
router.get('/me', protect, auth.me);
router.get('/orders', protect, asyncHandler(orders.index));
router.post('/orders', protect, asyncHandler(orders.store));
router.get('/orders/:id', protect, asyncHandler(orders.show));

// Admin endpoints
router.post('/admin/games', protect, adminOnly, asyncHandler(games.store));
router.put('/admin/games/:id', protect, adminOnly, asyncHandler(games.update));
router.delete('/admin/games/:id', protect, adminOnly, asyncHandler(games.destroy));
router.get('/admin/orders', protect, adminOnly, asyncHandler(orders.allOrders));
router.patch('/admin/orders/:id/status', protect, adminOnly, asyncHandler(orders.updateStatus));

module.exports = router;

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateJWT, authenticatedRole } = require('../middleware/auth');

router.get('/products', authenticateJWT, authenticatedRole, productController.getProducts);
router.post('/product', authenticateJWT, authenticatedRole, productController.createProduct);
router.delete('/products/:id', authenticateJWT, authenticatedRole, productController.deleteProduct);
router.put('/products/:id', authenticateJWT, authenticatedRole, productController.updateProduct);
router.patch('/products/:id', authenticateJWT, authenticatedRole, productController.partialUpdateProduct);

module.exports = router;
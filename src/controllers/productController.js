const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
  getProducts: async (req, res) => {
    try {
      const products = await prisma.products.findMany();
      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Error fetching products' });
    }
  },

  createProduct: async (req, res) => {
    try {
      const { category, name, price } = req.body;
      if (!category || !name || !price) {
        return res.status(404).json({ error: 'Require all params: category, name, price' })
      }
      const newProduct = await prisma.products.create({
        data: {
          category,
          name,
          price: parseFloat(price),
        }
      });
      res.status(201).json(newProduct);
    } catch (error) {
      console.error('Error creating product', error);
      res.status(500).json({ error: 'Error creating product' });
    }
  },

  deleteProduct: async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await prisma.products.findUnique({
        where: {
          id: productId,
        }
      });

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      await prisma.products.delete({
        where: {
          id: productId,
        }
      });

      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ error: 'Error deleting product' });
    }
  },

  updateProduct: async (req, res) => {
    try {
      // 更新產品的邏輯...
      const productId = parseInt(req.params.id);
      const { category, name, price } = req.body;
      if (!category || !name || !price) {
        return res.status(404).json({ error: 'At least enter one params from category, name, or price' })
      }
      const product = await prisma.products.findUnique({
        where: {
          id: productId,
        }
      });

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      await prisma.products.update({
        where: {
          id: productId,
        },
        data: {
          category,
          name,
          price,
        }
      });

      res.json(product);
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ error: 'Error updating product' });
    }
  },

  partialUpdateProduct: async (req, res) => {
    try {
      // 部分更新產品的邏輯...
      const productId = parseInt(req.params.id);
      const { category, name, price } = req.body;

      const product = await prisma.products.findUnique({
        where: {
          id: productId,
        }
      });

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const updatedProduct = await prisma.products.update({
        where: {
          id: productId,
        },
        data: {
          category: category !== '' ? category : product.category,
          name: name !== '' ? name : product.name,
          price: price !== '' ? parseFloat(price) : product.price,
        }
      });

      res.json(updatedProduct);
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ error: 'Error updating product' });
    }
  }
};

// const express = require('express');
// const app = express();
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();
// const port = 3000;

// app.use(cors({
//   origin: '*'
// }));

// // 使用 bodyParser.json() 將 HTTP 請求方法 POST、DELETE、PUT 和 PATCH，放在 HTTP 主體 (body) 發送的參數存放在 req.body
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({
//   extended: true
// }));

// app.get('/api/products', async (req, res) => {
//   try {
//     const products = await prisma.products.findMany();
//     res.json(products);
//   } catch (error) {
//     console.error('Error fetching products:', error);
//     res.status(500).json({ error: 'Error fetching products' });
//   } finally {
//     await prisma.$disconnect();
//   }
// });

// app.post('/api/product', async (req, res) => {
//   try {
//     const { category, name, price } = req.body;
//     const newProduct = await prisma.products.create({
//       data: {
//         category,
//         name,
//         price: parseFloat(price),
//       }
//     });
//     res.status(201).json(newProduct);
//   } catch (error) {
//     console.error('Error creating product', error);
//     res.status(500).json({ error: 'Error creating product' })
//   } finally {
//     await prisma.$disconnect();
//   }
// });

// app.delete('/api/products/:id', async (req, res) => {
//   try {
//     const productId = parseInt(req.params.id);
    
//     const product = await prisma.products.findUnique({
//       where: {
//         id: productId,
//       }
//     });
    
//     if (!product) {
//       return res.status(404).json({ error: 'Product not found' });
//     }
    
//     await prisma.products.delete({
//       where: {
//         id: productId,
//       }
//     });
    
//     res.json({ message: 'Product deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting product:', error);
//     res.status(500).json({ error: 'Error deleting product' });
//   } finally {
//     await prisma.$disconnect();
//   }
// });

// app.put('/api/products/:id', async (req, res) => {
//   try {
//     const productId = parseInt(req.params.id);
//     const { category, name, price } = req.body;

//     const product = await prisma.products.findUnique({
//       where: {
//         id: productId,
//       }
//     });

//     if (!product) {
//       return res.status(404).json({ error: 'Product not found' });
//     }

//     await prisma.products.update({
//       where: {
//         id: productId,
//       },
//       data: {
//         category,
//         name,
//         price,
//       }
//     });

//     res.json(product);
//   } catch (error) {
//     console.error('Error updating product:', error);
//     res.status(500).json({ error: 'Error updating product' });
//   } finally {
//     await prisma.$disconnect();
//   }
// });

// app.patch('/api/products/:id', async (req, res) => {
//   try {
//     const productId = parseInt(req.params.id);
//     const { category, name, price } = req.body;

//     const product = await prisma.products.findUnique({
//       where: {
//         id: productId,
//       }
//     });

//     if (!product) {
//       return res.status(404).json({ error: 'Product not found' });
//     }

//     const updatedProduct = await prisma.products.update({
//       where: {
//         id: productId,
//       },
//       data: {
//         category: category !== '' ? category : product.category,
//         name: name !== '' ? name : product.name,
//         price: price !== '' ? parseFloat(price) : product.price,
//       }
//     });

//     res.json(updatedProduct);
//   } catch (error) {
//     console.error('Error updating product:', error);
//     res.status(500).json({ error: 'Error updating product' });
//   } finally {
//     await prisma.$disconnect();
//   }
// });

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });


const express = require('express');
const app = express();
const port = 3000;
const corsMiddleware = require('./middleware/corsMiddleware');
const bodyParserMiddleware = require('./middleware/bodyParserMiddleware');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const dataRoutes = require('./routes/dataRoutes');

app.use(corsMiddleware);
app.use(bodyParserMiddleware);
app.use('/api', productRoutes);
app.use('/api', userRoutes);
app.use('/api', dataRoutes)


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

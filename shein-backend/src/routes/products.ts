import { Router, Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { Product } from '../models/Product';
import { sheinScraperService } from '../services/sheinScraper';
import { optionalAuth } from '../middleware/auth';
import { ApiResponse, PaginatedResponse } from '../types';

const router = Router();

// GET /api/products/search?code=PRODUCTCODE
router.get(
  '/search',
  [
    query('code')
      .notEmpty()
      .withMessage('Product code is required')
      .isLength({ min: 3, max: 20 })
      .withMessage('Product code must be between 3 and 20 characters'),
  ],
  optionalAuth,
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        } as ApiResponse);
        return;
      }

      const { code } = req.query as { code: string };
      const productCode = code.toUpperCase().trim();

      // First, check if product exists in our database
      let product = await Product.findOne({ code: productCode });

      if (!product) {
        // If not found, try to scrape from SHEIN
        const scrapedData = await sheinScraperService.searchProductByCode(productCode);
        
        if (scrapedData) {
          // Save scraped product to database
          product = new Product({
            code: productCode,
            name: scrapedData.title,
            price: scrapedData.price.current,
            originalPrice: scrapedData.price.original,
            image: scrapedData.images[0],
            images: scrapedData.images,
            description: scrapedData.description,
            sizes: scrapedData.specifications.sizes,
            colors: scrapedData.specifications.colors,
            rating: scrapedData.rating?.score,
            reviews: scrapedData.rating?.count,
            inStock: scrapedData.availability,
          });
          
          await product.save();
        }
      }

      if (!product) {
        res.status(404).json({
          success: false,
          error: 'Product not found',
          message: `No product found with code: ${productCode}`,
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        data: product,
      } as ApiResponse);

    } catch (error) {
      console.error('Error searching product:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      } as ApiResponse);
    }
  }
);

// GET /api/products/:id
router.get(
  '/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid product ID'),
  ],
  optionalAuth,
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        } as ApiResponse);
        return;
      }

      const product = await Product.findById(req.params.id);

      if (!product) {
        res.status(404).json({
          success: false,
          error: 'Product not found',
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        data: product,
      } as ApiResponse);

    } catch (error) {
      console.error('Error getting product:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      } as ApiResponse);
    }
  }
);

// GET /api/products/featured
router.get('/featured', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const products = await Product.find({ inStock: true })
      .sort({ rating: -1, reviews: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Product.countDocuments({ inStock: true });

    res.json({
      success: true,
      data: products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    } as PaginatedResponse<typeof products[0]>);

  } catch (error) {
    console.error('Error getting featured products:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    } as ApiResponse);
  }
});

// GET /api/products/recommendations
router.get('/recommendations', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;
    const limitNum = parseInt(limit as string);

    // Simple recommendation logic - in production, implement ML-based recommendations
    const products = await Product.find({ inStock: true })
      .sort({ rating: -1 })
      .limit(limitNum);

    const recommendations = products.map((product, index) => ({
      id: `rec_${product._id}`,
      product,
      reason: index === 0 ? 'Top rated product' : 
              index === 1 ? 'Popular choice' : 
              index === 2 ? 'Trending now' : 'You might like this',
      score: 1 - (index * 0.1),
    }));

    res.json({
      success: true,
      data: recommendations,
    } as ApiResponse);

  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    } as ApiResponse);
  }
});

// POST /api/products/sync - Admin endpoint to sync products from SHEIN
router.post('/sync', async (req: Request, res: Response) => {
  try {
    // This would be an admin-only endpoint to sync products from SHEIN
    // For demo purposes, create some sample products
    
    const sampleProducts = [
      {
        code: 'SW2301001',
        name: 'Casual Cotton T-Shirt',
        price: 12.99,
        originalPrice: 19.99,
        image: 'https://img.ltwebstatic.com/images3_pi/2023/01/17/16739234953c8f8b8e5f8c8d8e8f8c8d8e8f8c8d.jpg',
        description: 'Comfortable cotton t-shirt perfect for everyday wear',
        category: 'Tops',
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: ['White', 'Black', 'Navy', 'Pink'],
        rating: 4.5,
        reviews: 1247,
        inStock: true,
      },
      {
        code: 'SW2301002',
        name: 'High Waist Denim Jeans',
        price: 24.99,
        originalPrice: 39.99,
        image: 'https://img.ltwebstatic.com/images3_pi/2023/02/15/16765234953c8f8b8e5f8c8d8e8f8c8d8e8f8c8d.jpg',
        description: 'Trendy high-waist denim jeans with stretch fabric',
        category: 'Bottoms',
        sizes: ['26', '27', '28', '29', '30', '31', '32'],
        colors: ['Light Blue', 'Dark Blue', 'Black'],
        rating: 4.3,
        reviews: 892,
        inStock: true,
      },
      {
        code: 'SW2301003',
        name: 'Floral Summer Dress',
        price: 18.99,
        originalPrice: 29.99,
        image: 'https://img.ltwebstatic.com/images3_pi/2023/03/10/16783234953c8f8b8e5f8c8d8e8f8c8d8e8f8c8d.jpg',
        description: 'Beautiful floral print dress perfect for summer occasions',
        category: 'Dresses',
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: ['Pink Floral', 'Blue Floral', 'Yellow Floral'],
        rating: 4.7,
        reviews: 654,
        inStock: true,
      },
    ];

    for (const productData of sampleProducts) {
      await Product.findOneAndUpdate(
        { code: productData.code },
        productData,
        { upsert: true, new: true }
      );
    }

    res.json({
      success: true,
      message: `Synced ${sampleProducts.length} products`,
      data: sampleProducts,
    } as ApiResponse);

  } catch (error) {
    console.error('Error syncing products:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    } as ApiResponse);
  }
});

export default router;
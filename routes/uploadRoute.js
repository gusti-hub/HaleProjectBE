const express = require('express');
const router = express.Router();
const upload = require('./upload');
const Products = require('../models/Product');

router.post('/upload', upload.single('image'), (req, res) => {
  res.json({ imageUrl: req.file.location });
});

router.put('/upload/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const imageUrl = req.file.location;

    const updatedProduct = await Products.findByIdAndUpdate(
      id,
      { imageUrl },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Image updated successfully', imageUrl: updatedProduct.imageUrl });
  } catch (error) {
    console.error('Error updating image:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

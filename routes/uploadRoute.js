const express = require('express');
const router = express.Router();
const { upload, deleteFileFromBucket } = require('./upload');
const Products = require('../models/Product');
const Employee = require('../models/Employee');
const User = require('../models/User');

router.post('/upload', upload.single('image'), (req, res) => {
  res.json({ imageUrl: req.file.location });
});

router.put('/delete-profile-img/:id', async (req, res) => {
  const { id } = req.params;
  const { fileUrl } = req.body;

  try {
    let user = await Employee.findById(id);
    let userType = "Employee";

    if (!user) {
      user = await User.findById(id);
      userType = "Client";
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.imageUrl = "";

    await user.save();

    const fileKey = fileUrl.split('/').slice(-2).join('/');

    await deleteFileFromBucket(fileKey);

    res.status(200).json({ message: 'Profile picture deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
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

const express = require('express');
const Comments = require('../models/Comment.js');

const router = express.Router();

router.post('/newComment', async (req, res) => {
    try {
        const { projectId, userName, body } = req.body;

        const newComment = new Comments({
            projectId, userName, body
        });

        const savedComment = await newComment.save();

        res.status(201).json({ message: "Your comment has been stored!", savedComment});
    } catch (error) {
        console.error('Error saving comment', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/getComments/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;
        const comments = await Comments.find({ projectId });
        res.json(comments);
    } catch (err) {
        res.status(500).json({ error: 'An error occurred while fetching comments' });
    }
});


module.exports = router;
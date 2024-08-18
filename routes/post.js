const express = require('express')
const route = express.Router()
const Post = require('../models/post')

// Return all posts
route.get('/', async (req, res) => {
    const search = req.query.search || '';
    try {
        const posts = await Post.find({
            $or: [
                { title: { $regex: search, $options: 'i' } },
                { tag: { $regex: search, $options: 'i' } }
            ]
        }); // Fetch all posts from the database
        if (posts.length==0){
            return res.status(404).json({message: "no post found"})
            
        }
        res.status(200).json(posts); // Return the posts with a 200 status code
    } catch (error) {
        console.error('Error fetching posts:', error); // Log the error for debugging
        res.status(500).json({ message: 'Error fetching posts', details: error.message }); // Return a 500 status with error details
    }
});



// Return a single post by ID
route.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' }); // Handle case where post doesn't exist
        }

        res.status(200).json(post); // Return the post with a 200 status code
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).send({ message: 'Error fetching post', details: error.message }); // Send a clear error message
    }
});


// Create a post
route.post("/", async (req, res) => {
    // You could alternatively use the data from the request body (req.body) for a more dynamic post creation.
    const post = {
        title: req.body.title,
        content: req.body.content,
        tag: req.body.tag,
        imageUrl: req.body.imageUrl
    }
    const newPost = new Post(post);
  
    try {
      await newPost.save(); // Save the new post to the database
      res.status(201).json(newPost); // Return the newly created post with a 201 status code
    } catch (err) {
      console.error('Error creating post:', err); // Log the error for debugging
      res.status(400).send({ error: 'Error creating post', details: err }); // Return a 400 status code with error details
    }
  });
  

// Update a post
route.patch('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        
        // Get the updated post data from the request body
        const updatedData = {
            title: req.body.title,
            imageUrl: req.body.imageUrl,
            content: req.body.content,
            tag: req.body.tag
        };
        
        // Find the post by ID and update it with the new data
        const updatedPost = await Post.findByIdAndUpdate(id, updatedData, { new: true });

        // If the post isn't found, return a 404 error
        if (!updatedPost) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Send the updated post as a response
        res.status(200).json(updatedPost);
    } catch (error) {
        console.error('Error updating post:', error); c
        res.status(500).send('Error updating post');
    }
});


// Delete a post by ID
route.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id; // Get the ID from the URL parameters
        
        // Find and delete the post by ID
        const deletedPost = await Post.findByIdAndDelete(id);
        
        if (!deletedPost) {
            return res.status(404).json({ message: 'Post not found' }); // Handle case where the post is not found
        }

        res.status(200).json({ message: 'Post deleted successfully' }); // Send success message
    } catch (error) {
        console.error('Error deleting post:', error); // Log the error for debugging
        res.status(500).json({ message: 'Error deleting post', details: error.message }); // Return error details
    }
});


module.exports = route
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/todo-app')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

// Todo schema
const todoSchema = new mongoose.Schema({
    task: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    }
});

const Todo = mongoose.model('Todo', todoSchema);

// Middleware
app.use(bodyParser.json());

// Routes
// Get all todos
app.get('/todos', async (req, res) => {
    try {
        const todos = await Todo.find();
        res.json(todos);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a todo
app.post('/todos', async (req, res) => {
    const todo = new Todo({
        task: req.body.task
    });
    try {
        const newTodo = await todo.save();
        res.status(201).json(newTodo);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update a todo
app.patch('/todos/:id', async (req, res) => {
    try {
        const updatedTodo = await Todo.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        res.json(updatedTodo);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a todo
app.delete('/todos/:id', async (req, res) => {
    try {
        await Todo.findByIdAndRemove(req.params.id);
        res.json({ message: 'Todo deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

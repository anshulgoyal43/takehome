    const express = require('express');
    const bodyParser = require('body-parser');
    const mongoose = require('mongoose');
const { title } = require('process');

    const app = express();
    const PORT = process.env.PORT || 3000;

    // MongoDB connection
    mongoose.connect('mongodb://localhost:27017/todo-app')
        .then(() => console.log('Connected to MongoDB'))
        .catch(err => console.error('Failed to connect to MongoDB', err));

    // Todo schema
    const taskSchema = new mongoose.Schema({
        title: {
            type: String,
            required: true
        },
        description: { type: String, required: false},
        status: {
            type: String,
            enum: ['To Do', 'In Progress', 'Done'],
            default: 'To Do',
            required: true
        }
    });

    const Task = mongoose.model('TodoApp', taskSchema);

    // Middleware
    app.use(bodyParser.json());

    // Routes
    // Get all tasks
    app.get('/tasks', async (req, res) => {
        try {
            const tasks = await Task.find();
            res.json(tasks);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    });

    // Create a task
    app.post('/tasks', async (req, res) => {
        const task = new Task({
            title: req.body.title,
            description: req.body.description,
            status: req.body.status
        });
        try {
            const newTask = await task.save();
            res.status(201).json(newTask);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    });

    // Update a task
    app.patch('/tasks/:id', async (req, res) => {
        try {
            const updatedTask = await Task.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
            res.json(updatedTask);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    });

    // Delete a task
    app.delete('/tasks/:id', async (req, res) => {
        try {
            await Task.findByIdAndRemove(req.params.id);
            res.json({ message: 'Task deleted' });
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

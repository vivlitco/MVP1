require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');
const Jar = require('./models/Jar');

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.warn("⚠️ MONGODB_URI is not defined in .env. Database features will fail.");
            return;
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    }
};

connectDB();

// For MVP, we'll accept it as a query param or header for simplicity, 
// but let's try to be slightly cleaner and expect a 'x-user-id' header.
app.get('/api/jars', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) {
            return res.status(401).json({ error: 'User ID required' });
        }

        const jars = await Jar.find({ ownerId: userId }).sort({ createdAt: -1 });
        res.json(jars);
    } catch (error) {
        console.error('Fetch jars error:', error);
        res.status(500).json({ error: 'Failed to fetch jars.' });
    }
});

// Create or Update a Jar
app.post('/api/jars', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) {
            return res.status(401).json({ error: 'User ID required' });
        }

        const jarData = req.body;

        if (jarData.id && !jarData.id.startsWith('jar-')) {
            // It's an update if it has a valid MongoDB ID (we'll assume non-temp IDs are real)
            // Actually, the frontend sends 'jar-timestamp' IDs for temp ones. 
            // Let's rely on the presence of `_id` in the body if we were strictly following REST,
            // but the frontend sends the whole object.

            // Strategy: If the ID looks like a MongoDB ObjectId, update. Else, create new.
            if (mongoose.Types.ObjectId.isValid(jarData.id)) {
                const updatedJar = await Jar.findByIdAndUpdate(
                    jarData.id,
                    { ...jarData, ownerId: userId },
                    { new: true }
                );
                return res.json(updatedJar);
            }
        }

        // Create New
        const newJar = new Jar({
            ...jarData,
            ownerId: userId,
            // Ensure we don't save the temporary 'jar-...' ID as the _id
        });

        // If the frontend sent an ID, we ignore it and let Mongo generate _id.
        // However, we need to return the new _id so frontend can update.

        const savedJar = await newJar.save();

        // Map _id to id for frontend compatibility if needed, 
        // but better to just return the object and let frontend handle it.
        const responseObj = savedJar.toObject();
        responseObj.id = savedJar._id.toString(); // Ensure id field exists

        res.status(201).json(responseObj);

    } catch (error) {
        console.error('Save jar error:', error);
        res.status(500).json({ error: 'Failed to save jar.' });
    }
});

// Delete a Jar
app.delete('/api/jars/:id', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) {
            return res.status(401).json({ error: 'User ID required' });
        }

        await Jar.findOneAndDelete({ _id: req.params.id, ownerId: userId });
        res.json({ message: 'Jar deleted successfully' });
    } catch (error) {
        console.error('Delete jar error:', error);
        res.status(500).json({ error: 'Failed to delete jar.' });
    }
});

// Get Shared Jar (Public/Shared access)
app.get('/api/jars/shared/:id', async (req, res) => {
    try {
        const jar = await Jar.findById(req.params.id);
        if (!jar) {
            return res.status(404).json({ error: 'Jar not found' });
        }

        // Transform _id to id
        const responseObj = jar.toObject();
        responseObj.id = jar._id.toString();

        res.json(responseObj);
    } catch (error) {
        console.error('Fetch shared jar error:', error);
        res.status(500).json({ error: 'Failed to fetch shared jar.' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

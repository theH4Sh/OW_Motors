const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
require('dotenv').config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB...");

        const adminExists = await User.findOne({ role: 'admin' });
        if (adminExists) {
            console.log("Admin already exists!");
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('admin123', salt);

        const admin = new User({
            username: 'admin',
            email: 'admin@owmotors.local',
            password: hash,
            role: 'admin',
            branch: 'HQ',
            isVerified: true
        });

        await admin.save();
        console.log("Admin seeded successfully! username: admin, password: admin123");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding admin:", error);
        process.exit(1);
    }
}

seedAdmin();

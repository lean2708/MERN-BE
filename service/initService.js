const userModel = require('../model/userModel');
const bcrypt = require('bcryptjs');


const createDefaultAdmin = async () => {
    try {
        const email = process.env.DEFAULT_ADMIN_EMAIL;
        const password = process.env.DEFAULT_ADMIN_PASSWORD;
        const name = process.env.DEFAULT_ADMIN_NAME;

        if (!email || !password) {
            console.warn("ADMIN: Missing DEFAULT_ADMIN_EMAIL or DEFAULT_ADMIN_PASSWORD in .env");
            return;
        }

        // check if admin already exists
        const existingAdmin = await userModel.findOne({ email: email });

        if (existingAdmin) {
            console.log("Admin user already exists. Skipping creation.");
            return;
        }

        console.log("Creating default admin...");

        const salt = bcrypt.genSaltSync(10);
        const hashPassword = bcrypt.hashSync(password, salt);

        const adminUser = new userModel({
            name: name || "Admin",
            email: email,
            password: hashPassword,
            role: "ADMIN" 
        });

        await adminUser.save();
        console.log("Creating default admin successful.");

    } catch (error) {
        console.error("Error creating default admin:", error.message);
    }
}



module.exports = {
    createDefaultAdmin
};
const userModel = require("../model/userModel");
const passwordReset = require("../model/PasswordReset");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateToken, verifyToken } = require('../service/jwtService');
const { sendOtpForgotPassowrd } = require("../service/emailService");


const authController = {

    
    // Register user
    signUp: async (req, res) => {
        try {
            const { email, password, name } = req.body;
            console.log("Register request receive for email :", email);

            if (!email) {
                throw new Error("Please provide email");
            }
            if (!password) {
                throw new Error("Please provide password");
            }
            if (!name) {
                throw new Error("Please provide name");
            }
            
            const user = await userModel.findOne({ email });
            if (user) {
                throw new Error("Already user exist");
            }

            const salt = bcrypt.genSaltSync(10);
            const hashPassword = await bcrypt.hashSync(password, salt);

            if (!hashPassword) {
                throw new Error("Something is wrong");
            }

            const payload = {
                ...req.body,
                role: 'USER', 
                password: hashPassword
            };

            const userData = new userModel(payload);
            const saveUser = await userData.save();

            console.log("User created successfully:", saveUser.email);

            res.status(201).json({
                data: saveUser,
                success: true,
                error: false,
                message: "User created successfully!"
            });

        } catch (err) {
            console.log("UserSignUp Controller ERROR:", {
                message: err.message,
                stack: err.stack
            });
            res.json({
                message: err.message || err,
                error: true,
                success: false 
            });
        }
    },

    

    // Login user
    signIn: async (req, res) => {
        try {
            const { email, password } = req.body;
            console.log("Login request receive for email :", email);

            if (!email) {
                throw new Error("Please provide email");
            }
            if (!password) {
                throw new Error("Please provide password");
            }

            const user = await userModel.findOne({ email });
            if (!user) {
                throw new Error("User not found");
            }

            const checkPassword = await bcrypt.compare(password, user.password);

            if (checkPassword) {
                const token = generateToken(user._id, email, parseInt(process.env.TOKEN_EXPIRE) * 60);

                const tokenOption = {
                    httpOnly: true,
                    secure: user.email
                };

                console.log("Login Successfully :", email);

                res.cookie("token", token, tokenOption).json({
                    message: "Login successfully",
                    data: token,
                    success: true,
                    error: false
                });

            } else {
                throw new Error("Please check Password");
            }

        } catch (err) {
            console.log("UserSignIn Controller ERROR:", {
                message: err.message,
                stack: err.stack
            });
            res.json({
                message: err.message || err,
                error: true,
                success: false
            });
        }
    },

    

    // Logout user
    logout: async (req, res) => {
        try {
            console.log("Logout request");

            res.clearCookie("token");

            console.log("Logout successfully");

            res.json({
                message: "Logout successfully",
                error: false,
                success: true,
                data: []
            });

        } catch (err) {
            console.log("UserLogout Controller ERROR:", {
                message: err.message,
                stack: err.stack
            });
            res.json({
                message: err.message || err,
                error: true,
                success: false
            });
        }
    },

    // Forgot Password - Send OTP
    forgotPassword: async (req, res) => {
        try {
            const { email } = req.body;
            console.log("Forgot Password request received for email:", email);

            if (!email) {
                throw new Error("Please provide email");
            }

            const user = await userModel.findOne({ email });
            if (!user) {
                throw new Error("User not found");
            }

             // delete otp exist
            await passwordReset.deleteMany({ email });

            // generate otp
            const otp = generateOtp();
            // ma hoa otp
            const otpHash = await bcrypt.hash(otp, 10);
            const expiresAt = new Date(Date.now() + parseInt(process.env.OTP_EXPIRE) * 60 * 1000);

            await passwordReset.create({
                email,
                otpHash,
                expiresAt
            });

            // Send email
            await sendOtpForgotPassowrd(email, user.name, otp, process.env.OTP_EXPIRE);
            console.log("Forgot Password OTP sent successfully to:", email);

            return res.json({
                message: "OTP đã được gửi đến email của bạn",
                success: true,
                error: false
            });

        } catch (err) {
            console.log("userForgotPassword ERROR:", {
                message: err.message,
                stack: err.stack
            });
            res.json({
                message: err.message || err,
                error: true,
                success: false
            });
        }
    },

    
    // Forgot Password - Verify OTP
    verifyOtp: async (req, res) => {
        try {
            const { email, otp } = req.body;
            console.log("Verify OTP request received for email:", email, "OTP:", otp);

            if (!email || !otp) throw new Error("Missing email or OTP");

            const record = await passwordReset.findOne({ email });
            if (!record) throw new Error("OTP does not exist or has expired.");

            if (record.expiresAt < new Date()) {
                await passwordReset.deleteOne({ email });
                throw new Error("OTP has expired. Please request a new one.");
            }

            const isMatch = await bcrypt.compare(String(otp), record.otpHash);
            if (!isMatch) throw new Error("Invalid OTP.");

            const user = await userModel.findOne({ email });
            if (!user) throw new Error("User not found");

            // Generate reset token
            const resetToken = generateToken(user._id, email, parseInt(process.env.TOKEN_EXPIRE) * 60);
            console.log("OTP verified successfully for:", email);

            return res.json({
                message: "Xác thực OTP thành công",
                resetToken,
                success: true,
                error: false,
            });

        } catch (err) {
            console.log("VerifyOTP ERROR:", {
                message: err.message,
                stack: err.stack
            });
            res.json({
                message: err.message || err,
                error: true,
                success: false
            });
        }
    },

   
    // Forgot Password - Reset Password
    resetPassword: async (req, res) => {
        try {
            const { email, resetToken, newPassword, confirmPassword } = req.body;
            console.log("Reset Password request received for email:", email);

            if (!email || !resetToken || !newPassword || !confirmPassword) {
                throw new Error("Missing required fields (email, token, newPassword, confirmPassword)");
            }

            if (newPassword !== confirmPassword) {
                throw new Error("Passwords do not match");
            }

            const decoded = verifyToken(resetToken);
            if (decoded.email !== email) {
                throw new Error("Invalid or expired reset token");
            }

            const user = await userModel.findOne({ email });
            if (!user) throw new Error("User not exist");

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await userModel.updateOne({ email }, { password: hashedPassword });
            await passwordReset.deleteMany({ email });

            console.log("Password reset successfully for:", email);

            return res.json({
                message: "Đặt lại mật khẩu thành công",
                success: true,
                error: false,
            });

        } catch (err) {
            console.error("ResetPassword ERROR:", {
                message: err.message,
                stack: err.stack
            });
            res.json({
                message: err.message || err,
                error: true,
                success: false
            });
        }
    }
};

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}


module.exports = authController;
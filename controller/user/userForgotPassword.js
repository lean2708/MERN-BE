const passwordReset = require("../../model/PasswordReset");
const userModel = require("../../model/userModel");
const { sendOtpForgotPassowrd } = require("../../service/emailService");
const { generateToken, verifyToken } = require("../../service/jwtService");
const bcrypt = require('bcryptjs')

async function forgotPassword(req,res) {
    try {
        const { email } = req.body;

        console.log("Forgot Password request received for email:", email);

        if(!email){
            throw new Error("Please provide email")
        }

        const user = await userModel.findOne({ email });

        if(!user){
            throw new Error("User not found")
        }

        // delete otp exist
        await passwordReset.deleteMany({ email });

        // generate otp
        const otp = generateOtp(); 
        // ma hoa otp
        const otpHash = await bcrypt.hash(otp, 10);
        const expiresAt = new Date(Date.now() + process.env.OTP_EXPIRE * 60 * 1000 );

        await passwordReset.create({
          email,
          otpHash,
          expiresAt
        });

        // Send email
        await sendOtpForgotPassowrd(email, user.name, otp, process.env.OTP_EXPIRE)

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
            message : err.message || err,
            error : true,
            success : false
        })
    }
}


async function verifyOtp(req, res) {
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

        // Generate token
        const resetToken = generateToken(user._id, email, parseInt(process.env.TOKEN_EXPIRE) * 60)

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
            message : err.message || err,
            error : true,
            success : false
        })
    }
}


async function resetPassword(req, res) {
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
           throw new Error("Invalid reset token");
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
            message : err.message || err,
            error : true,
            success : false
        })
    }
}


function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}


module.exports = {
    forgotPassword,
    verifyOtp,
    resetPassword
}
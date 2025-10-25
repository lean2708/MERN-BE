const { sendEmail } = require("../service/emailService");


const emailController = {
    
    sendGenericEmail: async (req, res) => {
        try {
            const { toEmail, toName, otp, expiresIn, templateId } = req.body;

            if (!toEmail || !toName || !templateId) {
                throw new Error("Missing required fields: toEmail, toName, and templateId are required.");
            }

            const numericTemplateId = parseInt(templateId, 10);
            if (isNaN(numericTemplateId)) {
                throw new Error("templateId must be a number.");
            }
    
            console.log(`Generic Email API called by Admin: ${req.userId}`);

            await sendEmail(toEmail, toName, otp, expiresIn, numericTemplateId);

            res.status(200).json({
                success: true,
                error: false,
                message: "Email sent successfully."
            });

        } catch (err) {
            console.error("sendGenericEmail Controller ERROR:", {
                message: err.message,
                stack: err.stack
            });
            
            res.status(500).json({
                message: err.message || "An error occurred while sending the email.",
                error: true,
                success: false
            });
        }
    }
};

module.exports = emailController;
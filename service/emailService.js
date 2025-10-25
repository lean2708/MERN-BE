const Brevo = require('@getbrevo/brevo');



async function sendEmail(toEmail, toName, otp, expire, templateId) {
  try {
    // Create instance API and set API key
    const apiInstance = new Brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

    // Data email
    const sendSmtpEmail = {
      sender: {
        name: process.env.BREVO_SENDER_NAME,
        email: process.env.BREVO_SENDER_EMAIL,
      },
      to: [{ 
        email: toEmail,
        name: toName 
      }],
      templateId: Number(templateId),
      params: {
        name : toName,
        otp : otp,
        expiresIn : expire
      }
    };

     console.log("Sending email with params:", sendSmtpEmail.params);

    // Send email
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Send email to :", toEmail, " successfully");

  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error('Send email failed');
  }
}


async function sendOtpForgotPassowrd(toEmail, toName, otp, expiresIn) {
  const templateId = process.env.BREVO_TEMPLATE_ID_RESET_PASSWORD;

  await sendEmail(toEmail, toName, otp, expiresIn, templateId);
}

module.exports = { 
  sendEmail,
  sendOtpForgotPassowrd 
};
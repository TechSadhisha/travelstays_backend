require('dotenv').config();
const SibApiV3Sdk = require('@getbrevo/brevo');

async function sendTestEmail() {
  console.log('API Key:', process.env.BREVO_API_KEY ? 'Present' : 'Missing');
  console.log('Send From:', process.env.SEND_FROM);
  console.log('Send To:', process.env.SEND_TO);

  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  
  apiInstance.setApiKey(
    SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY
  );

  try {
    const sendSmtpEmail = {
      sender: {
        email: process.env.SEND_FROM,
        name: "Travel Stays Test",
      },
      to: [
        { email: process.env.SEND_TO, name: "Admin" }
      ],
      subject: "Brevo Test Email",
      htmlContent: "<html><body><h1>This is a test email</h1><p>If you receive this, the integration is working.</p></body></html>"
    };

    console.log('Sending email...');
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Email sent successfully. Returned data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error sending email:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.body, null, 2));
    } else {
      console.error(error);
    }
  }
}

sendTestEmail();

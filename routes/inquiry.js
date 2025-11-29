const express = require('express');
const router = express.Router();
const { Inquiry } = require('../models');

router.post('/inquiry', async (req, res) => {
  const { 
    propertyId, 
    propertyName, 
    propertyLocation, 
    name, 
    email, 
    phone, 
    message,
    checkIn,
    checkOut,
    numberOfRooms,
    numberOfGuests
  } = req.body;
  
  if (!propertyId || !propertyName || !propertyLocation || !name || !email || !phone) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  try {
    const newInquiry = await Inquiry.create({ 
      propertyId, 
      propertyName, 
      propertyLocation, 
      name, 
      email, 
      phone, 
      message,
      checkIn: checkIn || null,
      checkOut: checkOut || null,
      numberOfRooms: numberOfRooms || null,
      numberOfGuests: numberOfGuests || null
    });

    // Send email via Brevo
    const SibApiV3Sdk = require('@getbrevo/brevo');
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    
    apiInstance.setApiKey(
      SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY
    );

    try {
      await apiInstance.sendTransacEmail({
        sender: {
          email: process.env.SEND_FROM,
          name: "Travel Stays Admin",
        },
        to: [
          { email: process.env.SEND_TO, name: "Admin" }
        ],
        subject: `New Inquiry for ${propertyName}`,
        htmlContent: `
          <html>
            <body>
              <h2>New Inquiry Received From Travel Stays</h2>
              <p><strong>Property:</strong> ${propertyName} (${propertyLocation})</p>
              <p><strong>Customer Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone}</p>
              <p><strong>Check-in:</strong> ${checkIn || 'Not specified'}</p>
              <p><strong>Check-out:</strong> ${checkOut || 'Not specified'}</p>
              <p><strong>Rooms:</strong> ${numberOfRooms || 'Not specified'}</p>
              <p><strong>Guests:</strong> ${numberOfGuests || 'Not specified'}</p>
              <p><strong>Message:</strong> ${message || 'No message'}</p>
            </body>
          </html>
        `
      });
      console.log('Email sent successfully');
    } catch (emailErr) {
      console.error('Error sending email:', emailErr);
      // We don't fail the request if email fails, but we log it
    }

    res.status(200).json({ success: true, inquiryId: newInquiry.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/inquiry', async (req, res) => {
  try {
    const inquiries = await Inquiry.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ success: true, data: inquiries });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
});

module.exports = router;

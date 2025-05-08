// src/controllers/emailController.js
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

// Create transporter outside the function
const transporter = nodemailer.createTransport({
  host: 'longevityplus.store',
  port: 465,
  secure: true,
  auth: {
    user: 'aziz@longevityplus.store',
    pass: 'pidev4twin1'
  }
});

const sendEmail = async (req, res) => {
  try {
    const { to, subject, text, pdfData, fileName } = req.body;

    if (!to || !subject || !text || !pdfData || !fileName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create temp directory if it doesn't exist
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Create a temporary file path
    const tempFilePath = path.join(tempDir, fileName);
    
    // Write the PDF to a temporary file
    fs.writeFileSync(tempFilePath, pdfData, { encoding: 'base64' });

    // Setup email data
    const mailOptions = {
      from: '"Medical System" <aziz@longevityplus.store>',
      to: to,
      subject: subject,
      text: text,
      attachments: [
        {
          filename: fileName,
          path: tempFilePath,
          contentType: 'application/pdf'
        }
      ]
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    // Delete the temporary file
    fs.unlinkSync(tempFilePath);

    res.status(200).json({ 
      message: 'Email sent successfully',
      messageId: info.messageId 
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { sendEmail };
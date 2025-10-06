// Simple Express server to receive contact form submissions and send email via Nodemailer
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'All fields are required.' });
  }

  try {
    let transporter;
    let previewUrl = null;

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      // Create transporter using SMTP details from env
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      console.log('Using SMTP from environment variables');
    } else {
      // No SMTP configured: create a test account (uses Ethereal) so you can test locally
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log('No SMTP credentials found in env — using Ethereal test account (preview URL will be provided)');
    }


    const mailOptions = {
      from: `"${name}" <${email}>`,
      to: process.env.CONTACT_EMAIL || process.env.SMTP_USER || 'kevaljogani150@gmail.com',
      subject: `Portfolio contact form: ${name}`,
      text: message,
      html: `<p>${message.replace(/\n/g, '<br>')}</p><hr><p>From: ${name} &lt;${email}&gt;</p>`,
    };

    const info = await transporter.sendMail(mailOptions);
    // If using Ethereal test account, provide preview URL
    if (nodemailer.getTestMessageUrl) {
      previewUrl = nodemailer.getTestMessageUrl(info) || null;
    }

    return res.json({ success: true, previewUrl });
  } catch (err) {
    console.error('Error sending mail', err);
    // include error message for debugging but don't leak sensitive info in production
    return res.status(500).json({ success: false, error: 'Failed to send message.', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

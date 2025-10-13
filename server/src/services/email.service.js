const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    // Create a test account if in development and no SMTP config is provided
    if (config.env === 'development' && !config.email.host) {
      this.setupTestAccount();
    } else {
      this.transporter = this.createTransporter();
    }
  }

  async setupTestAccount() {
    try {
      // Create a test account using ethereal.email
      const testAccount = await nodemailer.createTestAccount();
      
      // Create reusable transporter object using the default SMTP transport
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user, // generated ethereal user
          pass: testAccount.pass, // generated ethereal password
        },
      });

      logger.info('Using Ethereal test account for emails');
      logger.info(`Test account created: ${testAccount.user}`);
      logger.info(`Password: ${testAccount.pass}`);
      logger.info('Preview URL: https://ethereal.email/message`');
    } catch (error) {
      logger.error('Failed to create test email account:', error);
      throw error;
    }
  }

  createTransporter() {
    // If in development and no SMTP config, return null (handled in sendEmail)
    if (config.env === 'development' && !config.email.host) {
      return null;
    }

    // Create reusable transporter object using the provided SMTP transport
    return nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure, // true for 465, false for other ports
      auth: {
        user: config.email.auth.user,
        pass: config.email.auth.pass,
      },
    });
  }

  async sendEmail({ to, subject, text, html, from }) {
    try {
      // In development without SMTP, log the email instead of sending
      if (config.env === 'development' && !this.transporter) {
        logger.info('=== EMAIL NOT SENT (development mode) ===');
        logger.info(`To: ${to}`);
        logger.info(`Subject: ${subject}`);
        logger.info('Body:', { text, html });
        return {
          messageId: 'dev-mode-message-id',
          previewUrl: 'https://ethereal.email',
        };
      }

      // Send mail with defined transport object
      const info = await this.transporter.sendMail({
        from: from || `"The Wedding Shade" <${config.email.from}>`,
        to: to || config.email.to,
        subject: subject || 'New message from The Wedding Shade Contact Form',
        text: text,
        html: html || text,
      });

      logger.info(`Email sent: ${info.messageId}`);
      
      // Preview only available when sending through an Ethereal account
      if (config.email.host === 'smtp.ethereal.email') {
        logger.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }

      return {
        messageId: info.messageId,
        previewUrl: nodemailer.getTestMessageUrl(info),
      };
    } catch (error) {
      logger.error('Error sending email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async sendContactForm(formData) {
    const { name, email, phone, location, eventCategory, eventType, eventDateStart, eventDateEnd, message } = formData;
    const emailSubject = `New Inquiry from ${name} - ${eventCategory}`;

    const text = `
      New contact form submission:

      - Name: ${name}
      - Email: ${email}
      - Phone: ${phone}
      - Event Location: ${location}
      - Event Category: ${eventCategory}
      - Event Type: ${eventType}
      - Start Date: ${eventDateStart}
      - End Date: ${eventDateEnd || 'N/A'}

      Message:
      ${message}
    `;

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 20px auto; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
        <div style="background-color: #0f172a; color: #fff; padding: 20px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
          <h2 style="margin: 0;">New Inquiry from ${name}</h2>
        </div>
        <div style="padding: 25px;">
          <h3 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 0;">Event Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #f5f5f5;"><td style="padding: 10px 0; color: #555; width: 150px;"><strong>Event Type</strong></td><td style="padding: 10px 0;">${eventCategory}</td></tr>
            <tr style="border-bottom: 1px solid #f5f5f5;"><td style="padding: 10px 0; color: #555;"><strong>Location</strong></td><td style="padding: 10px 0;">${location}</td></tr>
            <tr style="border-bottom: 1px solid #f5f5f5;"><td style="padding: 10px 0; color: #555;"><strong>Event Length</strong></td><td style="padding: 10px 0;">${eventType}</td></tr>
            <tr style="border-bottom: 1px solid #f5f5f5;"><td style="padding: 10px 0; color: #555;"><strong>Start Date</strong></td><td style="padding: 10px 0;">${eventDateStart}</td></tr>
            ${eventDateEnd ? `<tr style="border-bottom: 1px solid #f5f5f5;"><td style="padding: 10px 0; color: #555;"><strong>End Date</strong></td><td style="padding: 10px 0;">${eventDateEnd}</td></tr>` : ''}
          </table>

          <h3 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 25px;">Contact Information</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #f5f5f5;"><td style="padding: 10px 0; color: #555; width: 150px;"><strong>Name</strong></td><td style="padding: 10px 0;">${name}</td></tr>
            <tr style="border-bottom: 1px solid #f5f5f5;"><td style="padding: 10px 0; color: #555;"><strong>Email</strong></td><td style="padding: 10px 0;"><a href="mailto:${email}">${email}</a></td></tr>
            <tr style="border-bottom: 1px solid #f5f5f5;"><td style="padding: 10px 0; color: #555;"><strong>Phone</strong></td><td style="padding: 10px 0;">${phone}</td></tr>
          </table>

          <h3 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 25px;">Message</h3>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
            <p style="margin: 0;">${message.replace(/\n/g, '<br>')}</p>
          </div>
        </div>
        <div style="background-color: #f5f5f5; padding: 15px; font-size: 12px; color: #888; text-align: center; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
          <p style="margin: 0;">This is an automated message from The Wedding Shade contact form.</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      subject: emailSubject,
      text: text.trim(),
      html: html.trim(),
    });
  }
}

module.exports = new EmailService();

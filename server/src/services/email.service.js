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

  async sendContactForm({ name, email, subject, message }) {
    const emailSubject = subject || `New Contact Form Submission from ${name}`;
    
    const text = `
      New contact form submission:
      
      Name: ${name}
      Email: ${email}
      Subject: ${subject || 'No subject provided'}
      
      Message:
      ${message}
    `;

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f43f5e;">New Contact Form Submission</h2>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Subject:</strong> ${subject || 'No subject provided'}</p>
          
          <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee;">
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
          </div>
        </div>
        
        <div style="margin-top: 30px; font-size: 12px; color: #888; text-align: center;">
          <p>This is an automated message from The Wedding Shade contact form. Please do not reply to this email.</p>
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

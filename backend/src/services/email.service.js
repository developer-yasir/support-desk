import nodemailer from 'nodemailer';
import { decrypt } from '../utils/encryption.js';

/**
 * Get default email configuration from environment variables
 */
function getDefaultConfig() {
    return {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
        from: process.env.EMAIL_FROM || 'Support Desk <no-reply@supportdesk.com>'
    };
}

/**
 * Send email using company-specific or default configuration
 * @param {Object} company - Company object with emailConfig
 * @param {Object} options - Email options { to, subject, html, text }
 * @returns {Promise<Object>} - Nodemailer send result
 */
export async function sendEmail(company, { to, subject, html, text }) {
    try {
        // Determine which email config to use
        const useCompanyEmail = company?.emailConfig?.enabled &&
            company.emailConfig.host &&
            company.emailConfig.user;

        let config;
        if (useCompanyEmail) {
            // Use company's email configuration
            config = {
                host: company.emailConfig.host,
                port: company.emailConfig.port || 587,
                secure: company.emailConfig.secure || false,
                user: company.emailConfig.user,
                pass: decrypt(company.emailConfig.pass), // Decrypt password
                from: company.emailConfig.from || `${company.name} <${company.emailConfig.user}>`
            };
        } else {
            // Fallback to default system email
            config = getDefaultConfig();
        }

        // Validate configuration
        if (!config.user || !config.pass) {
            throw new Error('Email configuration is incomplete');
        }

        // Create transporter
        const transporter = nodemailer.createTransporter({
            host: config.host,
            port: config.port,
            secure: config.secure,
            auth: {
                user: config.user,
                pass: config.pass
            }
        });

        // Send email
        const result = await transporter.sendMail({
            from: config.from,
            to,
            subject,
            html,
            text
        });

        console.log('Email sent successfully:', result.messageId);
        return result;
    } catch (error) {
        console.error('Email sending error:', error);
        throw new Error(`Failed to send email: ${error.message}`);
    }
}

/**
 * Test email configuration by sending a test email
 * @param {Object} emailConfig - Email configuration to test
 * @param {string} testRecipient - Email address to send test to
 * @returns {Promise<Object>} - { success: boolean, message: string }
 */
export async function testEmailConfig(emailConfig, testRecipient) {
    try {
        const transporter = nodemailer.createTransporter({
            host: emailConfig.host,
            port: emailConfig.port || 587,
            secure: emailConfig.secure || false,
            auth: {
                user: emailConfig.user,
                pass: emailConfig.pass // Already decrypted
            }
        });

        // Verify connection
        await transporter.verify();

        // Send test email
        await transporter.sendMail({
            from: emailConfig.from || emailConfig.user,
            to: testRecipient,
            subject: 'Test Email - Support Desk Configuration',
            html: `
                <h2>Email Configuration Test</h2>
                <p>This is a test email to verify your email configuration.</p>
                <p>If you received this email, your SMTP settings are working correctly!</p>
                <hr>
                <p style="color: #666; font-size: 12px;">
                    Sent from Support Desk Email Configuration
                </p>
            `,
            text: 'This is a test email to verify your email configuration. If you received this, your SMTP settings are working correctly!'
        });

        return {
            success: true,
            message: 'Test email sent successfully! Check your inbox.'
        };
    } catch (error) {
        console.error('Email test error:', error);
        return {
            success: false,
            message: `Email test failed: ${error.message}`
        };
    }
}

/**
 * Generate HTML email template for ticket reply
 * @param {Object} ticket - Ticket object
 * @param {Object} comment - Comment/reply object
 * @returns {string} - HTML email content
 */
export function generateTicketReplyEmail(ticket, comment) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #4F46E5; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
                .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
                .reply { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #4F46E5; }
                .footer { background: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #666; }
                .button { display: inline-block; padding: 10px 20px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>New Reply on Your Support Ticket</h2>
                </div>
                <div class="content">
                    <p><strong>Ticket #${ticket._id?.toString().slice(-6)}</strong></p>
                    <p><strong>Subject:</strong> ${ticket.subject}</p>
                    
                    <div class="reply">
                        <p><strong>${comment.user?.name || 'Support Team'}</strong> replied:</p>
                        <p>${comment.content}</p>
                    </div>
                    
                    <p>
                        <a href="${process.env.FRONTEND_URL}/tickets/${ticket._id}" class="button">
                            View Ticket
                        </a>
                    </p>
                </div>
                <div class="footer">
                    <p>This is an automated message from ${ticket.company?.name || 'Support Desk'}.</p>
                    <p>Please do not reply to this email directly.</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

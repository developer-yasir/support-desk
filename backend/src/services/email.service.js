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
        const transporter = nodemailer.createTransport({
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
        const transporter = nodemailer.createTransport({
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

/**
 * Generate HTML email template for new ticket creation
 * @param {Object} ticket - Ticket object
 * @param {Object} creator - User object who created the ticket
 * @returns {string} - HTML email content
 */
/**
 * Generate HTML email template for new ticket creation
 * @param {Object} ticket - Ticket object
 * @param {Object} creator - User object who created the ticket
 * @returns {string} - HTML email content
 */
export function generateNewTicketEmail(ticket, creator) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <style>
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
                    background-color: #f6f9fc; 
                    margin: 0; 
                    padding: 0; 
                    color: #333333;
                    -webkit-font-smoothing: antialiased;
                }
                .wrapper {
                    width: 100%;
                    background-color: #f6f9fc;
                    padding: 40px 0;
                }
                .container { 
                    max-width: 580px; 
                    margin: 0 auto; 
                    background-color: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                    overflow: hidden;
                }
                .header {
                    padding: 30px 40px;
                    border-bottom: 1px solid #f0f0f0;
                }
                .logo {
                    font-size: 20px;
                    font-weight: 700;
                    color: #0F172A;
                    text-decoration: none;
                }
                .content { 
                    padding: 40px 40px; 
                }
                h1 {
                    font-size: 22px;
                    font-weight: 600;
                    margin: 0 0 20px;
                    color: #1a1a1a;
                }
                p { 
                    font-size: 15px;
                    line-height: 24px;
                    margin: 0 0 20px;
                    color: #444;
                }
                .ticket-box {
                    background-color: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    padding: 24px;
                    margin: 24px 0;
                }
                .item-label {
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: #64748b;
                    font-weight: 600;
                    margin-bottom: 4px;
                }
                .item-value {
                    font-size: 15px;
                    font-weight: 500;
                    color: #0f172a;
                    margin-bottom: 16px;
                }
                .item-value.last { margin-bottom: 0; }
                .description-text {
                    color: #334155;
                    font-size: 15px;
                    line-height: 1.6;
                    white-space: pre-wrap;
                }
                .item-value.subject {
                    font-size: 16px;
                    font-weight: 600;
                    color: #0f172a;
                }
                .btn-container {
                    text-align: center;
                    margin-top: 32px;
                    padding-bottom: 10px;
                }
                .btn { 
                    display: inline-block; 
                    background-color: #0F172A; 
                    color: #ffffff !important; 
                    padding: 14px 32px; 
                    text-decoration: none; 
                    border-radius: 6px; 
                    font-size: 16px; 
                    font-weight: 600;
                    box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.1), 0 2px 4px -1px rgba(15, 23, 42, 0.06);
                }
                .footer { 
                    padding: 30px 40px; 
                    background-color: #fcfcfc;
                    border-top: 1px solid #f0f0f0;
                    font-size: 13px; 
                    color: #94a3b8; 
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <div class="wrapper">
                <div class="container">
                    <div class="header">
                        <span class="logo">${ticket.company || 'Support Desk'}</span>
                    </div>
                    
                    <div class="content">
                        <h1>Hi ${creator.name},</h1>
                        <p>We've received your request. A support ticket has been created and our team will be in touch shortly.</p>

                        <div class="ticket-box">
                            <div class="item-label">Ticket ID</div>
                            <div class="item-value">#${ticket.ticketNumber || ticket._id.toString().slice(-6)}</div>

                            <div class="item-label">Subject</div>
                            <div class="item-value subject">${ticket.subject}</div>

                            <div class="item-label">Description</div>
                            <div class="description-text">${ticket.description}</div>
                        </div>

                        <div class="btn-container">
                            <a href="${process.env.FRONTEND_URL}/tickets/${ticket._id}" class="btn">View Ticket</a>
                        </div>
                    </div>

                    <div class="footer">
                        Sent by ${ticket.company || 'Support Desk'}<br>
                        Please do not reply to this email directly.
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
}

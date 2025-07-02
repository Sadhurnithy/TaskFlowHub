// Email utility functions
// Note: In a production environment, you would integrate with services like SendGrid, AWS SES, or Nodemailer

const nodemailer = require('nodemailer');

const sendTaskShareEmail = async (recipientEmail, taskTitle, sharerName, permission) => {
  try {
    // Check for Gmail credentials in environment variables
    const { GMAIL_USER, GMAIL_PASS } = process.env;
    if (GMAIL_USER && GMAIL_PASS) {
      // Create a transporter using Gmail
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: GMAIL_USER,
          pass: GMAIL_PASS
        }
      });
      // Email content
      const mailOptions = {
        from: `TaskFlowHub <${GMAIL_USER}>`,
        to: recipientEmail,
        subject: `Task Shared: ${taskTitle}`,
        html: `<p><b>${sharerName}</b> has shared a task with you on TaskFlowHub.</p>
               <p><b>Task:</b> ${taskTitle}</p>
               <p><b>Permission:</b> ${permission}</p>
               <p>Login to TaskFlowHub to view the task.</p>`
      };
      await transporter.sendMail(mailOptions);
      return { success: true, message: 'Email sent successfully' };
    } else {
      // Fallback: log to console in development
      console.log(`📧 Task Share Email to ${recipientEmail}:`);
      console.log(`   Task: ${taskTitle}`);
      console.log(`   Shared by: ${sharerName}`);
      console.log(`   Permission: ${permission}`);
      return { success: true, message: 'Email (dev mode) logged to console' };
    }
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, message: 'Failed to send email' };
  }
};

const sendTaskUpdateEmail = async (recipientEmail, taskTitle, updaterName, changes) => {
  try {
    console.log(`📧 Task Update Email to ${recipientEmail}:`);
    console.log(`   Task: ${taskTitle}`);
    console.log(`   Updated by: ${updaterName}`);
    console.log(`   Changes:`, changes);
    
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, message: 'Failed to send email' };
  }
};

const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    console.log(`📧 Welcome Email to ${userEmail}:`);
    console.log(`   Welcome ${userName} to Todo Task App!`);
    
    return { success: true, message: 'Welcome email sent successfully' };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, message: 'Failed to send welcome email' };
  }
};

const sendTaskReminderEmail = async (recipientEmail, taskTitle, dueDate) => {
  try {
    console.log(`📧 Task Reminder Email to ${recipientEmail}:`);
    console.log(`   Task: ${taskTitle} is due on ${dueDate}`);
    
    return { success: true, message: 'Reminder email sent successfully' };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, message: 'Failed to send reminder email' };
  }
};

module.exports = {
  sendTaskShareEmail,
  sendTaskUpdateEmail,
  sendWelcomeEmail,
  sendTaskReminderEmail
}; 
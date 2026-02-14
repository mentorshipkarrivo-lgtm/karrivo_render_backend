import nodeMailer from "nodemailer";


const SMTP_CONFIG = {
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "mentorship.karrivo@gmail.com",
    pass: "ivou ivpe lgzt bbuh",
  },
};

const FROM_EMAIL = "Karrivo <mentorship.karrivo@gmail.com>";

class emailService {
  static async sendMail(email, subject, htmlContent) {
    try {
      const transporter = nodeMailer.createTransport(SMTP_CONFIG);

      const info = await transporter.sendMail({
        from: FROM_EMAIL,
        to: email,
        subject,
        html: htmlContent,
      });

      console.log("Message sent: %s", info.messageId);
      return info.messageId;
    } catch (error) {
      console.error("Error sending mail:", error);
      throw error;
    }
  }


  static async sendOtpMail(email, name, otp, otpType) {
    let subject = "";
    let purpose = "";
    let message = "";

    switch (otpType) {
      case "register":
        subject = "Verify Your Karrivo Account";
        purpose = "Account Registration";
        message = "Thank you for registering with Karrivo! Please use the OTP below to verify your account.";
        break;
      case "forgotPassword":
        subject = "Reset Your Karrivo Password";
        purpose = "Password Reset";
        message = "We received a request to reset your password. Please use the OTP below to proceed.";
        break;
      case "changePassword":
      case "ChangePassword":
        subject = "Verify Password Change Request";
        purpose = "Password Change";
        message = "We received a request to change your password. Please use the OTP below to verify this change.";
        break;
      default:
        subject = "Your Karrivo OTP";
        purpose = "Verification";
        message = "Please use the OTP below to complete your verification.";
    }

    const htmlContent = `<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        font-family: Helvetica, Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f4f4f4;
      }
      .email-container {
        max-width: 600px;
        margin: 30px auto;
        background-color: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      .header {
        background-color: #00466a;
        padding: 20px;
        text-align: center;
      }
      .header a {
        font-size: 1.8em;
        color: #ffffff;
        text-decoration: none;
        font-weight: 600;
      }
      .content {
        padding: 30px;
        line-height: 1.6;
      }
      .otp-box {
        background-color: #f0f8ff;
        border: 2px dashed #00466a;
        border-radius: 8px;
        padding: 20px;
        text-align: center;
        margin: 25px 0;
      }
      .otp-code {
        font-size: 2em;
        font-weight: bold;
        color: #00466a;
        letter-spacing: 5px;
        margin: 10px 0;
      }
      .otp-validity {
        color: #666;
        font-size: 0.9em;
        margin-top: 10px;
      }
      .warning {
        background-color: #fff3cd;
        border-left: 4px solid #ffc107;
        padding: 12px;
        margin: 20px 0;
        font-size: 0.9em;
        color: #856404;
      }
      .footer {
        background-color: #f9f9f9;
        padding: 20px;
        text-align: center;
        font-size: 0.85em;
        color: #888;
        border-top: 1px solid #eee;
      }
      .button {
        display: inline-block;
        padding: 12px 30px;
        background-color: #00466a;
        color: #ffffff;
        text-decoration: none;
        border-radius: 5px;
        margin: 15px 0;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">
        <a href="https://karrivo.com">Karrivo</a>
      </div>
      
      <div class="content">
        <h2 style="color: #00466a; margin-bottom: 10px;">Hello ${name || 'User'},</h2>
        
        <p>${message}</p>
        
        <div class="otp-box">
          <p style="margin: 0; color: #666; font-size: 0.9em;">Your OTP for ${purpose}</p>
          <div class="otp-code">${otp}</div>
          <p class="otp-validity">⏱️ This OTP is valid for 10 minutes</p>
        </div>
        
        <p style="margin-top: 25px;">If you didn't request this OTP, please ignore this email or contact our support team immediately.</p>
        
        <div class="warning">
          <strong>⚠️ Security Notice:</strong> Never share your OTP with anyone. Karrivo will never ask for your OTP via phone or email.
        </div>
        
        <p style="margin-top: 25px;">
          Need help? Contact us at 
          <a href="mailto:support@karrivo.com" style="color: #00466a;">support@karrivo.com</a>
        </p>
        
        <p style="margin-top: 30px;">Best regards,<br><strong>The Karrivo Team</strong></p>
      </div>
      
      <div class="footer">
        <p>Karrivo - Empowering Your Career Journey</p>
        <p style="margin: 10px 0;">This is an automated message. Please do not reply to this email.</p>
        <p style="margin: 5px 0;">
          © ${new Date().getFullYear()} Karrivo. All rights reserved.
        </p>
      </div>
    </div>
  </body>
</html>`;

    return this.sendMail(email, subject, htmlContent);
  }



  static async sendApplicationSubmittedMail(email, name) {
  const subject = "Your Mentorship Application Has Been Submitted";

  const htmlContent = `<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        font-family: Helvetica, Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
      }
      .email-container {
        max-width: 600px;
        margin: 30px auto;
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        overflow: hidden;
      }
      .header {
        background-color: #00466a;
        padding: 20px;
        text-align: center;
        color: #ffffff;
        font-size: 1.8em;
        font-weight: bold;
      }
      .content {
        padding: 30px;
        line-height: 1.6;
        color: #333;
      }
      .status-box {
        background-color: #f0f8ff;
        border-left: 4px solid #00466a;
        padding: 15px;
        margin: 20px 0;
        border-radius: 5px;
      }
      .footer {
        background-color: #f9f9f9;
        padding: 20px;
        text-align: center;
        font-size: 0.85em;
        color: #888;
        border-top: 1px solid #eee;
      }
    </style>
  </head>

  <body>
    <div class="email-container">
      <div class="header">
        Karrivo
      </div>

      <div class="content">
        <h2>Hello ${name || "Applicant"},</h2>

        <p>
          Thank you for submitting your mentorship application on <strong>Karrivo</strong>.
          We have successfully received your application.
        </p>

        <div class="status-box">
          <strong> Application Status:</strong> Pending Review
        </div>

        <p>
          Our team will carefully review your details. If your profile matches our current
          requirements, we’ll reach out to you via email with the next steps.
        </p>

        <p>
          We appreciate the time and effort you put into your application.
        </p>

        <p style="margin-top: 30px;">
          Best regards,<br />
          <strong>The Karrivo Team</strong>
        </p>
      </div>

      <div class="footer">
        <p>Karrivo – Empowering Your Career Journey</p>
        <p>This is an automated email. Please do not reply.</p>
        <p>© ${new Date().getFullYear()} Karrivo</p>
      </div>
    </div>
  </body>
</html>`;

  return this.sendMail(email, subject, htmlContent);
}



  static async sendPasswordResetConfirmation(email, name) {
    const subject = "Password Successfully Reset";
    const htmlContent = `<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        font-family: Helvetica, Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f4f4f4;
      }
      .email-container {
        max-width: 600px;
        margin: 30px auto;
        background-color: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      .header {
        background-color: #00466a;
        padding: 20px;
        text-align: center;
      }
      .header a {
        font-size: 1.8em;
        color: #ffffff;
        text-decoration: none;
        font-weight: 600;
      }
      .content {
        padding: 30px;
        line-height: 1.6;
      }
      .success-box {
        background-color: #d4edda;
        border-left: 4px solid #28a745;
        padding: 15px;
        margin: 20px 0;
        border-radius: 4px;
      }
      .success-icon {
        font-size: 2em;
        color: #28a745;
        margin-bottom: 10px;
      }
      .info-box {
        background-color: #e7f3ff;
        border-left: 4px solid #2196F3;
        padding: 15px;
        margin: 20px 0;
        border-radius: 4px;
      }
      .footer {
        background-color: #f9f9f9;
        padding: 20px;
        text-align: center;
        font-size: 0.85em;
        color: #888;
        border-top: 1px solid #eee;
      }
      .button {
        display: inline-block;
        padding: 12px 30px;
        background-color: #00466a;
        color: #ffffff;
        text-decoration: none;
        border-radius: 5px;
        margin: 15px 0;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">
        <a href="https://karrivo.com">Karrivo</a>
      </div>
      
      <div class="content">
        <h2 style="color: #00466a; margin-bottom: 10px;">Hello ${name || 'User'},</h2>
        
        <div class="success-box">
          <div class="success-icon">✅</div>
          <p style="margin: 0; font-size: 1.1em; color: #155724;">
            <strong>Password Reset Successful!</strong>
          </p>
        </div>
        
        <p>Your password has been successfully reset. You can now log in to your Karrivo account using your new password.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://karrivo.com/login" class="button">Login to Your Account</a>
        </div>
        
        <div class="info-box">
          <p style="margin: 0;">
            <strong>🔒 Security Reminder:</strong><br>
            If you did not perform this password reset, please contact our support team immediately at 
            <a href="mailto:support@karrivo.com" style="color: #00466a;">support@karrivo.com</a>
          </p>
        </div>
        
        <p style="margin-top: 25px;"><strong>Tips to keep your account secure:</strong></p>
        <ul style="color: #666;">
          <li>Use a strong, unique password</li>
          <li>Never share your password with anyone</li>
          <li>Enable two-factor authentication if available</li>
          <li>Regularly update your password</li>
        </ul>
        
        <p style="margin-top: 30px;">Best regards,<br><strong>The Karrivo Team</strong></p>
      </div>
      
      <div class="footer">
        <p>Karrivo - Empowering Your Career Journey</p>
        <p style="margin: 10px 0;">This is an automated message. Please do not reply to this email.</p>
        <p style="margin: 5px 0;">
          © ${new Date().getFullYear()} Karrivo. All rights reserved.
        </p>
      </div>
    </div>
  </body>
</html>`;

    return this.sendMail(email, subject, htmlContent);
  }


  static async sendPasswordChangeConfirmation(email, name) {
    const subject = "Password Changed Successfully";
    const htmlContent = `<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        font-family: Helvetica, Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f4f4f4;
      }
      .email-container {
        max-width: 600px;
        margin: 30px auto;
        background-color: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      .header {
        background-color: #00466a;
        padding: 20px;
        text-align: center;
      }
      .header a {
        font-size: 1.8em;
        color: #ffffff;
        text-decoration: none;
        font-weight: 600;
      }
      .content {
        padding: 30px;
        line-height: 1.6;
      }
      .success-box {
        background-color: #d4edda;
        border-left: 4px solid #28a745;
        padding: 15px;
        margin: 20px 0;
        border-radius: 4px;
      }
      .success-icon {
        font-size: 2em;
        color: #28a745;
        margin-bottom: 10px;
      }
      .warning-box {
        background-color: #fff3cd;
        border-left: 4px solid #ffc107;
        padding: 15px;
        margin: 20px 0;
        border-radius: 4px;
        color: #856404;
      }
      .detail-box {
        background-color: #f8f9fa;
        padding: 15px;
        margin: 20px 0;
        border-radius: 4px;
        border: 1px solid #dee2e6;
      }
      .footer {
        background-color: #f9f9f9;
        padding: 20px;
        text-align: center;
        font-size: 0.85em;
        color: #888;
        border-top: 1px solid #eee;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">
        <a href="https://karrivo.com">Karrivo</a>
      </div>
      
      <div class="content">
        <h2 style="color: #00466a; margin-bottom: 10px;">Hello ${name || 'User'},</h2>
        
        <div class="success-box">
          <div class="success-icon">✅</div>
          <p style="margin: 0; font-size: 1.1em; color: #155724;">
            <strong>Password Changed Successfully!</strong>
          </p>
        </div>
        
        <p>This email confirms that your Karrivo account password has been successfully changed.</p>
        
        <div class="detail-box">
          <p style="margin: 5px 0;"><strong>Account Email:</strong> ${email}</p>
          <p style="margin: 5px 0;"><strong>Changed On:</strong> ${new Date().toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone: 'Asia/Kolkata'
    })} IST</p>
        </div>
        
        <div class="warning-box">
          <p style="margin: 0;">
            <strong>⚠️ Didn't make this change?</strong><br>
            If you did not change your password, please secure your account immediately:
          </p>
          <ul style="margin-top: 10px; margin-bottom: 0;">
            <li>Reset your password right away</li>
            <li>Contact our support team at <a href="mailto:support@karrivo.com" style="color: #00466a;">support@karrivo.com</a></li>
            <li>Review your recent account activity</li>
          </ul>
        </div>
        
        <p style="margin-top: 25px;"><strong>🔐 Account Security Best Practices:</strong></p>
        <ul style="color: #666;">
          <li>Use a strong, unique password for your Karrivo account</li>
          <li>Never share your password with anyone</li>
          <li>Be cautious of phishing emails asking for your credentials</li>
          <li>Update your password regularly</li>
        </ul>
        
        <p style="margin-top: 30px;">Thank you for keeping your account secure!</p>
        
        <p style="margin-top: 30px;">Best regards,<br><strong>The Karrivo Team</strong></p>
      </div>
      
      <div class="footer">
        <p>Karrivo - Empowering Your Career Journey</p>
        <p style="margin: 10px 0;">This is an automated message. Please do not reply to this email.</p>
        <p style="margin: 5px 0;">
          © ${new Date().getFullYear()} Karrivo. All rights reserved.
        </p>
      </div>
    </div>
  </body>
</html>`;

    return this.sendMail(email, subject, htmlContent);
  }




  static async sendContactSupportMail(contactData) {
    const { name, email, phone, subject, message } = contactData;

    const mailSubject = `📩 New Contact Request - ${subject || 'No Subject'}`;

    const htmlContent = `<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        padding: 20px;
      }
      .container {
        max-width: 600px;
        margin: auto;
        background: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 6px rgba(0,0,0,0.1);
      }
      .header {
        background: #00466a;
        color: #ffffff;
        padding: 15px;
        text-align: center;
        font-size: 18px;
        font-weight: bold;
      }
      .content {
        padding: 20px;
        line-height: 1.6;
      }
      .label {
        font-weight: bold;
        color: #00466a;
      }
      .box {
        background: #f9f9f9;
        border-left: 4px solid #00466a;
        padding: 15px;
        margin: 15px 0;
      }
      .footer {
        background: #f9f9f9;
        padding: 12px;
        text-align: center;
        font-size: 13px;
        color: #888;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">New Contact Support Request</div>

      <div class="content">
        <p><span class="label">Name:</span> ${name}</p>
        <p><span class="label">Email:</span> ${email}</p>
        <p><span class="label">Phone:</span> ${phone}</p>
        <p><span class="label">Subject:</span> ${subject || 'No Subject'}</p>

        <div class="box">
          <p><span class="label">Message:</span></p>
          <p>${message || 'No message provided'}</p>
        </div>

        <p>This enquiry was submitted via the Karrivo contact form.</p>
      </div>

      <div class="footer">
        © ${new Date().getFullYear()} Karrivo | Support System
      </div>
    </div>
  </body>
</html>`;

    // Send to support email
    return this.sendMail(
      process.env.SUPPORT_EMAIL || 'support@karrivo.com',
      mailSubject,
      htmlContent
    );
  }


  static async sendSessionBookingMail(data) {
    const {
      name,
      email,
      mentorName,
      topic,
      sessionDate,
      startTime,
      duration,
      price,
      isFreeSession,
      zoomLink,
      paymentRequired
    } = data;

    const mailSubject = isFreeSession
      ? '✅ Your Free Mentorship Session is Confirmed'
      : '💳 Complete Payment to Confirm Your Mentorship Session';

    const statusColor = isFreeSession ? '#2ecc71' : '#f39c12';
    const statusText = isFreeSession ? 'FREE SESSION CONFIRMED' : 'PAYMENT PENDING';

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    }
    .header {
      background: ${statusColor};
      color: #ffffff;
      padding: 16px;
      text-align: center;
      font-size: 20px;
      font-weight: bold;
    }
    .content {
      padding: 20px;
      line-height: 1.6;
    }
    .label {
      font-weight: bold;
      color: #333;
    }
    .box {
      background: #f9f9f9;
      border-left: 4px solid ${statusColor};
      padding: 15px;
      margin: 15px 0;
    }
    .cta {
      margin: 20px 0;
      text-align: center;
    }
    .btn {
      background: ${statusColor};
      color: #ffffff;
      padding: 12px 20px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      display: inline-block;
    }
    .footer {
      background: #f9f9f9;
      padding: 12px;
      text-align: center;
      font-size: 13px;
      color: #888;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">${statusText}</div>

    <div class="content">
      <p>Hi <strong>${name}</strong>,</p>

      <p>Your mentorship session details are below:</p>

      <div class="box">
        <p><span class="label">Mentor:</span> ${mentorName}</p>
        <p><span class="label">Topic:</span> ${topic}</p>
        <p><span class="label">Date:</span> ${sessionDate}</p>
        <p><span class="label">Time:</span> ${startTime}</p>
        <p><span class="label">Duration:</span> ${duration} minutes</p>
        <p><span class="label">Amount:</span> ${isFreeSession ? '₹0 (Free Session)' : `₹${price}`}</p>
      </div>

      ${isFreeSession
        ? `
          <p>Your free session has been <strong>confirmed</strong>.</p>
          <div class="cta">
            <a href="${zoomLink}" class="btn">Join Zoom Meeting</a>
          </div>
          `
        : `
          <p>Your session is reserved but <strong>payment is required</strong> to confirm it.</p>
          <div class="cta">
            <a href="${paymentRequired}" class="btn">Complete Payment</a>
          </div>
          `
      }

      <p>If you have any questions, feel free to contact our support team.</p>
    </div>

    <div class="footer">
      © ${new Date().getFullYear()} Karrivo | Mentorship Platform
    </div>
  </div>
</body>
</html>`;

    return this.sendMail(email, mailSubject, htmlContent);
  }




  static async sendTicketCreationEmail(data) {
    const {
      fullName,
      email,
      ticketId,
      subject,
      category,
      priority,
      status
    } = data;

    const mailSubject = '🎫 Support Ticket Created Successfully';

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    }
    .header {
      background: #3498db;
      color: #ffffff;
      padding: 18px;
      text-align: center;
      font-size: 22px;
      font-weight: bold;
    }
    .content {
      padding: 20px;
      line-height: 1.6;
      color: #333;
    }
    .ticket-details {
      background: #f9f9f9;
      border-left: 4px solid #3498db;
      padding: 15px;
      margin: 15px 0;
    }
    .label {
      font-weight: bold;
      color: #555;
    }
    .value {
      color: #333;
      margin-left: 5px;
    }
    .status-badge {
      display: inline-block;
      padding: 5px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
    }
    .status-pending {
      background: #f39c12;
      color: #fff;
    }
    .priority-high {
      color: #e74c3c;
    }
    .priority-medium {
      color: #f39c12;
    }
    .priority-low {
      color: #27ae60;
    }
    .footer {
      background: #f9f9f9;
      padding: 12px;
      text-align: center;
      font-size: 13px;
      color: #888;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">SUPPORT TICKET CREATED</div>

    <div class="content">
      <p>Hi <strong>${fullName}</strong>,</p>

      <p>Your support ticket has been successfully created. Our team will review it and get back to you as soon as possible.</p>

      <div class="ticket-details">
        <p><span class="label">Ticket ID:</span><span class="value">${ticketId}</span></p>
        <p><span class="label">Subject:</span><span class="value">${subject}</span></p>
        <p><span class="label">Category:</span><span class="value">${category}</span></p>
        <p><span class="label">Priority:</span><span class="value priority-${priority}">${priority.toUpperCase()}</span></p>
        <p><span class="label">Status:</span> <span class="status-badge status-${status}">${status}</span></p>
      </div>

      <p>We'll notify you via email when there are updates to your ticket.</p>

      <p>Thank you for reaching out! 💙</p>
    </div>

    <div class="footer">
      © ${new Date().getFullYear()} Karrivo | Support Team
    </div>
  </div>
</body>
</html>`;

    return this.sendMail(email, mailSubject, htmlContent);
  }


  static async sendTicketUpdateEmail(data) {
    const {
      fullName,
      email,
      ticketId,
      subject,
      status,
      response,
      respondedBy
    } = data;

    const mailSubject = `🔔 Update on Your Support Ticket #${ticketId}`;

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    }
    .header {
      background: #2ecc71;
      color: #ffffff;
      padding: 18px;
      text-align: center;
      font-size: 22px;
      font-weight: bold;
    }
    .content {
      padding: 20px;
      line-height: 1.6;
      color: #333;
    }
    .ticket-info {
      background: #f9f9f9;
      border-left: 4px solid #2ecc71;
      padding: 15px;
      margin: 15px 0;
    }
    .response-box {
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 6px;
      padding: 15px;
      margin: 15px 0;
    }
    .label {
      font-weight: bold;
      color: #555;
    }
    .value {
      color: #333;
      margin-left: 5px;
    }
    .status-badge {
      display: inline-block;
      padding: 5px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
    }
    .status-pending {
      background: #f39c12;
      color: #fff;
    }
    .status-in_progress {
      background: #3498db;
      color: #fff;
    }
    .status-resolved {
      background: #2ecc71;
      color: #fff;
    }
    .status-closed {
      background: #95a5a6;
      color: #fff;
    }
    .footer {
      background: #f9f9f9;
      padding: 12px;
      text-align: center;
      font-size: 13px;
      color: #888;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">TICKET UPDATE</div>

    <div class="content">
      <p>Hi <strong>${fullName}</strong>,</p>

      <p>There's an update on your support ticket:</p>

      <div class="ticket-info">
        <p><span class="label">Ticket ID:</span><span class="value">${ticketId}</span></p>
        <p><span class="label">Subject:</span><span class="value">${subject}</span></p>
        <p><span class="label">Status:</span> <span class="status-badge status-${status}">${status.replace('_', ' ').toUpperCase()}</span></p>
      </div>

      ${response ? `
      <div class="response-box">
        <p><span class="label">Response from ${respondedBy || 'Support Team'}:</span></p>
        <p style="margin-top: 10px;">${response}</p>
      </div>
      ` : ''}

      <p>If you have any additional questions, please reply to your ticket or contact our support team.</p>

      <p>Thank you! </p>
    </div>

    <div class="footer">
      © ${new Date().getFullYear()} Karrivo | Support Team
    </div>
  </div>
</body>
</html>`;

    return this.sendMail(email, mailSubject, htmlContent);
  }



  static async sendMentorApprovalEmail(data) {
    const {
      fullName,
      email,
      username,
      tempPassword,
      resetLink
    } = data;

    const mailSubject = '🎉 Your Mentor Application Has Been Approved';

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    }
    .header {
      background: #2ecc71;
      color: #ffffff;
      padding: 18px;
      text-align: center;
      font-size: 22px;
      font-weight: bold;
    }
    .content {
      padding: 20px;
      line-height: 1.6;
      color: #333;
    }
    .credentials {
      background: #f9f9f9;
      border-left: 4px solid #2ecc71;
      padding: 15px;
      margin: 15px 0;
    }
    .label {
      font-weight: bold;
    }
    .cta {
      margin: 25px 0;
      text-align: center;
    }
    .btn {
      background: #2ecc71;
      color: #ffffff;
      padding: 12px 22px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      display: inline-block;
    }
    .footer {
      background: #f9f9f9;
      padding: 12px;
      text-align: center;
      font-size: 13px;
      color: #888;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">MENTOR APPLICATION APPROVED</div>

    <div class="content">
      <p>Hi <strong>${fullName}</strong>,</p>

      <p>Congratulations! 🎉 Your mentor application has been <strong>approved</strong>.  
      Your mentor account has been successfully created on <strong>Karrivo</strong>.</p>

      <div class="credentials">
        <p><span class="label">email:</span> ${email}</p>
        <p><span class="label">Temporary Password:</span> ${tempPassword}</p>
      </div>

      <p><strong>Important:</strong> For security reasons, please reset your password immediately after logging in.</p>

      <div class="cta">
        <a href="${resetLink}" class="btn">Reset Password & Login</a>
      </div>

      <p>If you have any issues accessing your account, feel free to contact our support team.</p>

      <p>Welcome aboard! 🚀</p>
    </div>

    <div class="footer">
      © ${new Date().getFullYear()} Karrivo | Mentorship Platform
    </div>
  </div>
</body>
</html>`;

    return this.sendMail(email, mailSubject, htmlContent);
  }



  static async sendMentorTicketCreationEmail(data) {
    const {
      fullName,
      email,
      ticketId,
      subject,
      category,
      priority,
      status
    } = data;

    const mailSubject = '🎫 Mentor Support Ticket Created Successfully';

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    }
    .header {
      background: #9b59b6;
      color: #ffffff;
      padding: 18px;
      text-align: center;
      font-size: 22px;
      font-weight: bold;
    }
    .content {
      padding: 20px;
      line-height: 1.6;
      color: #333;
    }
    .ticket-details {
      background: #f9f9f9;
      border-left: 4px solid #9b59b6;
      padding: 15px;
      margin: 15px 0;
    }
    .label {
      font-weight: bold;
      color: #555;
    }
    .status-badge {
      display: inline-block;
      padding: 5px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
      background: #f39c12;
      color: #fff;
    }
    .footer {
      background: #f9f9f9;
      padding: 12px;
      text-align: center;
      font-size: 13px;
      color: #888;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">MENTOR SUPPORT TICKET CREATED</div>

    <div class="content">
      <p>Hi <strong>${fullName}</strong>,</p>

      <p>Your mentor support ticket has been successfully created. Our support team will review it and get back to you as soon as possible.</p>

      <div class="ticket-details">
        <p><span class="label">Ticket ID:</span> ${ticketId}</p>
        <p><span class="label">Subject:</span> ${subject}</p>
        <p><span class="label">Category:</span> ${category}</p>
        <p><span class="label">Priority:</span> ${priority.toUpperCase()}</p>
        <p><span class="label">Status:</span> <span class="status-badge">${status}</span></p>
      </div>

      <p>We'll notify you via email when there are updates to your ticket.</p>

      <p>Thank you for reaching out! 💜</p>
    </div>

    <div class="footer">
      © ${new Date().getFullYear()} Karrivo | Mentor Support Team
    </div>
  </div>
</body>
</html>`;

    return this.sendMail(email, mailSubject, htmlContent);
  }

  // 🔹 Send mentor ticket response email
  static async sendMentorTicketResponseEmail(data) {
    const {
      fullName,
      email,
      ticketId,
      subject,
      status,
      response,
      respondedBy
    } = data;

    const mailSubject = `🔔 Response to Your Mentor Support Ticket #${ticketId}`;

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    }
    .header {
      background: #2ecc71;
      color: #ffffff;
      padding: 18px;
      text-align: center;
      font-size: 22px;
      font-weight: bold;
    }
    .content {
      padding: 20px;
      line-height: 1.6;
      color: #333;
    }
    .ticket-info {
      background: #f9f9f9;
      border-left: 4px solid #2ecc71;
      padding: 15px;
      margin: 15px 0;
    }
    .response-box {
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 6px;
      padding: 15px;
      margin: 15px 0;
    }
    .label {
      font-weight: bold;
      color: #555;
    }
    .status-badge {
      display: inline-block;
      padding: 5px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
      background: #3498db;
      color: #fff;
    }
    .footer {
      background: #f9f9f9;
      padding: 12px;
      text-align: center;
      font-size: 13px;
      color: #888;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">TICKET RESPONSE</div>

    <div class="content">
      <p>Hi <strong>${fullName}</strong>,</p>

      <p>Your mentor support ticket has received a response from our team:</p>

      <div class="ticket-info">
        <p><span class="label">Ticket ID:</span> ${ticketId}</p>
        <p><span class="label">Subject:</span> ${subject}</p>
        <p><span class="label">Status:</span> <span class="status-badge">${status.replace('_', ' ').toUpperCase()}</span></p>
      </div>

      <div class="response-box">
        <p><span class="label">Response from ${respondedBy || 'Support Team'}:</span></p>
        <p style="margin-top: 10px;">${response}</p>
      </div>

      <p>If you have any additional questions, please reply to your ticket or contact our support team.</p>

      <p>Thank you! 🚀</p>
    </div>

    <div class="footer">
      © ${new Date().getFullYear()} Karrivo | Mentor Support Team
    </div>
  </div>
</body>
</html>`;

    return this.sendMail(email, mailSubject, htmlContent);
  }

  // 🔹 Send mentor ticket status update email
  static async sendMentorTicketStatusUpdateEmail(data) {
    const {
      fullName,
      email,
      ticketId,
      subject,
      oldStatus,
      newStatus
    } = data;

    const mailSubject = `📊 Status Update on Your Mentor Ticket #${ticketId}`;

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    }
    .header {
      background: #3498db;
      color: #ffffff;
      padding: 18px;
      text-align: center;
      font-size: 22px;
      font-weight: bold;
    }
    .content {
      padding: 20px;
      line-height: 1.6;
      color: #333;
    }
    .status-update {
      background: #f9f9f9;
      border-left: 4px solid #3498db;
      padding: 15px;
      margin: 15px 0;
    }
    .label {
      font-weight: bold;
      color: #555;
    }
    .status-badge {
      display: inline-block;
      padding: 5px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
    }
    .status-pending {
      background: #f39c12;
      color: #fff;
    }
    .status-in_progress {
      background: #3498db;
      color: #fff;
    }
    .status-resolved {
      background: #2ecc71;
      color: #fff;
    }
    .status-closed {
      background: #95a5a6;
      color: #fff;
    }
    .footer {
      background: #f9f9f9;
      padding: 12px;
      text-align: center;
      font-size: 13px;
      color: #888;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">TICKET STATUS UPDATE</div>

    <div class="content">
      <p>Hi <strong>${fullName}</strong>,</p>

      <p>The status of your mentor support ticket has been updated:</p>

      <div class="status-update">
        <p><span class="label">Ticket ID:</span> ${ticketId}</p>
        <p><span class="label">Subject:</span> ${subject}</p>
        <p><span class="label">Previous Status:</span> <span class="status-badge status-${oldStatus}">${oldStatus.replace('_', ' ').toUpperCase()}</span></p>
        <p><span class="label">New Status:</span> <span class="status-badge status-${newStatus}">${newStatus.replace('_', ' ').toUpperCase()}</span></p>
      </div>

      <p>You can check your ticket for more details or contact our support team if you have any questions.</p>

      <p>Thank you! 💙</p>
    </div>

    <div class="footer">
      © ${new Date().getFullYear()} Karrivo | Mentor Support Team
    </div>
  </div>
</body>
</html>`;

    return this.sendMail(email, mailSubject, htmlContent);
  }


}

export default emailService;
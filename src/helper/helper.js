import axios from "axios";
import NodeCache from "node-cache";
import nodeMailer from "nodemailer";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import logs from "../models/logs.js";
// import Setting from "../models/setting.js";
// import orders from "../models/orders.js";
import User from "../models/users.js";

// import db from "../config/db.js";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import logger from "./logger.js";


let envfile = process.env;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const myCache = new NodeCache();

// const s3 = new S3Client({
//   credentials: {
//     accessKeyId: db.accessKey,
//     secretAccessKey: db.secretKey,
//   },
//   region: db.region,
// });

class helper {
  static async success(res, msg, data = {}) {
    return res.status(200).send({
      success: 1,
      status_code: 200,
      message: msg,
      data: data,
    });
  }
  static async failed(res, msg, data = {}, code = 400) {
    return res.status(code).send({
      success: 0,
      status_code: code,
      message: msg,
      data: data,
    });
  }
  static async err(res, err, path = "/", code = 500) {
    let err_log = await logs.create({
      path: path,
      err: err && err.responce ? err.responce.data : err.message,
      err_message: err && err.responce ? err.responce.data : err.message,
      err_date: new Date(),
    });
    return res.status(code).send({
      success: 0,
      status_code: code,
      message: err.message,
      data: {},
    });
  }
  static async generateOTP() {
    let OTP = await Math.floor(100000 + Math.random() * 900000);
    return OTP;
  }

  static async nodeMailer(email, otp) {
    try {
      const response = await mg.messages.create(MAILGUN_DOMAIN, {
        from: FROM_EMAIL,
        to: email,
        subject: "karrivo",
        html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                <div style="margin:50px auto;width:70%;padding:20px 0">
                  <div style="border-bottom:1px solid #eee">
                    <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Jaimax</a>
                  </div>
                  <p style="font-size:1.1em">Hi,</p>
                  <p>Thank you for choosing karrivo. Use the following OTP to complete. OTP is valid for 10 minutes</p>
                  <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
                  <p style="font-size:0.9em;">Regards,<br />karrivo</p>
                  <hr style="border:none;border-top:1px solid #eee" />
                  <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                    <p>Karrivo</p>
                   
                  </div>
                </div>
              </div>`,
      });

      console.log("Message sent: %s", response.id);
      return response.id;
    } catch (error) {
      console.error("Error sending OTP mail:", error);
      throw error;
    }
  }



  // Generate random password
  static generateRandomPassword(length = 12) {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*';
    const allChars = uppercase + lowercase + numbers + symbols;

    let password = '';
    // Ensure at least one of each type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Fill remaining length
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  // Generate unique username (for internal use)
  static async generateUniqueUsername(prefix = 'Karrivo') {
    const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
    const username = `${prefix}${Date.now().toString().slice(-3)}${randomString}`;

    // Check if username exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return this.generateUniqueUsername(prefix); // Recursively generate new username
    }

    return username;
  }

  // Send mentor approval email with credentials (Email as username)
  static async sendMentorApprovalEmail({ email, fullName, password, loginUrl }) {
    const subject = 'Congratulations! Your Mentor Application Has Been Approved';

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #eb660f; color: white; padding: 20px; text-align: center; }
                .content { background-color: #f9f9f9; padding: 30px; border-radius: 5px; margin: 20px 0; }
                .credentials-box { background-color: #fff; border: 2px solid #eb660f; padding: 20px; margin: 20px 0; border-radius: 5px; }
                .credentials-box strong { color: #eb660f; }
                .credential-row { padding: 10px 0; border-bottom: 1px solid #eee; }
                .credential-row:last-child { border-bottom: none; }
                .button { display: inline-block; padding: 12px 30px; background-color: #eb660f; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
                .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Welcome to Karrivo Mentor Program!</h1>
                </div>
                <div class="content">
                    <h2>Dear ${fullName},</h2>
                    <p>Congratulations! We are pleased to inform you that your application to become a mentor has been <strong style="color: #28a745;">APPROVED</strong>.</p>
                    
                    <p>Your mentor account has been created successfully. Below are your login credentials:</p>
                    
                    <div class="credentials-box">
                        <h3 style="margin-top: 0; color: #eb660f;">Your Login Credentials</h3>
                        <div class="credential-row">
                            <strong>Email (Username):</strong><br>
                            <span style="font-size: 16px; color: #333;">${email}</span>
                        </div>
                        <div class="credential-row">
                            <strong>Password:</strong><br>
                            <span style="font-size: 16px; color: #333; font-family: monospace; background: #f5f5f5; padding: 5px 10px; border-radius: 3px;">${password}</span>
                        </div>
                    </div>
                    
                    <div class="warning">
                        <strong>⚠️ Important Security Notice:</strong><br>
                        • Use your <strong>email address</strong> as username to login<br>
                        • Please change your password immediately after your first login<br>
                        • Do not share your credentials with anyone<br>
                        • Keep your password secure and confidential
                    </div>
                    
                    <div style="text-align: center;">
                        <a href="${loginUrl}" class="button">Login to Your Account</a>
                    </div>
                    
                    <h3>What's Next?</h3>
                    <p>As a mentor, you can now:</p>
                    <ul>
                        <li>✅ Complete your mentor profile</li>
                        <li>✅ Set your availability for mentoring sessions</li>
                        <li>✅ Connect with mentees and guide them</li>
                        <li>✅ Track your mentoring activities</li>
                        <li>✅ Access mentor resources and tools</li>
                    </ul>
                    
                    <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
                    
                    <p>We're excited to have you on board!</p>
                    
                    <p>Best regards,<br>
                    <strong>The Karrivo Team</strong></p>
                </div>
                <div class="footer">
                    <p>This is an automated email. Please do not reply to this message.</p>
                    <p>&copy; ${new Date().getFullYear()} Karrivo. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    try {
      await this.sendEmail(email, subject, html);
      console.log(`Approval email with credentials sent to: ${email}`);
    } catch (error) {
      console.error('Error sending approval email:', error);
      throw error;
    }
  }

  // Send mentor rejection email
  static async sendMentorRejectionEmail({ email, fullName }) {
    const subject = 'Update on Your Mentor Application';

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #6c757d; color: white; padding: 20px; text-align: center; }
                .content { background-color: #f9f9f9; padding: 30px; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Mentor Application Update</h1>
                </div>
                <div class="content">
                    <h2>Dear ${fullName},</h2>
                    <p>Thank you for your interest in becoming a mentor with Karrivo.</p>
                    
                    <p>After careful review of your application, we regret to inform you that we are unable to approve your mentor application at this time.</p>
                    
                    <p>This decision does not reflect on your qualifications or expertise. We receive many applications and have to make difficult choices based on our current program needs.</p>
                    
                    <p>We encourage you to reapply in the future when you have gained additional experience or when our program requirements evolve.</p>
                    
                    <p>Thank you again for your interest in Karrivo.</p>
                    
                    <p>Best regards,<br>
                    <strong>The Karrivo Team</strong></p>
                </div>
                <div class="footer">
                    <p>This is an automated email. Please do not reply to this message.</p>
                    <p>&copy; ${new Date().getFullYear()} Karrivo. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    try {
      await this.sendEmail(email, subject, html);
      console.log(`Rejection email sent to: ${email}`);
    } catch (error) {
      console.error('Error sending rejection email:', error);
      throw error;
    }
  }



  static generateResetToken(length = 64) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let token = "";
    for (let i = 0; i < length; i++) {
      token += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return token;
  }

  // Simple hash function (alternative to SHA-256)
  static hashToken(token) {
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      const char = token.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    // Convert to positive hex string
    return Math.abs(hash).toString(16) + token.split('').reverse().join('').substring(0, 32);
  }


  // Base email sending function (if not already exists)
  // static 
  // async sendEmail(to, subject, html) {
  //   // Implement your email sending logic here
  //   // Example using nodemailer:
  //   const transporter = nodeMailer.createTransporter({
  //     host: process.env.SMTP_HOST,
  //     port: process.env.SMTP_PORT,
  //     secure: true,
  //     auth: {
  //       user: process.env.SMTP_USER,
  //       pass: process.env.SMTP_PASS
  //     }
  //   });

  //   const mailOptions = {
  //     from: `"Karrivo" <${process.env.SMTP_FROM_EMAIL}>`,
  //     to: to,
  //     subject: subject,
  //     html: html
  //   };

  //   return await transporter.sendMail(mailOptions);
  // }


  static async sendEmail(to, subject, html) {
    const transporter = nodeMailer.createTransporter({
      host: 'smtp.gmail.com',  // Gmail SMTP host
      port: 587,               // Use 587 for TLS or 465 for SSL
      secure: false,           // true for 465, false for 587
      auth: {
        user: 'mentorship.karrivo@gmail.com',
        pass: 'ivou ivpe lgzt bbuh'
      }
    });

    const mailOptions = {
      from: '"Karrivo" <mentorship.karrivo@gmail.com>',
      to: to,
      subject: subject,
      html: html
    };

    return await transporter.sendMail(mailOptions);
  }



  static async fileUpload(file) {
    try {
      let name = await this.generateRandomUsername();
      let uploadedFile = name + "." + file.name.split(".")[1];
      const uploadPath = join(__dirname, "../public/uploads/", uploadedFile);
      file.mv(uploadPath, (err) => {
        if (err) {
          console.log(err);
        }
      });
      let image_url = "/uploads/" + uploadedFile.toString();
      return image_url;
    } catch (error) {
      console.log(error);
    }
  }




  static async generateUserId(prefix = "karrivo") {
    const randomPart = Math.random().toString(36).substring(2, 11); // letters + numbers
    return `${prefix}${randomPart}`;
  }

  // static async s3FileUpload(file, userId, documentType, fileBaseName) {
  //   let fileName = await this.formatFileName(file.name);
  //   let keyName;
  //   if (documentType === process.env.DOC_WALLET) {
  //     keyName =
  //       process.env.FOLDER_USERS +
  //       userId +
  //       process.env.FOLDER_WALLET +
  //       fileName;
  //   } else if (documentType === process.env.DOC_TICKET) {
  //     keyName =
  //       process.env.FOLDER_USERS +
  //       userId +
  //       process.env.FOLDER_SUPPORT +
  //       documentType +
  //       process.env.SLASH +
  //       fileName;
  //   } else if (documentType === process.env.DOC_COMMENT) {
  //     keyName =
  //       process.env.FOLDER_USERS +
  //       userId +
  //       process.env.FOLDER_SUPPORT +
  //       process.env.DOC_TICKET +
  //       process.env.SLASH +
  //       documentType +
  //       process.env.SLASH +
  //       fileName;
  //   } else {
  //     const extension = await this.getFileExtension(file.name);
  //     keyName =
  //       process.env.FOLDER_USERS +
  //       userId +
  //       process.env.FOLDER_KYC +
  //       documentType +
  //       process.env.SLASH +
  //       fileBaseName +
  //       extension;
  //   }

  //   let fileURL;
  //   const params = {
  //     Bucket: db.bucketName,
  //     Key: keyName,
  //     ContentType: file.mimetype,
  //     Body: file.data,
  //   };

  //   try {
  //     const command = new PutObjectCommand(params);
  //     const response = await s3.send(command);
  //     console.log("response: ", response);
  //     const fileURL = `https://${db.bucketName}.s3.${db.region}.amazonaws.com/${keyName}`;
  //     return fileURL;
  //   } catch (error) {
  //     console.error("Error uploading file:", error);
  //   }
  // }

  // static async uploadBase64ToS3(base64Data, userId, documentType, fileName) {
  //   // Decode the Base64 string
  //   const buffer = Buffer.from(base64Data, "base64");
  //   let keyName;
  //   if (documentType === process.env.DOC_WALLET) {
  //     keyName =
  //       process.env.FOLDER_USERS +
  //       userId +
  //       process.env.FOLDER_WALLET +
  //       fileName;
  //   } else {
  //     keyName =
  //       process.env.FOLDER_USERS +
  //       userId +
  //       process.env.FOLDER_KYC +
  //       documentType +
  //       process.env.SLASH +
  //       fileName;
  //   }

  //   const params = {
  //     Bucket: db.bucketName,
  //     Key: keyName, // File name in S3
  //     Body: buffer,
  //     ContentEncoding: "base64", // Indicates that the data is Base64 encoded
  //     ContentType: "image/jpeg", // Adjust to your file type
  //   };

  //   try {
  //     const command = new PutObjectCommand(params);
  //     const response = await s3.send(command);
  //     console.log("response", response);
  //     const fileURL = `https://${db.bucketName}.s3.${db.region}.amazonaws.com/${keyName}`;
  //     return fileURL;
  //   } catch (error) {
  //     console.error("Error uploading file:", error);
  //   }
  // }
  // static async getFileExtension(filename) {
  //   const lastDotIndex = filename.lastIndexOf(".");
  //   return filename.substring(lastDotIndex);
  // }


  // static async generatePreSignedURL(keyName) {
  //   try {
  //     const signedUrlExpireSeconds = 60 * 60;
  //     const params = {
  //       Bucket: db.bucketName,
  //       Key: keyName,
  //     };
  //     // Generate presigned URL
  //     const command = new GetObjectCommand(params);
  //     const presignedUrl = await getSignedUrl(s3, command, {
  //       expiresIn: signedUrlExpireSeconds,
  //     });
  //     return presignedUrl;
  //   } catch (error) {
  //     logger.error("Error generating presigned URL:", error);
  //     return null;
  //   }
  // }
  static async fetchKeyNameFromURL(fileURL) {
    const index = fileURL.indexOf("amazonaws.com/") + "amazonaws.com/".length;
    return fileURL.substring(index);
  }

  static async formatFileName(fileName) {
    // Remove any spaces before the file extension
    fileName = fileName.replace(/\s+\./, ".").replace(/[^a-zA-Z0-9._-]/g, "");
    // Replace remaining spaces with a single hyphen
    return fileName.replace(/\s+/g, "-");
  }
  static async getCurrentDate() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based
    const day = currentDate.getDate().toString().padStart(2, "0");

    const hours = String(currentDate.getHours()).padStart(2, "0");
    const minutes = String(currentDate.getMinutes()).padStart(2, "0");
    const seconds = String(currentDate.getSeconds()).padStart(2, "0");

    const fullTimestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;
    return fullTimestamp;
  }
  static async SmsOtp(phone, otp, type) {
    let message;
    let peid;
    let templateid;
    let url;
    if (type === "register") {
      templateid = "1707173433789831513";
      peid = "1701172534363246489";
      message = `Dear Customer, Your One time password for sign in to jaisvik app is ${otp}. Please don't share with anyone. Thanks JAISVK  `;
      url = `http://sms.bulksmsind.in/v2/sendSMS?username=saitext&message=${message}&sendername=JAISVK&smstype=TRANS&numbers=${phone}&apikey=5a18cce5-07bd-4cf5-83ec-3affb6d9d719&peid=${peid}&templateid=${templateid}`;
    } else if (type === "forgotPassword") {
      templateid = "1707173433783014202";
      peid = "1701172534363246489";
      message = `Dear Customer, Your One time password for forget password to Jaisvik app is ${otp}. Please dont share with anyone. Thanks JAISVK`;
      url = `http://sms.bulksmsind.in/v2/sendSMS?username=saitext&message=${message}&sendername=JAISVK&smstype=TRANS&numbers=${phone}&apikey=5a18cce5-07bd-4cf5-83ec-3affb6d9d719&peid=${peid}&templateid=${templateid}`;
    } else {
      templateid = "1707173433786796965";
      peid = "1701172534363246489";
      message = `Dear Customer, Your One time password for change password to Jaisvik app is ${otp}. Please dont share with anyone. Thanks JAISVK `;
      url = `http://sms.bulksmsind.in/v2/sendSMS?username=saitext&message=${message}&sendername=JAISVK&smstype=TRANS&numbers=${phone}&apikey=5a18cce5-07bd-4cf5-83ec-3affb6d9d719&peid=${peid}&templateid=${templateid}`;
    }

    await axios
      .post(url)
      .then((res) => {
        console.log(res.data);
      })
      .catch(console.log);
  }

  static async getWeekDay() {
    const date = new Date();
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const day = date.getDay();
    return daysOfWeek[day];
  }

  static async sendSupportAcknowledgementSms(phone) {
    try {
      const peid = "1701172534363246489";
      const templateid = "1707174133517156750";
      const message = encodeURIComponent(
        "Dear customer, we have received your support enquiry. Our team will contact you shortly - JAIMAX"
      );

      url = `http://sms.bulksmsind.in/v2/sendSMS?username=saitext&message=${message}&sendername=JAISVK&smstype=TRANS&numbers=${phone}&apikey=5a18cce5-07bd-4cf5-83ec-3affb6d9d719&peid=${peid}&templateid=${templateid}`;

      const res = await axios.post(url);
      console.log(" res data:", res);
    } catch (err) {
      console.error("❌ Failed to send SMS:", err.message);
    }
  }

  //   static async checkPendingOrder(orderId) {
  //     try {
  //       console.log(
  //         `Checking order with ID: ${orderId}`,
  //         new Date().toISOString()
  //       );

  //       const purchaseOrders = await orders.find({
  //         orderId: orderId,
  //       });

  //       if (!purchaseOrders.length) {
  //         return "Order not found or already processed.";
  //       }

  //       const order = purchaseOrders[0];

  //       const findUser = await User.findById(order.userId);
  //       if (!findUser) {
  //         return;
  //       }

  //       const minorders = await orders.find({
  //         userId: findUser._id.toString(),
  //         paymentMethod: { $ne: "Available Balance" },
  //       });

  //       const referenceUser = await User.findOne({
  //         username: findUser.referenceId,
  //       });
  //       if (!referenceUser) {
  //         console.log("Reference User Not Found");
  //         return;
  //       }

  //       const totalJaimaxTokens = purchaseOrders.reduce(
  //         (acc, cum) => acc + parseFloat(cum.jaimax || 0),
  //         0
  //       );

  //       findUser.tokens =
  //         parseFloat(findUser.tokens) + parseFloat(totalJaimaxTokens);

  //       const wasInactive = findUser.isActive === false;
  //       if (wasInactive) {
  //         findUser.isActive = true;
  //         referenceUser.referenceCount += 1;
  //         const activeISTOffset = 5.5 * 60 * 60 * 1000;
  //         findUser.activeDate = new Date(Date.now() + activeISTOffset);
  //       }

  //       await Promise.all([referenceUser.save(), findUser.save()]);
  //       const finndTopnineLayers = await this.findTopNineLayers(
  //         findUser.username
  //       );

  //       if (minorders.length == 1) {
  //         await this.disburseMarketingplan(
  //           finndTopnineLayers,
  //           order.finalInrAfterTds,
  //           findUser.username
  //         );
  //       }
  //       if (minorders.length >= 2) {
  //         await this.disburseMarketingplanAboveFirstOrders(
  //           finndTopnineLayers,
  //           order.finalInrAfterTds,
  //           findUser.username
  //         );
  //       }

  //       return "Order processed successfully";
  //     } catch (error) {
  //       console.log("Error processing order");
  //       return "Error processing order";
  //     }
  //   }

  static async checkPendingOrderWithAvalibleBalance(orderId) {
    try {
      console.log(`Checking order with ID: ${orderId}`);
      const order = await orders.findOne({
        orderId: orderId,
        status: "Completed",
      });

      if (!order) {
        return "Order not found or already processed.";
      }

      const user = await User.findById(order.userId);
      if (!user) {
        console.log("User Not Found");
        return;
      }

      user.tokens += order.jaimax;
      if (user.isActive === false) {
        user.isActive = true;
      }
      await user.save();
      return "order processed succefully";
    } catch (err) { }
  }
  static async getISTTime() {
    const now = new Date();

    // Convert to milliseconds and add the IST offset (5 hours 30 minutes in milliseconds)
    const ISTOffset = 5.5 * 60 * 60 * 1000;
    let ISTTime = new Date(now.getTime() + ISTOffset);
    // Format the IST date and time
    let timestamp = ISTTime.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });
    console.log(`timestamp: ${timestamp}`);

    return ISTTime;
  }

  static async getRefralIDshare(id) {
    const nowIST = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );
    const changeDateIST = new Date("2025-07-14T00:00:00+05:30");

    if (nowIST >= changeDateIST) {
      return 10;
    }
    const user = await User.findById(id);
    console.log(user);

    const refererdByUser = await User.findOne({
      username: user.referenceId,
    });

    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      0,
      0,
      0,
      0
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
      0,
      0,
      0,
      0
    );

    // Find all active users referred by this user
    const allReferredUsers = await User.find({
      referenceId: refererdByUser.username,
      isActive: true,
    });

    const referredUserIds = allReferredUsers.map((user) => user._id.toString());

    const firstOrdersToday = await orders.aggregate([
      { $match: { userId: { $in: referredUserIds } } },

      {
        $group: {
          _id: "$userId",
          firstOrder: { $min: "$createdAt" },
        },
      },

      {
        $match: {
          firstOrder: {
            $gte: startOfDay,
            $lt: endOfDay,
          },
        },
      },
    ]);

    // Commission structure
    const commissionRates = [
      { level: 1, rate: 8 },
      { level: 2, rate: 10 },
      { level: 3, rate: 12 },
      { level: 4, rate: 14 },
      { level: 5, rate: 16 },
      { level: 6, rate: 19 },
      { level: 7, rate: 21 },
      { level: 8, rate: 23 },
      { level: 9, rate: 25 },
      { level: 10, rate: 30 },
    ];
    const calculateEarnings = () => {
      const firstOrderUsersToday = firstOrdersToday.length;

      if (firstOrderUsersToday < 1) {
        return 8;
      }

      if (firstOrderUsersToday >= 10) {
        return 8;
      }

      const nextLevel = firstOrderUsersToday + 1;
      const commission = commissionRates.find((c) => c.level === nextLevel);

      return commission ? commission.rate : 8;
    };

    const commissionRate = calculateEarnings();

    return commissionRate;
  }



  static async estimatGasPercentageOfJaimax(id, amount) {
    try {
      if (amount > 999 && amount < 2500) return 0.5;
      if (amount > 50000) {
        return 1.3;
      }

      const now = new Date();
      const currentYear = now.getFullYear();
      const isAfterMarch = now.getMonth() + 1 >= 4;

      const startDate = new Date(
        `${isAfterMarch ? currentYear : currentYear - 1}-04-01T00:00:00Z`
      );
      const endDate = new Date(
        `${isAfterMarch ? currentYear + 1 : currentYear}-03-31T23:59:59Z`
      );

      const transactions = await orders.aggregate([
        {
          $match: {
            userId: id,
            status: "Completed",
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
          },
        },
      ]);

      const totalCredits = transactions.length
        ? transactions[0].totalAmount
        : 0;

      const gasPercent = totalCredits < 50000 ? 0.3 : 1.3;
      return gasPercent;
    } catch (err) {
      console.error("Error calculating gas fee:", err.message);
      throw err;
    }
  }

  static async getCompleTreeInfo(username, maxDepth = 10) {
    let user = await User.findOne({ username }).lean();
    if (!user) return { user: null, directRefs: [], chainRefs: [] };

    let directRefs = [];
    let chainRefs = [];

    let queue = [{ username, depth: 1 }];

    while (queue.length > 0) {
      const batch = queue.splice(0, 100);
      const parentUsernames = batch.map((b) => b.username);

      const children = await User.find({
        referenceId: { $in: parentUsernames },
      }).lean();

      for (const child of children) {
        const parentEntry = batch.find((b) => b.username === child.referenceId);
        if (!parentEntry) continue;

        const nextDepth = parentEntry.depth + 1;

        if (nextDepth === 2) {
          directRefs.push(child);
        } else if (nextDepth > 2 && nextDepth <= maxDepth) {
          chainRefs.push(child);
        }

        if (nextDepth < maxDepth) {
          queue.push({ username: child.username, depth: nextDepth });
        }
      }
    }

    return { directRefs, chainRefs };
  }
}

export default helper;

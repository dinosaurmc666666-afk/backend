const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Store OTP temporarily with metadata (code and createdAt timestamp)
let otpStorage = {};

// Configure SMTP connection with Port 465 & Secure SSL (Best for Mobile Terminals)
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: 'forestkh.net@gmail.com', // Your email
        pass: 'ectd nmjo jtuv kwxd'      // Your App Password
    },
    tls: {
        rejectUnauthorized: false // Prevents mobile network blocking
    }
});

// 1. API to generate and send OTP
app.post('/send-otp', (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Please enter your email address' });

    const currentTime = Date.now();

    // [FUNCTION 1: RATE LIMITING] Check if user requests OTP too fast (Cooldown 60s)
    if (otpStorage[email] && (currentTime - otpStorage[email].createdAt < 60000)) {
        const remaining = Math.ceil((60000 - (currentTime - otpStorage[email].createdAt)) / 1000);
        return res.status(429).json({ success: false, message: `Please wait ${remaining} seconds before resending.` });
    }

    // Generate random 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    // [FUNCTION 2: SAVE WITH TIMESTAMP] Save OTP linked with email and current time
    otpStorage[email] = {
        code: otp,
        createdAt: currentTime
    };

    // Split the 4-digit OTP into single digits for box styling
    const d1 = otp[0];
    const d2 = otp[1];
    const d3 = otp[2];
    const d4 = otp[3];

    const mailOptions = {
        from: '"Forest KH" <forestkh.net@gmail.com>',
        to: email,
        subject: 'Verify your account',
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Account</title>
</head>
<body style="background-color: #030712; padding: 50px 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
    
    <div style="display: none; max-height: 0px; overflow: hidden; mso-hide: all;">
        This is your 4-digit code
    </div>

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
        <tr>
            <td align="center">
                
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 450px; background: #0b1329; border-radius: 28px; overflow: hidden; box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.7); border: 1px solid #1e293b; border-collapse: separate;">

                    <tr>
                        <td align="center" style="padding: 45px 30px 20px 30px;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Verify your account</h1>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" bgcolor="#ffffff" style="padding: 40px 35px; border-top-left-radius: 28px; border-top-right-radius: 28px;">
                            <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 35px 0; text-align: center; font-weight: 500;">
                                Thank you for choosing our service. To complete your registration or login, please use the security code (OTP) below:
                            </p>
                            
                            <table border="0" cellpadding="0" cellspacing="8" align="center" style="margin: 0 auto;">
                                <tr>
                                    <td align="center" bgcolor="#0f172a" width="52" height="58" style="border-radius: 12px; font-size: 26px; font-weight: 800; color: #10b981; border: 1px solid #1e293b; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); font-family: 'Courier New', Courier, monospace;">${d1}</td>
                                    <td align="center" bgcolor="#0f172a" width="52" height="58" style="border-radius: 12px; font-size: 26px; font-weight: 800; color: #10b981; border: 1px solid #1e293b; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); font-family: 'Courier New', Courier, monospace;">${d2}</td>
                                    <td align="center" bgcolor="#0f172a" width="52" height="58" style="border-radius: 12px; font-size: 26px; font-weight: 800; color: #10b981; border: 1px solid #1e293b; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); font-family: 'Courier New', Courier, monospace;">${d3}</td>
                                    <td align="center" bgcolor="#0f172a" width="52" height="58" style="border-radius: 12px; font-size: 26px; font-weight: 800; color: #10b981; border: 1px solid #1e293b; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); font-family: 'Courier New', Courier, monospace;">${d4}</td>
                                </tr>
                            </table>

                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 35px;">
                                <tr>
                                    <td bgcolor="#f8fafc" style="padding: 16px 20px; border-radius: 14px; border: 1px solid #e2e8f0; text-align: left;">
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                            <tr>
                                                <td width="8" style="vertical-align: top; padding-top: 5px;">
                                                    <div style="width: 6px; height: 6px; background-color: #10b981; border-radius: 50%;"></div>
                                                </td>
                                                <td style="color: #64748b; font-size: 13px; line-height: 1.5; padding-left: 10px;">
                                                    <strong style="color: #0f172a;">Security Notice:</strong> Never expose this verification string to third-party endpoints or system administrators.
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" bgcolor="#0b1329" style="padding: 30px 40px; border-top: 1px solid #1e293b;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <p style="color: #94a3b8; font-size: 13px; margin: 0; font-weight: 600; letter-spacing: 0.5px;">© 2026 Copyright by Forest KH.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                </table>
                
            </td>
        </tr>
    </table>
</body>
</html>
        `
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Nodemailer Error Details:', error);
            return res.status(500).json({ success: false, message: 'Failed: ' + error.message });
        }
        console.log('Email sent successfully:', info.response);
        res.json({ success: true, message: 'check your inbox' });
    });
});

// 2. API to verify OTP
app.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    const currentTime = Date.now();

    if (!otpStorage[email]) {
        return res.status(400).json({ success: false, message: 'Invalid OTP code' });
    }

    // [FUNCTION 3: EXPIRATION CHECK] Validate if OTP has expired (5 Minutes = 300000 ms)
    if (currentTime - otpStorage[email].createdAt > 300000) {
        delete otpStorage[email]; // Clear expired data
        return res.status(400).json({ success: false, message: 'OTP code has expired' });
    }

    // Validate if the code matches
    if (otpStorage[email].code === otp) {
        delete otpStorage[email]; // Clear OTP after success
        res.json({ success: true, message: 'successful!' });
    } else {
        res.status(400).json({ success: false, message: 'Invalid OTP code' });
    }
});

// Start Server on Port 3000
app.listen(3000, () => {
    console.log('Server is running');
});

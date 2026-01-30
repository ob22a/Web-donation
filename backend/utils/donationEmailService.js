import nodemailer from "nodemailer";
import Donation from "../models/Donation.js";

// Email transporter - keep it simple
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// SINGLE TEMPLATE - Choose your favorite one
function generateReceiptHTML({ donation, campaign, donor }) {
  const platformName = process.env.PLATFORM_NAME || "Charity Platform";

  // Donor info
  const donorName = donation.isAnnonymous
    ? "Anonymous Donor"
    : donor?.name || "Donor";

  // Campaign info
  const campaignTitle = campaign?.title || "Charity Campaign";
  const ngoName = campaign?.ngo?.name || "";

  // Amount formatting
  const amount = (donation.amount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Date formatting
  const date = donation.createdAt
    ? new Date(donation.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  // Receipt ID
  const receiptId = donation._id.toString().slice(-8).toUpperCase();

  // Payment method
  const paymentMethod = donation.method?.type || "Donation";

  // Simple, clean, professional template
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Donation Receipt</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: #333;
        background-color: #f9fafb;
        margin: 0;
        padding: 20px;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background: white;
        border-radius: 12px;
        padding: 30px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      .header {
        text-align: center;
        padding-bottom: 20px;
        border-bottom: 2px solid #e5e7eb;
        margin-bottom: 30px;
      }
      .logo {
        font-size: 24px;
        font-weight: bold;
        color: #10b981;
        margin-bottom: 8px;
      }
      .title {
        color: #6b7280;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      .thank-you {
        text-align: center;
        color: #0f766e;
        font-size: 20px;
        margin: 25px 0;
      }
      .amount-section {
        background: linear-gradient(135deg, #dbeafe 0%, #dcfce7 100%);
        border-radius: 12px;
        padding: 25px;
        text-align: center;
        margin: 25px 0;
        border: 2px solid #bfdbfe;
      }
      .amount {
        font-size: 42px;
        font-weight: bold;
        color: #1e40af;
      }
      .currency {
        font-size: 20px;
        color: #3b82f6;
        font-weight: 600;
      }
      .details {
        margin: 30px 0;
      }
      .detail-row {
        display: flex;
        justify-content: space-between;
        padding: 12px 0;
        border-bottom: 1px solid #e5e7eb;
      }
      .detail-label {
        color: #6b7280;
        font-weight: 500;
      }
      .detail-value {
        font-weight: 600;
        text-align: right;
      }
      .badge {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        margin-left: 8px;
      }
      .badge-anonymous {
        background: #fef3c7;
        color: #92400e;
      }
      .badge-manual {
        background: #dbeafe;
        color: #1e40af;
      }
      .footer {
        margin-top: 40px;
        padding-top: 20px;
        border-top: 1px solid #e5e7eb;
        color: #6b7280;
        font-size: 14px;
        text-align: center;
      }
      .receipt-id {
        background: #f3f4f6;
        padding: 8px 16px;
        border-radius: 20px;
        font-family: monospace;
        font-size: 13px;
        margin-top: 15px;
        display: inline-block;
      }
      @media (max-width: 640px) {
        .container {
          padding: 20px;
        }
        .amount {
          font-size: 32px;
        }
        .detail-row {
          flex-direction: column;
          gap: 4px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">${platformName}</div>
        <div class="title">Donation Receipt</div>
      </div>
      
      <div class="thank-you">
        Thank you for your generosity, ${donorName}!
      </div>
      
      <div class="amount-section">
        <div class="amount">${amount} <span class="currency">ETB</span></div>
        <div style="color: #4b5563; margin-top: 8px;">Donation Amount</div>
      </div>
      
      <div class="details">
        <div class="detail-row">
          <div class="detail-label">Campaign</div>
          <div class="detail-value">${campaignTitle}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">Organization</div>
          <div class="detail-value">${ngoName || "Charity Platform"}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">Donor</div>
          <div class="detail-value">
            ${donorName}
            ${donation.isAnnonymous ? '<span class="badge badge-anonymous">Anonymous</span>' : ""}
            ${donation.isManual ? '<span class="badge badge-manual">Manual</span>' : ""}
          </div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">Payment Method</div>
          <div class="detail-value">${paymentMethod}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">Date & Time</div>
          <div class="detail-value">${date}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">Status</div>
          <div class="detail-value" style="color: #10b981;">✓ Completed</div>
        </div>
      </div>
      
      <div class="footer">
        <p>This is an official receipt for your donation. Please keep it for your records.</p>
        <p>If you have any questions, contact ${process.env.SUPPORT_EMAIL || "support@example.com"}</p>
        
        <div class="receipt-id">
          Receipt ID: ${receiptId}
        </div>
        
        <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
          © ${new Date().getFullYear()} ${platformName}
        </p>
      </div>
    </div>
  </body>
  </html>
  `;
}

// Text version (for email clients that don't support HTML)
function generateReceiptText({ donation, campaign, donor }) {
  const platformName = process.env.PLATFORM_NAME || "Charity Platform";
  const donorName = donation.isAnnonymous
    ? "Anonymous Donor"
    : donor?.name || "Donor";
  const campaignTitle = campaign?.title || "Charity Campaign";
  const amount = (donation.amount || 0).toFixed(2);
  const date = donation.createdAt
    ? new Date(donation.createdAt).toLocaleDateString()
    : new Date().toLocaleDateString();
  const receiptId = donation._id.toString().slice(-8).toUpperCase();

  return `
DONATION RECEIPT - ${platformName}
===================================

Thank you for your donation!

RECEIPT DETAILS:
• Receipt ID: ${receiptId}
• Date: ${date}
• Amount: ${amount} ETB
• Campaign: ${campaignTitle}
• Donor: ${donorName}
${donation.isAnnonymous ? "• Note: Anonymous donation\n" : ""}
${donation.isManual ? "• Note: Manually recorded donation\n" : ""}

This is an official receipt for tax purposes.

For questions: ${process.env.SUPPORT_EMAIL || "support@example.com"}

Thank you for making a difference!

- The ${platformName} Team
`;
}

// MAIN FUNCTION - Just one function to send receipts
export async function sendDonationReceipt(donationId) {
  try {
    // Get donation with populated data
    const donation = await Donation.findById(donationId)
      .populate({
        path: "campaignId",
        select: "title ngo",
        populate: {
          path: "ngo",
          select: "name",
        },
      })
      .populate({
        path: "donorId",
        select: "name email",
      });

    if (!donation) {
      throw new Error(`Donation ${donationId} not found`);
    }

    // Skip anonymous donations without email
    if (donation.isAnnonymous && !donation.donorId?.email) {
      return {
        success: true,
        skipped: true,
        message: "Skipped anonymous donation",
      };
    }

    // Get recipient email
    const recipientEmail =
      donation.donorId?.email ||
      (donation.isManual ? donation.method?.identifier : null);

    if (!recipientEmail) {
      throw new Error("No email address found for this donation");
    }

    // Generate email content
    const html = generateReceiptHTML({
      donation: donation.toObject(),
      campaign: donation.campaignId,
      donor: donation.donorId,
    });

    const text = generateReceiptText({
      donation: donation.toObject(),
      campaign: donation.campaignId,
      donor: donation.donorId,
    });

    // Send email
    const mailOptions = {
      from: `"${process.env.PLATFORM_NAME || "Charity Platform"}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: `Donation Receipt - ${donation.campaignId?.title || "Charity Donation"}`,
      text: text,
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);

    // Update donation record
    donation.receiptEmailSent = true;
    donation.receiptSentAt = new Date();
    await donation.save();

    return {
      success: true,
      message: "Receipt sent successfully",
      data: {
        donationId: donation._id,
        email: recipientEmail,
        messageId: info.messageId,
      },
    };
  } catch (error) {
    console.error("Error sending donation receipt:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Optional: Simple function to send receipts in bulk
export async function sendBulkReceipts(donationIds) {
  const results = [];

  for (const donationId of donationIds) {
    const result = await sendDonationReceipt(donationId);
    results.push({
      donationId,
      success: result.success,
      ...(result.success
        ? { message: result.message }
        : { error: result.error }),
    });
  }

  return results;
}

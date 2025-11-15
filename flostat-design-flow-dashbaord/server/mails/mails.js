export const queryAcknowledgmentEmail = (
  userEmail,
  queryId,
  queryType,
  description,
  attachmentUrl // 👈 new param
) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
      <h2 style="color: #007bff;">📩 We’ve Received Your Query!</h2>
      <p>Hi <strong>${userEmail}</strong>,</p>
      <p>Thank you for reaching out to us. We’ve successfully received your query and our support team will get back to you soon.</p>

      <table style="border-collapse: collapse; width: 100%; margin: 15px 0;">
        <tr>
          <td style="padding: 6px 10px; font-weight: bold;">Reference ID:</td>
          <td style="padding: 6px 10px;">${queryId}</td>
        </tr>
        <tr>
          <td style="padding: 6px 10px; font-weight: bold;">Query Type:</td>
          <td style="padding: 6px 10px;">${queryType}</td>
        </tr>
        <tr>
          <td style="padding: 6px 10px; font-weight: bold;">Description:</td>
          <td style="padding: 6px 10px;">${description}</td>
        </tr>
         <tr>
          <td style="padding: 6px 10px; font-weight: bold;">AttachmentUrl:</td>
          <td style="padding: 6px 10px;">${attachmentUrl}</td>
        </tr>
      </table>

      ${
        attachmentUrl
          ? `
          <div style="margin-top: 20px; text-align: center;">
            <p style="font-weight: bold;">Attached Image:</p>
            <img src="${attachmentUrl}" alt="Attachment" style="max-width: 100%; border-radius: 6px; border: 1px solid #ccc;" />
          </div>
          `
          : ""
      }

      <p>Our team will review your request and respond within 24–48 hours.</p>
      <p>For urgent matters, please reply to this email.</p>

      <hr>
      <p style="color: #555;">Best Regards,<br><strong>Support Team</strong><br>Your Company Name</p>
    </div>
  `;
};

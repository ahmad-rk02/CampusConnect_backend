import Grievance from '../models/grievanceModel.js';
import nodemailer from 'nodemailer';

// Function to generate a unique ticket ID
const generateTicketId = () => {
  return 'TKT' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

// Function to send styled email
const sendEmail = async (to, subject, text, isStatusUpdate = false) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'razakhanahmad68@gmail.com',
      pass: 'kbol dggl zzzt xumr',
    },
  });

  const createEmailTemplate = (content, isStatusUpdate) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
        .email-container { border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
        .header { background-color: #102C57; padding: 20px; text-align: center; }
        .header h1 { color: white; margin: 0; }
        .content { padding: 20px; }
        .footer { background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666; }
        .ticket-id { 
          background-color: #f0f7ff; 
          padding: 10px; 
          border-radius: 5px; 
          font-weight: bold; 
          color: #102C57;
          margin: 15px 0;
        }
        .status-update {
          background-color: ${isStatusUpdate ? '#e6f7e6' : '#fff4e6'};
          padding: 15px;
          border-radius: 5px;
          margin: 15px 0;
          border-left: 4px solid ${isStatusUpdate ? '#28a745' : '#ffc107'};
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>CampusConnect</h1>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Government College of Engineering Chandrapur</p>
        </div>
      </div>
    </body>
    </html>
    `;
  };

  const mailOptions = {
    from: '"no-reply" <razakhanahmad68@gmail.com>',
    to: to,
    subject: subject,
    html: createEmailTemplate(text, isStatusUpdate),
    text: text,
    replyTo: 'no-reply@campusconnect.com',
  };


  await transporter.sendMail(mailOptions);
};

// Function to create grievance and send confirmation email
export const createGrievance = async (formData) => {
  try {
    const ticketId = generateTicketId();
    const grievance = new Grievance({
      ...formData,
      ticketId,
      status: 'not resolved',
    });

    await grievance.save();

    const emailContent = `
      <p>Dear ${formData.fullname},</p>
      <p>Your grievance has been submitted successfully.</p>
      <div class="ticket-id">Ticket ID: ${ticketId}</div>
      <p><strong>Type:</strong> ${formData.grievanceType}</p>
      <p><strong>Message:</strong> ${formData.message}</p>
      <div class="status-update">
        <p><strong>Status:</strong> Not Resolved</p>
      </div>
      <p>You will receive updates on this ticket via email.</p>
      <p>Best Regards,<br>Administration</p>
    `;

    await sendEmail(
      formData.email,
      'Grievance Submission Confirmation',
      emailContent
    );

    return grievance;
  } catch (err) {
    throw new Error('Error in grievance submission: ' + err.message);
  }
};

// Function to update grievance status and send email to user
export const updateGrievanceStatus = async (ticketId, status, remarks) => {
  try {
    const grievance = await Grievance.findOne({ ticketId });
    if (!grievance) throw new Error('Grievance not found');
    if (grievance.status === 'resolved') throw new Error('Grievance is already resolved and cannot be updated');

    const updatedGrievance = await Grievance.findOneAndUpdate(
      { ticketId },
      { status, remarks },
      { new: true }
    );

    let emailContent = '';
    if (status === 'in progress') {
      emailContent = `
        <p>Dear ${grievance.fullname},</p>
        <div class="ticket-id">Ticket ID: ${ticketId}</div>
        <div class="status-update">
          <p><strong>Status Update:</strong> In Progress</p>
          <p><strong>Remarks:</strong> ${remarks || 'No remarks provided'}</p>
        </div>
        <p>Our team is currently working on your grievance.</p>
        <p>Best Regards,<br>Administration</p>
      `;
    } else if (status === 'resolved') {
      emailContent = `
        <p>Dear ${grievance.fullname},</p>
        <div class="ticket-id">Ticket ID: ${ticketId}</div>
        <div class="status-update">
          <p><strong>Status Update:</strong> Resolved</p>
          <p><strong>Remarks:</strong> ${remarks || 'No remarks provided'}</p>
        </div>
        <p>Your grievance has been successfully resolved.</p>
        <p>Best Regards,<br>Administration</p>
      `;
    }

    await sendEmail(
      grievance.email,
      `Grievance Status Update: ${status}`,
      emailContent,
      true
    );

    return updatedGrievance;
  } catch (err) {
    throw new Error('Error in updating grievance status: ' + err.message);
  }
};
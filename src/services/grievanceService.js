import Grievance from '../models/grievanceModel.js';
import nodemailer from 'nodemailer';

// Function to generate a unique ticket ID
const generateTicketId = () => {
  return 'TKT' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

// Function to send email
const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'razakhanahmad68@gmail.com',
      pass: 'kbol dggl zzzt xumr'
    }
  });

  const mailOptions = {
    from: '"CampusConnect"<razakhanahmad68@gmail.com>',
    to: to,
    subject: subject,
    text: text
  };

  await transporter.sendMail(mailOptions);
};

// Function to create grievance and send confirmation email
export const createGrievance = async (formData) => {
  try {
    const ticketId = generateTicketId();
    const grievance = new Grievance({
      ...formData,
      ticketId: ticketId
    });

    await grievance.save();

    // Send email to user
    const emailText = `Dear ${formData.fullname},\n\nYour grievance has been submitted successfully. Your ticket ID is: ${ticketId}\n\nGrievance Details:\n${formData.message}\n\nBest Regards,\nAdministration`;
    await sendEmail(formData.email, 'Grievance Submission Confirmation', emailText);

    return grievance;
  } catch (err) {
    throw new Error('Error in grievance submission');
  }
};

// Function to update grievance status and send email to user
export const updateGrievanceStatus = async (ticketId, remarks) => {
  try {
    const grievance = await Grievance.findOneAndUpdate(
      { ticketId },
      { status: 'closed', remarks },
      { new: true }
    );

    // Send email to user with remarks
    const emailText = `Dear ${grievance.fullname},\n\nYour grievance ticket with ID ${ticketId} has been closed. Remarks from the admin: ${remarks}\n\nBest Regards,\nAdministration`;
    await sendEmail(grievance.email, 'Grievance Status Update', emailText);

    return grievance;
  } catch (err) {
    throw new Error('Error in updating grievance status');
  }
};

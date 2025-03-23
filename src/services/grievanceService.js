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
      pass: 'kbol dggl zzzt xumr', // Use an app-specific password
    },
  });

  const mailOptions = {
    from: '"CampusConnect" <razakhanahmad68@gmail.com>',
    to: to,
    subject: subject,
    text: text,
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
      status: 'not resolved', // Default status
    });

    await grievance.save();

    const emailText = `Dear ${formData.fullname},\n\nYour grievance has been submitted successfully.\n\nTicket ID: ${ticketId}\nType: ${formData.grievanceType}\nMessage: ${formData.message}\nStatus: Not Resolved\n\nBest Regards,\nAdministration`;
    await sendEmail(formData.email, 'Grievance Submission Confirmation', emailText);

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

    let emailText;
    if (status === 'in progress') {
      emailText = `Dear ${grievance.fullname},\n\nYour grievance ticket with ID ${ticketId} is now in progress.\n\nRemarks: ${remarks || 'None'}\n\nBest Regards,\nAdministration`;
    } else if (status === 'resolved') {
      emailText = `Dear ${grievance.fullname},\n\nYour grievance ticket with ID ${ticketId} has been resolved.\n\nRemarks: ${remarks || 'None'}\n\nBest Regards,\nAdministration`;
    }
    await sendEmail(grievance.email, `Grievance Status Update: ${status}`, emailText);

    return updatedGrievance;
  } catch (err) {
    throw new Error('Error in updating grievance status: ' + err.message);
  }
};
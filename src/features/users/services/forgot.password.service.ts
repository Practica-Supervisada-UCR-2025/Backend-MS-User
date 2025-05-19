import admin from '../../../config/firebase'; // adjust if needed
import axios from 'axios';

//TODO: Add error handling and logging
//TODO: Check how to connect to the other microservice

export async function generatePasswordResetLink(email: string): Promise<string> {
  try {
    // 1. Generate the password reset link
    const recoveryLink = await admin.auth().generatePasswordResetLink(email);

    await axios.post('http://backend-notification-app:3001/api/email/send-password-reset', {
      email,
      recoveryLink,
    });


    return `The recovery email has been sent to ${email}. Follow the instructions in the email to reset your password.`;
  } catch (error) {
    console.error('[generatePasswordResetLink] Error:', error);

    if (error instanceof Error) {
      throw new Error(`The email is not valid or is not registered. Details: ${error.message}`);
    } else {
      throw new Error(`The email is not valid or is not registered. Details: ${String(error)}`);
    }
  }
}

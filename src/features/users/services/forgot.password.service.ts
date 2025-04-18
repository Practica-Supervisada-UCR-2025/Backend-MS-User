import admin from '../../../config/firebase'; // adjust if needed
import axios from 'axios';


//TODO: Add error handling and logging
//TODO: Check how tf i connect to the other microservice



export async function generatePasswordResetLink(email: string): Promise<string> {
  try {
    // 1. Generate the password reset link
    const recoveryLink = await admin.auth().generatePasswordResetLink(email);

    // 2. Send it to MS-Notification
    await axios.post('http://ms-notification:3001/api/email/recovery', {
      email,
      recoveryLink,
    });

    return `Recovery email sent to ${email}`;
  } catch (error) {
    console.error('[generatePasswordResetLink] Error:', error);
    throw new Error('Failed to generate or send recovery link');
  }
}

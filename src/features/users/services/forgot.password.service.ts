import admin from '../../../config/firebase'; // adjust if needed
import axios from 'axios';


//TODO: Add error handling and logging
//TODO: Check how tf i connect to the other microservice

export async function generatePasswordResetLink(email: string): Promise<string> {
  try {
    // 1. Generate the password reset link
    const recoveryLink = await admin.auth().generatePasswordResetLink(email);


    await axios.post(`http://${process.env.MS_NOTIFICATIONS_URL}/api/email/send-password-reset`, {
      email,
      recoveryLink,
    });
    

    return `Se envio el correo de recuperación a ${email}.Sigue las instrucciones en el correo para restablecer tu contraseña.`;
  } catch (error) {
    console.error('[generatePasswordResetLink] Error:', error);
    
    if (error instanceof Error) {
      throw new Error(`El correo electrónico no es válido o no está registrado. Detalle: ${error.message}`);
    } else {
      throw new Error(`El correo electrónico no es válido o no está registrado. Detalle: ${String(error)}`);
    }
  }  
}

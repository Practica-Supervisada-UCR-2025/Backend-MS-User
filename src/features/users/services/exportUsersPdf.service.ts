// services/exportUsersPdf.service.ts
import { Buffer } from 'buffer';
import { getAllUsers } from '../repositories/user.repository';
import { generateUsersPdf } from '../../../utils/PDF/userPdfGenerator';

export const exportUsersPdfService = async (): Promise<Buffer> => {
  const users = await getAllUsers();

  if (!users || users.length === 0) {
    throw new Error('No hay usuarios registrados.');
  }

  const pdfBuffer = await generateUsersPdf(users);
  return pdfBuffer;
};
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

interface UserData {
  id: string;
  email: string;
  full_name: string;
  username: string;
  created_at: string;
  is_active: boolean;
  auth_id: string;
}

// Registrar las fuentes
(pdfMake as any).vfs = (pdfFonts as any).vfs;

export const generateUsersPdf = async (users: UserData[]): Promise<Buffer> => {
  const totalUsers = users.length;
  const suspendedUsers = users.filter(u => !u.is_active).length;

  const tableBody = [
    [
      { text: 'ID', bold: true },
      { text: 'Correo', bold: true },
      { text: 'Nombre completo', bold: true },
      { text: 'Usuario', bold: true },
      { text: 'Fecha de registro', bold: true },
      { text: 'Estado', bold: true },
      { text: 'Auth ID', bold: true },
    ],
    ...users.map(user => [
    user.id ?? '-',
    user.email ?? '-',
    user.full_name ?? '-',
    user.username ?? '-',
    user.created_at
      ? new Date(user.created_at).toLocaleDateString('es-CR')
      : '-',
    user.is_active ? 'Activo' : 'Suspendido',
    user.auth_id ?? '-',
  ]),
    ];

  const docDefinition: TDocumentDefinitions = {
  pageOrientation: 'landscape',
  content: [
    { text: 'Reporte de Usuarios Actuales', style: 'header', alignment: 'center' },
    '\n',
    { text: `Cantidad total de usuarios: ${totalUsers}` },
    { text: `Cantidad de usuarios suspendidos: ${suspendedUsers}` },
    '\n\n',
    {
      style: 'smallTable', // 👈 estilo se aplica aquí
      table: {
        headerRows: 1,
         widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*'],
        body: tableBody,
      },
      layout: 'lightHorizontalLines',
    },
  ],
  styles: {
    header: {
      fontSize: 18,
      bold: true,
    },
    smallTable: {
      fontSize: 9, // 🔍 ajustá según legibilidad, 6–8 suele ser el mínimo usable
    },
  },
};


  return new Promise<Buffer>((resolve, reject) => {
    const pdfDoc = pdfMake.createPdf(docDefinition);
    pdfDoc.getBuffer((buffer: Uint8Array) => {
      resolve(Buffer.from(buffer));
    });
  });
};

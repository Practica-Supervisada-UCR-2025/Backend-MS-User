import client from '../../../config/database';

export const createSuspension = async (suspension: { user_id: string; days: number; description?: string }) => {
  if ( suspension.description == undefined || suspension.description === null || suspension.description === "") {
    suspension.description = "";
  }
  const { user_id, days, description } = suspension;
  const start_date = new Date();
  const end_date = new Date();
  end_date.setDate(start_date.getDate() + days);
  const id = require('uuid').v4();
  const result = await client.query(
    `INSERT INTO user_suspensions (id, user_id, start_date, end_date, description)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [id, user_id, start_date, end_date, description || null]
  );
  return result.rows[0];
};

export const findSuspensionById = async (id: string) => {
  const result = await client.query(
    `SELECT * FROM user_suspensions WHERE user_id = $1 AND end_date >= NOW()`,
    [id]
  );
  return result.rows[0];
};

export const isUserSuspended = async (userId: string): Promise<boolean> => {
  const query = `
    SELECT 1
    FROM user_suspensions
    WHERE user_id = $1
      AND start_date <= NOW()
      AND end_date > NOW()
    LIMIT 1;
  `;
  const result = await client.query(query, [userId]);
  return result.rows.length > 0;
};

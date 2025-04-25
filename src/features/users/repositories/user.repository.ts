import client from '../../../config/database';
import { User } from '../interfaces/user-entities.interface';

export const findByEmailUser = async (email: string) => {
  const res = await client.query('SELECT * FROM users WHERE email = $1', [email]);
  return res.rows.length > 0 ? res.rows[0] : null;
};

export const createUser = async (user: User) => {
  const result = await client.query(`
    INSERT INTO users (id, email, full_name, username, profile_picture, auth_id, is_active, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    RETURNING *`,
    [user.id, user.email, user.full_name, user.username, user.profile_picture, user.auth_id, user.is_active]
  );
  return result.rows[0];
};

export const updateUserActiveStatus = async (email: string, isActive: boolean) => {
  try {
    const result = await client.query(
      'UPDATE users SET is_active = $1 WHERE email = $2 RETURNING *',
      [isActive, email]
    );

    if (result.rowCount === 0) {
      throw new Error(`User with email ${email} not found`);
    }

    return result.rows[0];
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};
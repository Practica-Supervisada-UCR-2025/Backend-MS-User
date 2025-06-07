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

export const findByIdUser = async (id: string) => {
  const res = await client.query('SELECT * FROM users WHERE id = $1', [id]);
  return res.rows.length > 0 ? res.rows[0] : null;
};

export const updateUserProfile = async (email: string, updates: { username?: string, full_name?: string, profile_picture?: string }) => {
  try {
    let query = 'UPDATE users SET';
    const values = [];
    let paramIndex = 1;
    
    const updateFields = [];
    
    if (updates.username) {
      updateFields.push(` username = $${paramIndex++}`);
      values.push(updates.username);
    }
    
    if (updates.full_name) {
      updateFields.push(` full_name = $${paramIndex++}`);
      values.push(updates.full_name);
    }
    
    if (updates.profile_picture) {
      updateFields.push(` profile_picture = $${paramIndex++}`);
      values.push(updates.profile_picture);
    }
    
    if (updateFields.length === 0) {
      return await findByEmailUser(email);
    }
    
    query += updateFields.join(',');
    query += ` WHERE email = $${paramIndex} RETURNING *`;
    values.push(email);
    
    const result = await client.query(query, values);
    
    if (result.rowCount === 0) {
      throw new Error(`User with email ${email} not found`);
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};


export const getAllUsers = async () => {
  const result = await client.query(`
    SELECT 
      id,
      email,
      full_name,
      username,
      created_at,
      is_active,
      auth_id
    FROM users
  `);
  return result.rows;
};

export const searchUsersByName = async (name: string, limit: number = 5) => {
  const res = await client.query(
      `SELECT DISTINCT username, full_name ,profile_picture, id
     FROM users
     WHERE is_active = TRUE AND (username ILIKE $1 OR full_name ILIKE $1)
     LIMIT $2`,
      [`%${name}%`, limit]
  );
  return res.rows;
};

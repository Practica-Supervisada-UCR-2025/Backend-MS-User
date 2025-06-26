import client from '../../../config/database';
import { User } from '../interfaces/user-entities.interface';
import { GetAllUsersQueryDto } from '../dto/getAllUsers.dto';

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

export const getAllUsersRepository = async (dto: GetAllUsersQueryDto) => {
  const { created_after, limit } = dto;

  const dataQuery = `
    SELECT id, email, full_name, username, profile_picture, is_active, created_at, auth_id
    FROM users
    WHERE is_active = true AND created_at > $1
    ORDER BY created_at ASC
    LIMIT $2
  `;

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM users
    WHERE is_active = true AND created_at > $1
  `;

  const dataPromise = client.query(dataQuery, [created_after, limit]);
  const countPromise = client.query(countQuery, [created_after]);

  const [dataResult, countResult] = await Promise.all([dataPromise, countPromise]);

  return {
    users: dataResult.rows,
    totalRemaining: parseInt(countResult.rows[0].total, 10),
  };
};

export const getUserByUsernameRepository = async (username: string) => {
  const query = `
    SELECT id, email, full_name, username, profile_picture, is_active, created_at, auth_id
    FROM users
    WHERE is_active = true AND username = $1
    LIMIT 1
  `;

  const result = await client.query(query, [username]);

  return result.rows[0] || null;
};
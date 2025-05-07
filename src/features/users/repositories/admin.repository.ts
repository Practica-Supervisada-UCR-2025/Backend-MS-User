import client from '../../../config/database';
import { AdminUser } from '../interfaces/user-entities.interface';

export const findByEmailAdmin = async (email: string) => {
  const res = await client.query('SELECT * FROM admin_users WHERE email = $1', [email]);
  return res.rows.length > 0 ? res.rows[0] : null;
};

export const createAdmin = async (admin: AdminUser) => {
  const result = await client.query(`
    INSERT INTO admin_users (id, email, full_name, auth_id, is_active, created_at)
    VALUES ($1, $2, $3, $4, $5, NOW())`,
    [admin.id, admin.email, admin.full_name, admin.auth_id, admin.is_active]
  );
  return result.rows[0];
};

export const updateAdminActiveStatus = async (email: string, isActive: boolean) => {
  try {
    const result = await client.query(
      'UPDATE admin_users SET is_active = $1 WHERE email = $2 RETURNING *',
      [isActive, email]
    );

    if (result.rowCount === 0) {
      throw new Error(`Admin with email ${email} not found`);
    }

    return result.rows[0];
  } catch (error) {
    console.error('Error updating admin status:', error);
    throw error;
  }
};


export const updateAdminProfile = async (email: string, updates: { full_name?: string, profile_picture?: string }) => {
  try {
    let query = 'UPDATE admin_users SET';
    const values = [];
    let paramIndex = 1;
    
    const updateFields = [];
    
    if (updates.full_name) {
      updateFields.push(` full_name = $${paramIndex++}`);
      values.push(updates.full_name);
    }
    
    if (updates.profile_picture) {
      updateFields.push(` profile_picture = $${paramIndex++}`);
      values.push(updates.profile_picture);
    }
    
    // Si no hay nada que actualizar, retornar admin existente
    if (updateFields.length === 0) {
      return await findByEmailAdmin(email);
    }
    
    query += updateFields.join(',');
    query += ` WHERE email = $${paramIndex} RETURNING *`;
    values.push(email);
    
    const result = await client.query(query, values);
    
    if (result.rowCount === 0) {
      throw new Error(`Admin with email ${email} not found`);
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error updating admin profile:', error);
    throw error;
  }
};
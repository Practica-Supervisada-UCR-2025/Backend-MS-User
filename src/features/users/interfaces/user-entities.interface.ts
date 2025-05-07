export interface BaseUser {
  id: string;
  email: string;
  auth_id: string;
  full_name: string;
  is_active: boolean;
  profile_picture: string;
  created_at: Date;
  last_login: Date | null;
}

export interface User extends BaseUser {
  username: string;
}

export interface AdminUser extends BaseUser {
  // solo lo hereda sin necesidad de más campos
}
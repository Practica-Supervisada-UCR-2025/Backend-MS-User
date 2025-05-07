import { updateUserProfileSchema, updateAdminProfileSchema } from '../../src/features/users/dto/profile.dto';

describe('Profile DTO Validation', () => {
  describe('updateUserProfileSchema', () => {
    it('should validate valid user profile data', async () => {
      const validData = {
        email: 'user@ucr.ac.cr',
        username: 'validuser',
        full_name: 'Valid User',
        profile_picture: 'https://example.com/pic.jpg'
      };

      const result = await updateUserProfileSchema.validate(validData);
      expect(result).toEqual(validData);
    });

    it('should validate with optional fields missing', async () => {
      const validData = {
        email: 'user@ucr.ac.cr'
      };

      const result = await updateUserProfileSchema.validate(validData);
      expect(result).toEqual(validData);
    });

    it('should reject invalid email format', async () => {
      const invalidData = {
        email: 'invalid.email@gmail.com'
      };

      await expect(updateUserProfileSchema.validate(invalidData))
        .rejects
        .toThrow('El correo debe ser institucional de la UCR (@ucr.ac.cr)');
    });

    it('should reject invalid username format', async () => {
      const invalidData = {
        email: 'user@ucr.ac.cr',
        username: 'invalid@username'
      };

      await expect(updateUserProfileSchema.validate(invalidData))
        .rejects
        .toThrow('El nombre de usuario solo puede contener letras, números, puntos, guiones y guiones bajos');
    });

    it('should reject invalid full_name format', async () => {
      const invalidData = {
        email: 'user@ucr.ac.cr',
        full_name: 'Invalid123 Name'
      };

      await expect(updateUserProfileSchema.validate(invalidData))
        .rejects
        .toThrow('El nombre completo solo puede contener letras y espacios');
    });

    it('should reject invalid profile picture URL', async () => {
      const invalidData = {
        email: 'user@ucr.ac.cr',
        profile_picture: 'not-a-url'
      };

      await expect(updateUserProfileSchema.validate(invalidData))
        .rejects
        .toThrow('La URL de la imagen de perfil debe ser válida');
    });
  });

  describe('updateAdminProfileSchema', () => {
    it('should validate valid admin profile data', async () => {
      const validData = {
        email: 'admin@ucr.ac.cr',
        full_name: 'Valid Admin',
        profile_picture: 'https://example.com/pic.jpg'
      };

      const result = await updateAdminProfileSchema.validate(validData);
      expect(result).toEqual(validData);
    });

    it('should validate with optional fields missing', async () => {
      const validData = {
        email: 'admin@ucr.ac.cr'
      };

      const result = await updateAdminProfileSchema.validate(validData);
      expect(result).toEqual(validData);
    });

    it('should reject invalid email format', async () => {
      const invalidData = {
        email: 'invalid.email@gmail.com'
      };

      await expect(updateAdminProfileSchema.validate(invalidData))
        .rejects
        .toThrow('El correo debe ser institucional de la UCR (@ucr.ac.cr)');
    });

    it('should reject invalid full_name format', async () => {
      const invalidData = {
        email: 'admin@ucr.ac.cr',
        full_name: 'Invalid123 Name'
      };

      await expect(updateAdminProfileSchema.validate(invalidData))
        .rejects
        .toThrow('El nombre completo solo puede contener letras y espacios');
    });

    it('should reject invalid profile picture URL', async () => {
      const invalidData = {
        email: 'admin@ucr.ac.cr',
        profile_picture: 'not-a-url'
      };

      await expect(updateAdminProfileSchema.validate(invalidData))
        .rejects
        .toThrow('La URL de la imagen de perfil debe ser válida');
    });
  });
});
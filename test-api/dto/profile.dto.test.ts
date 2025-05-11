import { updateUserProfileSchema, updateAdminProfileSchema } from '../../src/features/users/dto/profile.dto';

describe('Profile DTOs Validation', () => {
  describe('updateUserProfileSchema', () => {
    it('should validate a valid user profile update', async () => {
      const validData = {
        username: 'validuser',
        full_name: 'Valid Name'
      };

      await expect(updateUserProfileSchema.validate(validData)).resolves.toEqual(validData);
    });

    it('should validate when only username is provided', async () => {
      const validData = {
        username: 'validuser'
      };

      await expect(updateUserProfileSchema.validate(validData)).resolves.toEqual(validData);
    });

    it('should validate when only full_name is provided', async () => {
      const validData = {
        full_name: 'Valid Name'
      };

      await expect(updateUserProfileSchema.validate(validData)).resolves.toEqual(validData);
    });

    it('should reject username that is too short', async () => {
      const invalidData = {
        username: 'ab', // Less than 3 characters
        full_name: 'Valid Name'
      };

      await expect(updateUserProfileSchema.validate(invalidData)).rejects.toThrow(
        'El nombre de usuario debe tener al menos 3 caracteres'
      );
    });

    it('should reject username that is too long', async () => {
      const invalidData = {
        username: 'a'.repeat(21), // More than 20 characters
        full_name: 'Valid Name'
      };

      await expect(updateUserProfileSchema.validate(invalidData)).rejects.toThrow(
        'El nombre de usuario no debe superar los 20 caracteres'
      );
    });

    it('should reject username with invalid characters', async () => {
      const invalidData = {
        username: 'user@name', // Contains @
        full_name: 'Valid Name'
      };

      await expect(updateUserProfileSchema.validate(invalidData)).rejects.toThrow(
        'El nombre de usuario solo puede contener letras, números, puntos, guiones y guiones bajos'
      );
    });

    it('should reject full_name that is too short', async () => {
      const invalidData = {
        username: 'validuser',
        full_name: 'Ab' // Less than 3 characters
      };

      await expect(updateUserProfileSchema.validate(invalidData)).rejects.toThrow(
        'El nombre completo debe tener al menos 3 caracteres'
      );
    });

    it('should reject full_name that is too long', async () => {
      const invalidData = {
        username: 'validuser',
        full_name: 'A'.repeat(26) // More than 25 characters
      };

      await expect(updateUserProfileSchema.validate(invalidData)).rejects.toThrow(
        'El nombre completo no debe superar los 25 caracteres'
      );
    });

    it('should reject full_name with invalid characters', async () => {
      const invalidData = {
        username: 'validuser',
        full_name: 'Invalid Name123' // Contains numbers
      };

      await expect(updateUserProfileSchema.validate(invalidData)).rejects.toThrow(
        'El nombre completo solo puede contener letras y espacios'
      );
    });

    it('should accept valid full_name with Spanish characters', async () => {
      const validData = {
        full_name: 'José Martín Ñáñez'
      };

      await expect(updateUserProfileSchema.validate(validData)).resolves.toEqual(validData);
    });
  });

  describe('updateAdminProfileSchema', () => {
    it('should validate a valid admin profile update', async () => {
      const validData = {
        full_name: 'Valid Admin Name'
      };

      await expect(updateAdminProfileSchema.validate(validData)).resolves.toEqual(validData);
    });

    it('should reject full_name that is too short', async () => {
      const invalidData = {
        full_name: 'Ab' // Less than 3 characters
      };

      await expect(updateAdminProfileSchema.validate(invalidData)).rejects.toThrow(
        'El nombre completo debe tener al menos 3 caracteres'
      );
    });

    it('should reject full_name that is too long', async () => {
      const invalidData = {
        full_name: 'A'.repeat(26) // More than 25 characters
      };

      await expect(updateAdminProfileSchema.validate(invalidData)).rejects.toThrow(
        'El nombre completo no debe superar los 25 caracteres'
      );
    });

    it('should reject full_name with invalid characters', async () => {
      const invalidData = {
        full_name: 'Invalid Admin123' // Contains numbers
      };

      await expect(updateAdminProfileSchema.validate(invalidData)).rejects.toThrow(
        'El nombre completo solo puede contener letras y espacios'
      );
    });

    it('should accept valid full_name with Spanish characters', async () => {
      const validData = {
        full_name: 'Administrador Ñáñez'
      };

      await expect(updateAdminProfileSchema.validate(validData)).resolves.toEqual(validData);
    });
  });
});
const mockAdmin = {
  auth: jest.fn().mockReturnThis(),
  generatePasswordResetLink: jest.fn(),
  verifyIdToken: jest.fn(),
  getUser: jest.fn(),
};

export default mockAdmin;
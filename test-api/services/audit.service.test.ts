import { logAuditEvent, logProfileUpdate } from '../../src/features/users/services/audit.service';
import { AuditEvent } from '../../src/features/users/interfaces/audit-event.interface';
import { v4 as uuidv4 } from 'uuid';

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid')
}));

// Mock console methods
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('Audit Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('logAuditEvent', () => {
    it('should log audit event successfully', async () => {
      const mockAuditEvent: AuditEvent = {
        event_id: 'test-uuid',
        event_type: 'profile_update',
        client_type: 'web',
        role_type: 'user',
        entity_id: 'user123',
        changed_by: 'user@ucr.ac.cr',
        changed_at: new Date(),
        changed_fields: ['username', 'full_name'],
        old_values: {
          username: 'olduser',
          full_name: 'Old Name'
        },
        new_values: {
          username: 'newuser',
          full_name: 'New Name'
        }
      };

      await logAuditEvent(mockAuditEvent);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        'AUDIT EVENT:',
        expect.any(String)
      );

      const loggedData = JSON.parse(mockConsoleLog.mock.calls[0][1]);
      expect(loggedData).toMatchObject({
        event_type: 'profile_update',
        client_type: 'web',
        role_type: 'user',
        changed_by: 'user@ucr.ac.cr',
        changed_fields: ['username', 'full_name']
      });
    });

    it('should handle errors gracefully', async () => {
      // Force console.log to throw an error
      mockConsoleLog.mockImplementationOnce(() => {
        throw new Error('Logging failed');
      });

      const mockAuditEvent: AuditEvent = {
        event_id: 'test-uuid',
        event_type: 'profile_update',
        client_type: 'web',
        role_type: 'user',
        entity_id: 'user123',
        changed_by: 'user@ucr.ac.cr',
        changed_at: new Date(),
        changed_fields: ['username'],
        old_values: { username: 'old' },
        new_values: { username: 'new' }
      };

      await logAuditEvent(mockAuditEvent);

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error logging audit event:',
        expect.any(Error)
      );
    });
  });

  describe('logProfileUpdate', () => {
    it('should create and log profile update event for web user', async () => {
      await logProfileUpdate(
        'web',
        'user',
        'user123',
        'user@ucr.ac.cr',
        ['username', 'full_name'],
        { username: 'olduser', full_name: 'Old Name' },
        { username: 'newuser', full_name: 'New Name' }
      );

      expect(mockConsoleLog).toHaveBeenCalled();
      
      const loggedData = JSON.parse(mockConsoleLog.mock.calls[0][1]);
      expect(loggedData).toMatchObject({
        event_type: 'profile_update',
        client_type: 'web',
        role_type: 'user',
        entity_id: 'user123',
        changed_by: 'user@ucr.ac.cr',
        changed_fields: ['username', 'full_name'],
        old_values: {
          username: 'olduser',
          full_name: 'Old Name'
        },
        new_values: {
          username: 'newuser',
          full_name: 'New Name'
        }
      });
    });

    it('should create and log profile update event for mobile admin', async () => {
      await logProfileUpdate(
        'mobile',
        'admin',
        'admin123',
        'admin@ucr.ac.cr',
        ['full_name'],
        { full_name: 'Old Admin' },
        { full_name: 'New Admin' }
      );

      expect(mockConsoleLog).toHaveBeenCalled();
      
      const loggedData = JSON.parse(mockConsoleLog.mock.calls[0][1]);
      expect(loggedData).toMatchObject({
        event_type: 'profile_update',
        client_type: 'mobile',
        role_type: 'admin',
        entity_id: 'admin123',
        changed_by: 'admin@ucr.ac.cr',
        changed_fields: ['full_name'],
        old_values: { full_name: 'Old Admin' },
        new_values: { full_name: 'New Admin' }
      });
    });

    it('should generate unique event IDs for each audit event', async () => {
      // Mock uuid to return different values
      (uuidv4 as jest.Mock)
        .mockReturnValueOnce('uuid-1')
        .mockReturnValueOnce('uuid-2');

      // Create two audit events
      await logProfileUpdate(
        'web',
        'user',
        'user1',
        'user1@ucr.ac.cr',
        ['username'],
        { username: 'old1' },
        { username: 'new1' }
      );

      await logProfileUpdate(
        'web',
        'user',
        'user2',
        'user2@ucr.ac.cr',
        ['username'],
        { username: 'old2' },
        { username: 'new2' }
      );

      const firstLog = JSON.parse(mockConsoleLog.mock.calls[0][1]);
      const secondLog = JSON.parse(mockConsoleLog.mock.calls[1][1]);

      expect(firstLog.event_id).toBe('uuid-1');
      expect(secondLog.event_id).toBe('uuid-2');
      expect(firstLog.event_id).not.toBe(secondLog.event_id);
    });

    it('should include timestamp in audit events', async () => {
      await logProfileUpdate(
        'web',
        'user',
        'user123',
        'user@ucr.ac.cr',
        ['username'],
        { username: 'old' },
        { username: 'new' }
      );

      const loggedData = JSON.parse(mockConsoleLog.mock.calls[0][1]);
      expect(loggedData.changed_at).toBeDefined();
      expect(new Date(loggedData.changed_at)).toBeInstanceOf(Date);
    });
  });
});
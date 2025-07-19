import { SprintService } from './sprint.service';

describe('SprintService - calculateWorkingDays', () => {
  let service: SprintService;

  beforeEach(() => {
    // Create a minimal service instance for testing the pure function
    service = new SprintService(null as any, null as any);
  });

  describe('calculateWorkingDays', () => {
    it('should be defined', () => {
      expect(service.calculateWorkingDays).toBeDefined();
    });

    it('should calculate working days correctly for a single week (Mon-Fri)', () => {
      // Monday January 1, 2024 to Friday January 5, 2024
      const startDate = new Date('2024-01-01'); // Monday
      const endDate = new Date('2024-01-05');   // Friday
      
      const result = service.calculateWorkingDays(startDate, endDate);
      
      expect(result).toBe(5);
    });

    it('should exclude weekends (Saturday and Sunday)', () => {
      // Monday January 1, 2024 to Sunday January 7, 2024
      const startDate = new Date('2024-01-01'); // Monday
      const endDate = new Date('2024-01-07');   // Sunday
      
      const result = service.calculateWorkingDays(startDate, endDate);
      
      expect(result).toBe(5); // Only Monday-Friday should count
    });

    it('should return 1 for same day when it is a weekday', () => {
      // Wednesday January 3, 2024
      const date = new Date('2024-01-03'); // Wednesday
      
      const result = service.calculateWorkingDays(date, date);
      
      expect(result).toBe(1);
    });

    it('should return 0 for same day when it is a weekend', () => {
      // Saturday January 6, 2024
      const date = new Date('2024-01-06'); // Saturday
      
      const result = service.calculateWorkingDays(date, date);
      
      expect(result).toBe(0);
    });

    it('should return 0 for weekend-only period', () => {
      // Saturday January 6, 2024 to Sunday January 7, 2024
      const startDate = new Date('2024-01-06'); // Saturday
      const endDate = new Date('2024-01-07');   // Sunday
      
      const result = service.calculateWorkingDays(startDate, endDate);
      
      expect(result).toBe(0);
    });

    it('should calculate working days for a two-week sprint', () => {
      // Monday January 1, 2024 to Friday January 12, 2024 (excluding weekends)
      const startDate = new Date('2024-01-01'); // Monday
      const endDate = new Date('2024-01-12');   // Friday (2 weeks later)
      
      const result = service.calculateWorkingDays(startDate, endDate);
      
      expect(result).toBe(10); // 2 weeks * 5 working days
    });

    it('should handle month boundaries correctly', () => {
      // Monday January 29, 2024 to Friday February 2, 2024
      const startDate = new Date('2024-01-29'); // Monday
      const endDate = new Date('2024-02-02');   // Friday
      
      const result = service.calculateWorkingDays(startDate, endDate);
      
      expect(result).toBe(5);
    });

    it('should handle when end date is before start date', () => {
      // This is an edge case - what should happen when dates are reversed?
      const startDate = new Date('2024-01-05'); // Friday
      const endDate = new Date('2024-01-01');   // Monday
      
      const result = service.calculateWorkingDays(startDate, endDate);
      
      // Current implementation will return 0 because the while loop condition fails
      expect(result).toBe(0);
    });

    it('should handle date strings properly', () => {
      // Test with string dates that get converted to Date objects
      const startDate = new Date('2024-01-01'); // Monday
      const endDate = new Date('2024-01-05');   // Friday
      
      const result = service.calculateWorkingDays(startDate, endDate);
      
      expect(result).toBe(5);
    });

    it('should handle a sprint that starts on Friday and ends on Monday', () => {
      // Friday January 5, 2024 to Monday January 8, 2024
      const startDate = new Date('2024-01-05'); // Friday
      const endDate = new Date('2024-01-08');   // Monday
      
      const result = service.calculateWorkingDays(startDate, endDate);
      
      expect(result).toBe(2); // Friday + Monday (skip weekend)
    });
  });
});
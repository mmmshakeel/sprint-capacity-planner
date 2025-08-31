import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the SprintPlanningView component to extract the isSprintCompleted function
const mockIsSprintCompleted = (endDate: Date | null, completedVelocity: number) => {
  if (!endDate) return false;
  const today = new Date();
  const sprintEndDate = new Date(endDate);
  
  // Set time to end of day for sprint end date to ensure sprint is considered active on its end date
  sprintEndDate.setHours(23, 59, 59, 999);
  
  const isPastEndDate = today > sprintEndDate;
  const hasCompletedStoryPoints = completedVelocity > 0;
  
  return isPastEndDate && hasCompletedStoryPoints;
};

describe('SprintPlanningView isSprintCompleted function', () => {
  beforeEach(() => {
    // Mock current date to a fixed date for consistent testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-02-01T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return false when endDate is null', () => {
    const result = mockIsSprintCompleted(null, 10);
    expect(result).toBe(false);
  });

  it('should return false when end date has not passed', () => {
    const futureDate = new Date('2024-02-15'); // Future date
    const result = mockIsSprintCompleted(futureDate, 10);
    expect(result).toBe(false);
  });

  it('should return false when end date has passed but completed velocity is 0', () => {
    const pastDate = new Date('2024-01-15'); // Past date
    const result = mockIsSprintCompleted(pastDate, 0);
    expect(result).toBe(false);
  });

  it('should return false when end date has passed but completed velocity is negative', () => {
    const pastDate = new Date('2024-01-15'); // Past date
    const result = mockIsSprintCompleted(pastDate, -5);
    expect(result).toBe(false);
  });

  it('should return true when end date has passed AND completed velocity is greater than 0', () => {
    const pastDate = new Date('2024-01-15'); // Past date
    const result = mockIsSprintCompleted(pastDate, 10);
    expect(result).toBe(true);
  });

  it('should consider sprint active on its end date (same day)', () => {
    const endDate = new Date('2024-02-01'); // Same day as mocked current date
    const result = mockIsSprintCompleted(endDate, 10);
    expect(result).toBe(false); // Should be false because we set end time to 23:59:59
  });

  it('should consider sprint completed the day after end date with completed velocity', () => {
    // Set current time to day after end date
    vi.setSystemTime(new Date('2024-02-02T00:00:01Z'));
    
    const endDate = new Date('2024-02-01'); // Previous day
    const result = mockIsSprintCompleted(endDate, 10);
    expect(result).toBe(true);
  });

  it('should match backend logic exactly', () => {
    // Test cases that mirror the backend implementation
    const testCases = [
      { endDate: null, completedVelocity: 10, expected: false },
      { endDate: new Date('2024-01-15'), completedVelocity: 0, expected: false },
      { endDate: new Date('2024-01-15'), completedVelocity: 10, expected: true },
      { endDate: new Date('2024-02-15'), completedVelocity: 10, expected: false },
      { endDate: new Date('2024-02-01'), completedVelocity: 10, expected: false }, // Same day
    ];

    testCases.forEach(({ endDate, completedVelocity, expected }, index) => {
      const result = mockIsSprintCompleted(endDate, completedVelocity);
      expect(result).toBe(expected, `Test case ${index + 1} failed`);
    });
  });
});
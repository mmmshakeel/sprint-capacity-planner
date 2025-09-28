import { BooleanTransformer, booleanTransformer } from '../boolean.transformer';

describe('BooleanTransformer', () => {
  let transformer: BooleanTransformer;

  beforeEach(() => {
    transformer = new BooleanTransformer();
  });

  describe('to() method - JavaScript to Database conversion', () => {
    it('should convert true to 1', () => {
      expect(transformer.to(true)).toBe(1);
    });

    it('should convert false to 0', () => {
      expect(transformer.to(false)).toBe(0);
    });

    it('should convert null to null', () => {
      expect(transformer.to(null)).toBe(null);
    });

    it('should convert undefined to null', () => {
      expect(transformer.to(undefined)).toBe(null);
    });

    it('should handle truthy values as true', () => {
      // TypeScript should prevent this, but testing runtime behavior
      expect(transformer.to(1 as any)).toBe(1);
      expect(transformer.to('true' as any)).toBe(1);
      expect(transformer.to({} as any)).toBe(1);
      expect(transformer.to([] as any)).toBe(1);
    });

    it('should handle falsy values as false', () => {
      // TypeScript should prevent this, but testing runtime behavior
      expect(transformer.to(0 as any)).toBe(0);
      expect(transformer.to('' as any)).toBe(0);
      expect(transformer.to(NaN as any)).toBe(0);
    });
  });

  describe('from() method - Database to JavaScript conversion', () => {
    it('should convert 1 to true', () => {
      expect(transformer.from(1)).toBe(true);
    });

    it('should convert 0 to false', () => {
      expect(transformer.from(0)).toBe(false);
    });

    it('should convert null to null', () => {
      expect(transformer.from(null)).toBe(null);
    });

    it('should convert undefined to null', () => {
      expect(transformer.from(undefined)).toBe(null);
    });

    it('should handle boolean true as true', () => {
      expect(transformer.from(true)).toBe(true);
    });

    it('should handle boolean false as false', () => {
      expect(transformer.from(false)).toBe(false);
    });

    it('should only convert 1 to true (strict database boolean handling)', () => {
      expect(transformer.from(1)).toBe(true);
      expect(transformer.from(2)).toBe(false); // Only 1 is true
      expect(transformer.from(-1)).toBe(false); // Only 1 is true
      expect(transformer.from(100)).toBe(false); // Only 1 is true
      expect(transformer.from(0.1)).toBe(false); // Only 1 is true
    });

    it('should convert zero to false', () => {
      expect(transformer.from(0)).toBe(false);
      expect(transformer.from(-0)).toBe(false);
    });

    it('should handle NaN as false (strict 1/0 handling)', () => {
      expect(transformer.from(NaN)).toBe(false);
    });
  });

  describe('round-trip conversion', () => {
    it('should maintain true through round-trip conversion', () => {
      const original = true;
      const toDb = transformer.to(original);
      const fromDb = transformer.from(toDb);
      expect(fromDb).toBe(original);
    });

    it('should maintain false through round-trip conversion', () => {
      const original = false;
      const toDb = transformer.to(original);
      const fromDb = transformer.from(toDb);
      expect(fromDb).toBe(original);
    });

    it('should maintain null through round-trip conversion', () => {
      const original = null;
      const toDb = transformer.to(original);
      const fromDb = transformer.from(toDb);
      expect(fromDb).toBe(original);
    });

    it('should convert undefined to null and maintain it', () => {
      const original = undefined;
      const toDb = transformer.to(original);
      const fromDb = transformer.from(toDb);
      expect(toDb).toBe(null);
      expect(fromDb).toBe(null);
    });
  });

  describe('database-specific scenarios', () => {
    describe('PostgreSQL scenarios', () => {
      it('should handle SMALLINT values correctly', () => {
        // PostgreSQL SMALLINT columns return numbers
        expect(transformer.from(1)).toBe(true);
        expect(transformer.from(0)).toBe(false);
      });

      it('should prepare values for SMALLINT storage', () => {
        // PostgreSQL SMALLINT expects numeric values
        expect(transformer.to(true)).toBe(1);
        expect(transformer.to(false)).toBe(0);
      });
    });

    describe('MySQL scenarios', () => {
      it('should handle TINYINT(1) values correctly', () => {
        // MySQL TINYINT(1) can return numbers or booleans
        expect(transformer.from(1)).toBe(true);
        expect(transformer.from(0)).toBe(false);
        expect(transformer.from(true)).toBe(true);
        expect(transformer.from(false)).toBe(false);
      });
    });

    describe('SQLite scenarios', () => {
      it('should handle INTEGER values correctly', () => {
        // SQLite INTEGER columns return numbers
        expect(transformer.from(1)).toBe(true);
        expect(transformer.from(0)).toBe(false);
      });

      it('should handle SQLite flexible typing', () => {
        // SQLite might return various types due to flexible typing
        expect(transformer.from(true)).toBe(true);
        expect(transformer.from(false)).toBe(false);
        expect(transformer.from(1)).toBe(true);
        expect(transformer.from(0)).toBe(false);
      });
    });
  });

  describe('singleton instance', () => {
    it('should provide a singleton instance', () => {
      expect(booleanTransformer).toBeInstanceOf(BooleanTransformer);
    });

    it('should return the same instance on multiple imports', () => {
      const instance1 = booleanTransformer;
      const instance2 = booleanTransformer;
      expect(instance1).toBe(instance2);
    });

    it('should work the same as a new instance', () => {
      const newInstance = new BooleanTransformer();
      
      expect(booleanTransformer.to(true)).toBe(newInstance.to(true));
      expect(booleanTransformer.to(false)).toBe(newInstance.to(false));
      expect(booleanTransformer.from(1)).toBe(newInstance.from(1));
      expect(booleanTransformer.from(0)).toBe(newInstance.from(0));
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle string representations with strict 1/0 logic in from()', () => {
      // These shouldn't happen in normal TypeORM usage, but testing robustness
      expect(transformer.from('1' as any)).toBe(false); // String '1' is not numeric 1
      expect(transformer.from('0' as any)).toBe(false); // String '0' is not numeric 0
      expect(transformer.from('true' as any)).toBe(false); // String 'true' is not numeric 1
      expect(transformer.from('false' as any)).toBe(false); // String 'false' is not numeric 1
    });

    it('should handle object values gracefully', () => {
      // These shouldn't happen in normal usage, but testing robustness
      expect(transformer.to({} as any)).toBe(1); // Objects are truthy
      expect(transformer.from({} as any)).toBe(false); // Objects are not numeric 1
    });

    it('should handle array values gracefully', () => {
      expect(transformer.to([] as any)).toBe(1); // Empty arrays are truthy
      expect(transformer.from([] as any)).toBe(false); // Arrays are not numeric 1
    });
  });
});
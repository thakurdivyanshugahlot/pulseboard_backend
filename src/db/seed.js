/**
 * Seed database with sample data (optional)
 */

export async function seedDatabase(db) {
  try {
    console.log('Seeding database with sample data...');

    // Optional: Add sample data here
    
    console.log('✓ Database seeded successfully');
  } catch (error) {
    console.error('✗ Seed error:', error.message);
    throw error;
  }
}

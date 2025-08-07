import { createDb, users } from './src/lib/db';
import bcrypt from 'bcryptjs';

const createAdminUser = async () => {
  try {
    // Use the same database as drizzle config
    process.env.DATABASE_URL = 'file:./sqlite.db';
    const db = createDb();
    
    const adminEmail = 'admin@moetv.com';
    const adminUsername = 'admin';
    const adminPassword = 'admin123';
    
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    await db.insert(users).values({
      email: adminEmail,
      username: adminUsername,
      password: hashedPassword,
      isAdmin: true,
    });
    
    console.log('Admin user created successfully!');
    console.log('Email:', adminEmail);
    console.log('Username:', adminUsername);
    console.log('Password:', adminPassword);
    console.log('Please change the password after first login.');
  } catch (error) {
    console.error('Failed to create admin user:', error);
  }
};

createAdminUser();
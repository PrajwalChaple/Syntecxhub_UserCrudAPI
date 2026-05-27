const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const User = require('../models/User');

jest.setTimeout(120000); // 120 seconds timeout for memory DB download/boot

let mongoServer;

beforeAll(async () => {
  // Set up in-memory MongoDB Server
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  // Clean up and disconnect
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear the database before each test
  await User.deleteMany({});
});

describe('User CRUD API Integration Tests', () => {
  const validUser = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    age: 28,
    role: 'user',
  };

  describe('POST /api/users - Create User', () => {
    it('should create a new user and return 201', async () => {
      const res = await request(app)
        .post('/api/users')
        .send(validUser);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(validUser.name);
      expect(res.body.data.email).toBe(validUser.email);
      expect(res.body.data.age).toBe(validUser.age);
      expect(res.body.data.role).toBe(validUser.role);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('createdAt');
    });

    it('should fail with 400 if name is missing', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({ email: 'no.name@example.com', age: 30 });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Validation failed');
      expect(res.body.errors.name).toBe('Name is required');
    });

    it('should fail with 400 if name is too short', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({ name: 'J', email: 'j@example.com' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.name).toBe('Name must be at least 2 characters long');
    });

    it('should fail with 400 if email is missing', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({ name: 'No Email User', age: 25 });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.email).toBe('Email is required');
    });

    it('should fail with 400 if email has invalid format', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({ name: 'Jane Doe', email: 'invalidemail' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.email).toBe('Please enter a valid email address');
    });

    it('should fail with 400 if age is negative', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({ name: 'Young Boy', email: 'young@example.com', age: -5 });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.age).toBe('Age cannot be negative');
    });

    it('should fail with 400 if age is not an integer', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({ name: 'Float Age', email: 'float@example.com', age: 23.5 });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.age).toBe('Age must be an integer');
    });

    it('should fail with 400 if role is invalid', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({ name: 'Super User', email: 'super@example.com', role: 'super' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.role).toBe("Role must be either 'user' or 'admin'");
    });

    it('should fail with 409 if email is duplicate', async () => {
      // First user creation
      await User.create(validUser);

      // Second user with same email
      const res = await request(app)
        .post('/api/users')
        .send({
          name: 'Another Name',
          email: 'john.doe@example.com', // Duplicate
        });

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Duplicate value entered for field(s): email');
    });
  });

  describe('GET /api/users - Get All Users', () => {
    it('should get all users in database', async () => {
      await User.create({ name: 'User 1', email: 'user1@example.com' });
      await User.create({ name: 'User 2', email: 'user2@example.com' });

      const res = await request(app).get('/api/users');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.data.length).toBe(2);
      expect(res.body.data[0].name).toBe('User 2'); // Sorted by latest
      expect(res.body.data[1].name).toBe('User 1');
    });

    it('should return empty list when no users exist', async () => {
      const res = await request(app).get('/api/users');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(0);
      expect(res.body.data).toEqual([]);
    });
  });

  describe('GET /api/users/:id - Get User By ID', () => {
    it('should return the user if found', async () => {
      const user = await User.create(validUser);

      const res = await request(app).get(`/api/users/${user._id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(validUser.name);
      expect(res.body.data.email).toBe(validUser.email);
    });

    it('should return 404 if user not found', async () => {
      const unusedId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/users/${unusedId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('User not found');
    });

    it('should return 400 if ID format is invalid', async () => {
      const res = await request(app).get('/api/users/invalid-id-format');

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Invalid resource ID format');
    });
  });

  describe('PUT /api/users/:id - Update User', () => {
    it('should update a user and return 200', async () => {
      const user = await User.create(validUser);
      const updates = { name: 'John Updated', age: 35 };

      const res = await request(app)
        .put(`/api/users/${user._id}`)
        .send(updates);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(updates.name);
      expect(res.body.data.age).toBe(updates.age);
      expect(res.body.data.email).toBe(user.email); // Unchanged field remains
    });

    it('should run validators when updating user', async () => {
      const user = await User.create(validUser);
      const updates = { email: 'invalid-email-format' };

      const res = await request(app)
        .put(`/api/users/${user._id}`)
        .send(updates);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.email).toBe('Please enter a valid email address');
    });

    it('should return 404 if user not found', async () => {
      const unusedId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/users/${unusedId}`)
        .send({ name: 'NotFound' });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/users/:id - Delete User', () => {
    it('should delete user and return 200', async () => {
      const user = await User.create(validUser);

      const res = await request(app).delete(`/api/users/${user._id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('User deleted successfully');

      // Verify deletion in database
      const userInDb = await User.findById(user._id);
      expect(userInDb).toBeNull();
    });

    it('should return 404 if user not found', async () => {
      const unusedId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/api/users/${unusedId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});

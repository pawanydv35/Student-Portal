const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');

describe('User Management', () => {
  let adminToken, facultyToken, studentToken;
  let adminUser, facultyUser, studentUser;

  beforeEach(async () => {
    await User.deleteMany({});

    // Create test users
    const adminData = {
      email: 'admin@university.edu',
      password: 'AdminPass123',
      role: 'admin',
      profile: {
        firstName: 'Admin',
        lastName: 'User',
        department: 'Administration',
        employeeId: 'ADM001'
      }
    };

    const facultyData = {
      email: 'faculty@university.edu',
      password: 'FacultyPass123',
      role: 'faculty',
      profile: {
        firstName: 'Faculty',
        lastName: 'Member',
        department: 'Computer Science',
        employeeId: 'FAC001'
      }
    };

    const studentData = {
      email: 'student@university.edu',
      password: 'StudentPass123',
      role: 'student',
      profile: {
        firstName: 'Student',
        lastName: 'User',
        department: 'Computer Science',
        studentId: 'CS2024001'
      }
    };

    // Register users and get tokens
    const adminResponse = await request(app)
      .post('/api/auth/register')
      .send(adminData);
    adminToken = adminResponse.body.data.accessToken;
    adminUser = adminResponse.body.data.user;

    const facultyResponse = await request(app)
      .post('/api/auth/register')
      .send(facultyData);
    facultyToken = facultyResponse.body.data.accessToken;
    facultyUser = facultyResponse.body.data.user;

    const studentResponse = await request(app)
      .post('/api/auth/register')
      .send(studentData);
    studentToken = studentResponse.body.data.accessToken;
    studentUser = studentResponse.body.data.user;
  });



  describe('GET /api/users/profile', () => {
    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('student@university.edu');
      expect(response.body.data.user.role).toBe('student');
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should not get profile without token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NO_TOKEN');
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update user profile successfully', async () => {
      const updateData = {
        profile: {
          firstName: 'Updated',
          lastName: 'Name',
          department: 'Updated Department'
        }
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.profile.firstName).toBe('Updated');
      expect(response.body.data.user.profile.lastName).toBe('Name');
      expect(response.body.data.user.profile.department).toBe('Updated Department');
    });

    it('should validate profile data', async () => {
      const invalidData = {
        profile: {
          firstName: 'A', // Too short
          lastName: '',   // Empty
        }
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should allow student to update studentId', async () => {
      const updateData = {
        profile: {
          studentId: 'CS2024999'
        }
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.profile.studentId).toBe('CS2024999');
    });

    it('should allow faculty to update employeeId', async () => {
      const updateData = {
        profile: {
          employeeId: 'FAC999'
        }
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.profile.employeeId).toBe('FAC999');
    });
  });

  describe('PUT /api/users/change-password', () => {
    it('should change password successfully', async () => {
      const passwordData = {
        currentPassword: 'StudentPass123',
        newPassword: 'NewPassword123'
      };

      const response = await request(app)
        .put('/api/users/change-password')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(passwordData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Password changed successfully');

      // Verify new password works
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'student@university.edu',
          password: 'NewPassword123'
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
    });

    it('should not change password with wrong current password', async () => {
      const passwordData = {
        currentPassword: 'WrongPassword',
        newPassword: 'NewPassword123'
      };

      const response = await request(app)
        .put('/api/users/change-password')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(passwordData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CURRENT_PASSWORD');
    });

    it('should validate new password strength', async () => {
      const passwordData = {
        currentPassword: 'StudentPass123',
        newPassword: 'weak'
      };

      const response = await request(app)
        .put('/api/users/change-password')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(passwordData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/users/courses', () => {
    it('should get user enrolled courses', async () => {
      const response = await request(app)
        .get('/api/users/courses')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.courses).toBeDefined();
      expect(Array.isArray(response.body.data.courses)).toBe(true);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/users/courses')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NO_TOKEN');
    });
  });

  describe('Admin User Management', () => {
    describe('GET /api/users', () => {
      it('should get all users for admin', async () => {
        const response = await request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.users).toBeDefined();
        expect(response.body.data.users.length).toBe(3); // admin, faculty, student
        expect(response.body.data.pagination).toBeDefined();
      });

      it('should filter users by role', async () => {
        const response = await request(app)
          .get('/api/users?role=student')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.users.length).toBe(1);
        expect(response.body.data.users[0].role).toBe('student');
      });

      it('should search users', async () => {
        const response = await request(app)
          .get('/api/users?search=student')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.users.length).toBeGreaterThan(0);
      });

      it('should paginate results', async () => {
        const response = await request(app)
          .get('/api/users?page=1&limit=2')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.users.length).toBeLessThanOrEqual(2);
        expect(response.body.data.pagination.page).toBe(1);
        expect(response.body.data.pagination.limit).toBe(2);
      });

      it('should deny access to non-admin users', async () => {
        const response = await request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${studentToken}`)
          .expect(403);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
      });
    });

    describe('POST /api/users', () => {
      it('should create new user as admin', async () => {
        const newUserData = {
          email: 'newuser@university.edu',
          password: 'NewUserPass123',
          role: 'student',
          profile: {
            firstName: 'New',
            lastName: 'User',
            department: 'Mathematics',
            studentId: 'MATH2024001'
          }
        };

        const response = await request(app)
          .post('/api/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(newUserData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.user.email).toBe(newUserData.email);
        expect(response.body.data.user.role).toBe(newUserData.role);
        expect(response.body.data.user.password).toBeUndefined();
      });

      it('should validate user data', async () => {
        const invalidData = {
          email: 'invalid-email',
          password: '123',
          role: 'invalid-role'
        };

        const response = await request(app)
          .post('/api/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(invalidData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('should not create duplicate user', async () => {
        const duplicateData = {
          email: 'student@university.edu', // Already exists
          password: 'Password123',
          role: 'student',
          profile: {
            firstName: 'Duplicate',
            lastName: 'User',
            department: 'Computer Science',
            studentId: 'CS2024002'
          }
        };

        const response = await request(app)
          .post('/api/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(duplicateData)
          .expect(409);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('USER_EXISTS');
      });

      it('should deny access to non-admin users', async () => {
        const newUserData = {
          email: 'newuser@university.edu',
          password: 'NewUserPass123',
          role: 'student',
          profile: {
            firstName: 'New',
            lastName: 'User',
            department: 'Mathematics',
            studentId: 'MATH2024001'
          }
        };

        const response = await request(app)
          .post('/api/users')
          .set('Authorization', `Bearer ${facultyToken}`)
          .send(newUserData)
          .expect(403);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
      });
    });

    describe('PUT /api/users/:userId', () => {
      it('should update user as admin', async () => {
        const updateData = {
          role: 'faculty',
          profile: {
            firstName: 'Updated',
            lastName: 'Student',
            employeeId: 'FAC002'
          },
          isActive: true
        };

        const response = await request(app)
          .put(`/api/users/${studentUser._id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.user.role).toBe('faculty');
        expect(response.body.data.user.profile.firstName).toBe('Updated');
        expect(response.body.data.user.profile.employeeId).toBe('FAC002');
      });

      it('should validate user ID', async () => {
        const response = await request(app)
          .put('/api/users/invalid-id')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ role: 'faculty' })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('should handle non-existent user', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        const response = await request(app)
          .put(`/api/users/${nonExistentId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ role: 'faculty' })
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('USER_NOT_FOUND');
      });

      it('should deny access to non-admin users', async () => {
        const response = await request(app)
          .put(`/api/users/${studentUser._id}`)
          .set('Authorization', `Bearer ${facultyToken}`)
          .send({ role: 'faculty' })
          .expect(403);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
      });
    });

    describe('DELETE /api/users/:userId', () => {
      it('should delete user as admin', async () => {
        const response = await request(app)
          .delete(`/api/users/${studentUser._id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('User deleted successfully');

        // Verify user is deleted
        const deletedUser = await User.findById(studentUser._id);
        expect(deletedUser).toBeNull();
      });

      it('should not allow admin to delete themselves', async () => {
        const response = await request(app)
          .delete(`/api/users/${adminUser._id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('CANNOT_DELETE_SELF');
      });

      it('should handle non-existent user', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        const response = await request(app)
          .delete(`/api/users/${nonExistentId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('USER_NOT_FOUND');
      });

      it('should validate user ID', async () => {
        const response = await request(app)
          .delete('/api/users/invalid-id')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('should deny access to non-admin users', async () => {
        const response = await request(app)
          .delete(`/api/users/${studentUser._id}`)
          .set('Authorization', `Bearer ${facultyToken}`)
          .expect(403);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
      });
    });
  });

  describe('Role-based Access Control', () => {
    it('should allow admin to access all user endpoints', async () => {
      // Test admin can access user list
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should deny faculty access to admin endpoints', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${facultyToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
    });

    it('should deny student access to admin endpoints', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
    });

    it('should allow all authenticated users to access their own profile', async () => {
      // Test student can access profile
      const studentResponse = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(studentResponse.body.success).toBe(true);

      // Test faculty can access profile
      const facultyResponse = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${facultyToken}`)
        .expect(200);

      expect(facultyResponse.body.success).toBe(true);

      // Test admin can access profile
      const adminResponse = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(adminResponse.body.success).toBe(true);
    });
  });
});
// src/users/users.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { MySQLService } from '../mysql/mysql.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  
  constructor(private readonly mySqlService: MySQLService) { }

  // Create a new user
  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    // Check if user with same email exists
    const existingUser = await this.mySqlService.query(
      'SELECT * FROM users WHERE email = ?',
      [createUserDto.email]
    );

    if (existingUser.length > 0) {
      throw new ConflictException('email already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    // Create user in database
    const result = await this.mySqlService.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, phone) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        createUserDto.first_name,
        createUserDto.last_name,
        createUserDto.email,
        hashedPassword,
        createUserDto.phone,
      ]
    );

    // Return user object excluding the password
    const newUser = {
      id: result.insertId,
      email: createUserDto.email,
      firstName: createUserDto.first_name,
      lastName: createUserDto.last_name,
      createdAt: null,    // createdAt is not available at creation
      updatedAt: null     // updatedAt is not available at creation
    };

    return newUser;
  }

  // get all users 
  async findAll(search: string, page: number, limit: number): Promise<any> {
    const offset = (page - 1) * limit;

    // First, get the total count of users matching the search
    const countQuery = `
    SELECT COUNT(*) as totalCount
    FROM users
    WHERE email LIKE ? OR first_name LIKE ? OR last_name LIKE ?
  `;
    const totalCountResult = await this.mySqlService.query(countQuery, [
      `%${search}%`,
      `%${search}%`,
      `%${search}%`,
    ]);

    const totalCount = totalCountResult[0]?.totalCount || 0;
    const totalPages = Math.ceil(totalCount / limit); // Calculate the total number of pages

    // Now, fetch the users with pagination
    const query = `
    SELECT user_id as id, email, first_name as firstName, last_name as lastName, 
           role_id, created_at as createdAt, updated_at as updatedAt
    FROM users
    WHERE email LIKE ? OR first_name LIKE ? OR last_name LIKE ?
    LIMIT ? OFFSET ?
  `;

    const users = await this.mySqlService.query(query, [
      `%${search}%`,
      `%${search}%`,
      `%${search}%`,
      limit,
      offset,
    ]);

    if (users.length === 0) {
      throw new NotFoundException('No users found');
    }

    // Return the result with pagination info
    return {
      currentPage: page,
      totalPages: totalPages,
      users: users.map((user: any) => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role_id: user.role_id,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
    };
  }

  // Find a user by ID
  async findOne(id: number): Promise<Omit<User, 'password'>> {
    const users = await this.mySqlService.query(
      'SELECT user_id as id, email, first_name as firstName, last_name as lastName, role_id, created_at as createdAt, updated_at as updatedAt FROM users WHERE user_id = ?',
      [id]
    );

    if (users.length === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return users[0]
  }

  // Find a user by username
  async findByEmail(email: string): Promise<User & {role_id: number}> {
    const users = await this.mySqlService.query(
      'SELECT *, password_hash as password, user_id as id FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    if (users.length === 0) {
      throw new NotFoundException(`User with username ${email} not found`);
    }

    return users[0];
  }

  //find user permissions
  async findOneWithPermissions(userId: number): Promise<User & { permissions: string[] }> {
    // 1. Get the user
    const users = await this.mySqlService.query(
      `SELECT user_id as id, email, first_name as firstName, last_name as lastName, created_at as createdAt, updated_at as updatedAt, role_id 
     FROM users 
     WHERE user_id = ?`,
      [userId]
    );

    if (users.length === 0) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const user = users[0];

    // 2. Get the user's permissions via their role
    const permissions = await this.mySqlService.query(
      `SELECT p.title 
     FROM permissions p
     JOIN role_permissions rp ON rp.permission_id = p.permission_id
     WHERE rp.role_id = ? AND rp.status = 1`,
      [user.role_id]
    );

    // 3. Flatten permissions into a string array
    const permissionList = permissions.map((p: any) => p.title);

    return {
      ...user,
      permissions: permissionList
    };
  }

  // Update user information
  async update(id: number, updateUserDto: UpdateUserDto): Promise<Omit<User, 'password'>> {
    const user = await this.findOne(id);

    let query = 'UPDATE users SET ';
    const params: Array<any> = [];  // Explicitly type params to avoid TypeScript errors
    const updates: string[] = [];

    if (updateUserDto.email) {
      // Check if email already exists
      const existingUserWithEmail = await this.mySqlService.query(
        'SELECT * FROM users WHERE email = ? AND user_id != ?',
        [updateUserDto.email, id]
      );

      if (existingUserWithEmail.length > 0) {
        throw new ConflictException('Email already in use');
      }

      updates.push('email = ?');
      params.push(updateUserDto.email);
    }

    if (updateUserDto.first_name) {
      updates.push('first_name = ?');
      params.push(updateUserDto.first_name);
    }

    if (updateUserDto.last_name) {
      updates.push('last_name = ?');
      params.push(updateUserDto.last_name);
    }

    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(updateUserDto.password, salt);
      updates.push('password_hash = ?');
      params.push(hashedPassword);
    }

    if (updates.length === 0) {
      return user;
    }

    query += updates.join(', ');
    query += ' WHERE user_id = ?';
    params.push(id);

    await this.mySqlService.query(query, params);

    return this.findOne(id);
  }

  // Delete a user by ID
  async remove(id: number): Promise<void> {
    const result = await this.mySqlService.query(
      'DELETE FROM users WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}

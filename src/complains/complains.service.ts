// src/complains/complains.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { MySQLService } from '../mysql/mysql.service';
import { CreateComplainDto } from './dto/create-complain.dto';
import { UpdateComplainDto } from './dto/update-complain.dto';
import { activityComplainDto } from './dto/activity-complain.dto';

@Injectable()
export class ComplainsService {
  
  constructor(private readonly mySqlService: MySQLService) {}

  // Create a new complain
  async create(createComplainDto: CreateComplainDto , id : number): Promise<any> {
    console.log('user_id', id);
    const result = await this.mySqlService.query(
      `INSERT INTO complains (user_id, category_id, subject, description, priority) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        id,
        createComplainDto.category_id,
        createComplainDto.subject,
        createComplainDto.description,
        createComplainDto.priority
      ]
    );

    return {
      complain_id: result.insertId,
      ...createComplainDto,
    };
  }

  // Get all complains with pagination
// Get all complains with pagination
async findAll(search: string, page: number, limit: number, user_id?: number): Promise<any> {
  const offset = (page - 1) * limit;

  // Use '%' for no filter on text fields (subject, description, priority)
  const searchTerm = search ? `%${search}%` : '%';

  // Initialize query parameters for count query
  let countQuery = `
    SELECT COUNT(*) as totalCount
    FROM complains
    WHERE (subject LIKE ? OR description LIKE ? OR priority LIKE ?)
  `;
  const countParams = [searchTerm, searchTerm, searchTerm];

  if (user_id !== undefined) {
    // Convert user_id to string and apply LIKE if necessary
    const userIdString = user_id.toString();
    countQuery += ' AND user_id LIKE ?';  // You can use LIKE here for string comparison
    countParams.push(`%${userIdString}%`);  // Using % for partial matching in LIKE
  }

  const totalCountResult = await this.mySqlService.query(countQuery, countParams);
  const totalCount = totalCountResult[0]?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / limit); // Calculate the total number of pages

  // Initialize query parameters for main query
  let query = `
    SELECT complain_id as id, user_id, category_id, subject, description, priority, created_at
    FROM complains
    WHERE (subject LIKE ? OR description LIKE ? OR priority LIKE ?)
  `;
  const queryParams = [searchTerm, searchTerm, searchTerm];

  if (user_id !== undefined) {
    const userIdString = user_id.toString();
    query += ' AND user_id LIKE ?';  
    queryParams.push(`%${userIdString}%`);
  }

  // Add pagination to the query
  query += ' LIMIT ? OFFSET ?';
  queryParams.push(limit.toString(), offset.toString());

  const complains = await this.mySqlService.query(query, queryParams);

  if (complains.length === 0) {
    throw new NotFoundException('No complains found');
  }

  return {
    currentPage: page,
    totalPages: totalPages,
    complains,
  };
}


  // Get a complain by ID
  async findOne(id: number): Promise<any> {
    const complains = await this.mySqlService.query(
      'SELECT c.* , u.first_name, u.last_name, ctr.title as category FROM complains c JOIN users u ON u.user_id = c.user_id JOIN categories ctr ON ctr.category_id = c.category_id WHERE complain_id = ?',
      [id]
    );

    
    if (complains.length === 0) {
      throw new NotFoundException(`Complain with ID ${id} not found`);
    }

    const activities = await this.mySqlService.query(
      'SELECT * FROM activities WHERE complain_id = ?',
      [id]
    );

    const complain = complains[0];
    complain.activities = activities;
    return complain;
  }

  // Update a complain
  async update(id: number, updateComplainDto: UpdateComplainDto): Promise<any> {
    const complain = await this.findOne(id);

    let query = 'UPDATE complains SET ';
    const params: Array<any> = [];
    const updates: string[] = [];

    if (updateComplainDto.user_id) {
      updates.push('user_id = ?');
      params.push(updateComplainDto.user_id);
    }

    if (updateComplainDto.category_id) {
      updates.push('category_id = ?');
      params.push(updateComplainDto.category_id);
    }

    if (updateComplainDto.subject) {
      updates.push('subject = ?');
      params.push(updateComplainDto.subject);
    }

    if (updateComplainDto.description) {
      updates.push('description = ?');
      params.push(updateComplainDto.description);
    }

    if (updateComplainDto.priority) {
      updates.push('priority = ?');
      params.push(updateComplainDto.priority);
    }

    if (updates.length === 0) {
      return complain;
    }

    query += updates.join(', ');
    query += ' WHERE complain_id = ?';
    params.push(id);

    await this.mySqlService.query(query, params);

    return this.findOne(id);
  }

  // Delete a complain
  async remove(id: number): Promise<void> {
    const result = await this.mySqlService.query(
      'DELETE FROM complains WHERE complain_id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException(`Complain with ID ${id} not found`);
    }
  }

  // ===========================================================
  // secondary methods
  // ===========================================================

  // create activity on complain
  async createActivity(id: number, complain_id: number, activityComplainDto: activityComplainDto): Promise<any> {
    const complain = await this.findOne(complain_id);

    if (!complain) {
      throw new NotFoundException(`Complain with ID ${complain_id} not found`);
    }

    const isAuthorized = await this.mySqlService.query(
      'SELECT * FROM category_incharge ci JOIN users u ON u.role_id = ci.role_id WHERE u.user_id = ? AND ci.category_id = ?',
      [id, complain.category_id]
    );
    if (isAuthorized.length === 0) {
      throw new ConflictException(`You are not authorized to create activity for this complain`);
    }
        
    const result = await this.mySqlService.query(
      `INSERT INTO activities (user_id, complain_id, description, status) 
       VALUES (?, ?, ?, ?)`,
      [
        id,
        complain_id,
        activityComplainDto.description,
        activityComplainDto.status
      ]
    );

    return {
      activity_id: result.insertId,
      ...activityComplainDto,
    };
  }

}

// src/categories/categories.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { MySQLService } from '../mysql/mysql.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {

  constructor(private readonly mySqlService: MySQLService) { }

  // Create a new category
  async create(createCategoryDto: CreateCategoryDto): Promise<any> {
    const result = await this.mySqlService.query(
      `INSERT INTO categories (title) VALUES ( ?)`,
      [
        createCategoryDto.title,
      ]
    );

    return {
      id: result.insertId,
      title: createCategoryDto.title,
    };
  }

  // Get all categories with pagination
  async findAll(search: string, page: number, limit: number): Promise<any> {
    const offset = (page - 1) * limit;

    console.log(search, page, limit, offset);

    const searchTerm = search ? `%${search}%` : '%'; // Use '%' for no filter

    const countQuery = `
    SELECT COUNT(*) as totalCount
    FROM categories
    WHERE title LIKE ?
  `;
    const totalCountResult = await this.mySqlService.query(countQuery, [searchTerm]);

    const totalCount = totalCountResult[0]?.totalCount || 0;
    const totalPages = Math.ceil(totalCount / limit); // Calculate the total number of pages

    // Main query to fetch categories (only searching by title now)
    const query = `
    SELECT category_id as id, title
    FROM categories
    WHERE title LIKE ?
    LIMIT ? OFFSET ?
  `;
    console.log("searchTerm" + searchTerm)
    const categories = await this.mySqlService.query(query, [
      searchTerm,
      limit,
      offset,
    ]);

    console.log(categories);

    if (categories.length === 0) {
      throw new NotFoundException('No categories found');
    }

    return {
      currentPage: page,
      totalPages: totalPages,
      categories,
    };
  }


  // Get category by ID
  async findOne(id: number): Promise<any> {
    const categories = await this.mySqlService.query(
      'SELECT category_id as id, faculty_id, title FROM categories WHERE category_id = ?',
      [id]
    );

    if (categories.length === 0) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return categories[0];
  }

  // Update a category
  async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<any> {
    const category = await this.findOne(id);

    let query = 'UPDATE categories SET ';
    const params: Array<any> = [];
    const updates: string[] = [];

    if (updateCategoryDto.faculty_id) {
      updates.push('faculty_id = ?');
      params.push(updateCategoryDto.faculty_id);
    }

    if (updateCategoryDto.title) {
      updates.push('title = ?');
      params.push(updateCategoryDto.title);
    }

    if (updates.length === 0) {
      return category;
    }

    query += updates.join(', ');
    query += ' WHERE category_id = ?';
    params.push(id);

    await this.mySqlService.query(query, params);

    return this.findOne(id);
  }

  // Delete a category
  async remove(id: number): Promise<void> {
    const result = await this.mySqlService.query(
      'DELETE FROM categories WHERE category_id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
  }

  // ======================================================
  // secondary methods
  // ======================================================

  // asign category in charge :: TODO
  async asign(id: number, updateCategoryDto: UpdateCategoryDto): Promise<any> {
    const category = await this.findOne(id);

    if (category.faculty_id) {
      throw new ConflictException(`Category with ID ${id} already has a faculty assigned`);
    }

    const query = 'UPDATE categories SET faculty_id = ? WHERE category_id = ?';
    await this.mySqlService.query(query, [updateCategoryDto.faculty_id, id]);

    return this.findOne(id);
  }
}

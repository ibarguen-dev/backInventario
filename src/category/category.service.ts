import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const category = this.categoryRepository.create(createCategoryDto);
      await this.categoryRepository.save(category);
      return category;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error creating category');
    }
  }

  async findAll() {
    try {
      return await this.categoryRepository.find();
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error finding categories');
    }
  }

  async findOne(id: string) {
    //console.log({ id });
    let category: Category | null = null;
    try {
      //console.log(isUUID(id));
      console.log(!id);
      if (id !== '' && isUUID(id)) {
        category = await this.categoryRepository.findOneBy({ id: String(id) });
        console.log({ category });
      }
      if (!category && !isUUID(id)) {
        category = await this.categoryRepository.findOneBy({
          name: String(id),
        });
      }
      if (!category) {
        throw new InternalServerErrorException('Category not found');
      }
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error finding category');
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    try {
      const category = await this.categoryRepository.preload({
        id: String(id),
        ...updateCategoryDto,
      });
      if (!category) {
        throw new InternalServerErrorException('Category not found');
      }
      await this.categoryRepository.save(category);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error updating category');
    }

    return `This action updates a #${id} category`;
  }

  remove(id: string) {
    return `This action removes a #${id} category`;
  }
}

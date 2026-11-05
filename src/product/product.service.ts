import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      console.log(createProductDto);
      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error creating product');
    }
  }

  async findAll() {
    try {
      const products = this.productRepository.find();
      return products;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error find all product ');
    }
  }

  async findOne(id: string | undefined) {
    try {
      const product = await this.productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.category', 'category')
        .where('product.state =:state AND product.id = :id', {
          state: true,
          id: id,
        })
        .getOne();
      return product;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('');
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      console.log(updateProductDto);
      const product = await this.productRepository.preload({
        id: id,
        ...updateProductDto,
      });
      if (!product) {
        throw new InternalServerErrorException('product not found');
      }
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error updating client');
    }
  }

  async remove(id: string) {
    await this.update(id, { state: false } as UpdateProductDto);
    return `This action removes a #${id} product`;
  }
}

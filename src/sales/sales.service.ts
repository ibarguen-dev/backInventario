import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { SaleDetail } from './entities/sales-detail.entity';
import { saleInteface } from './interfaces/sale.interface';
import { Details } from './interfaces/details.interface';
import { Product } from '../product/entities/product.entity';
import { ProductService } from '../product/product.service';
import { UpdateProductDto } from '../product/dto/update-product.dto';
import { ConvertSales } from './sales.convert.service';
import { console } from 'inspector';
import { ok } from 'assert';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private readonly salesRespository: Repository<Sale>,
    @InjectRepository(SaleDetail)
    private readonly salesDetailRespository: Repository<SaleDetail>,
    private readonly productService: ProductService,
    private readonly convert: ConvertSales,
  ) { }

  async create(createSaleDto: CreateSaleDto) {
    const saleConvert: saleInteface = this.convertSale(createSaleDto);
    try {
      const sale = this.salesRespository.create(saleConvert);
      const response = await this.salesRespository.save(sale);
      await this.createDetail(response.id, createSaleDto.details);
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async findAll() {
    let n = 1;
    try {
      const sales = await this.salesRespository
        .createQueryBuilder('sale')
        .leftJoinAndSelect('sale.user', 'user')
        .leftJoinAndSelect('sale.client', 'client')
        .leftJoinAndSelect('sale.details', 'details')
        .leftJoinAndSelect('details.product', 'product')
        .where('sale.state = :state', { state: true })
        .orderBy('sale.date', 'DESC')
        .getMany();

      return this.convert.findall(sales);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const sales = await this.salesRespository
        .createQueryBuilder('sale')
        .leftJoinAndSelect('sale.user', 'user')
        .leftJoinAndSelect('sale.client', 'client')
        .leftJoinAndSelect('sale.details', 'details')
        .where('sale.state =:state AND sale.id = :id', { state: true, id: id })
        .getMany();

      console.log(sales);

      if (!sales) throw new BadRequestException('No sales were found');

      return sales;
    } catch (error) {
      console.log(error);
    }
  }

  async update(id: string, updateSaleDto: UpdateSaleDto) {
    console.log(updateSaleDto);
    try {
      const { details, ...saleData } = updateSaleDto;
      const sale = await this.salesRespository.preload({
        id: id,
        ...saleData,
      });
      if (!sale) {
        throw new BadRequestException('sale not found');
      }

      // Guardamos los cambios principales de la venta (ej. state)
      await this.salesRespository.save(sale);

      if (details) {
        await this.updateDetail(id, details);
      }
    } catch (error) {
      console.log(error + 'jota');
      throw new InternalServerErrorException(error);
    }
    return { success: true, message: `This action updates a #${id} sale` };
  }



  convertSale(createSaleDto: CreateSaleDto) {
    const sale: saleInteface = {
      date: createSaleDto.date,
      dateUpdate: createSaleDto.dateUpdate,
      userId: createSaleDto.userId,
      clientId: createSaleDto.clientId,
      state: createSaleDto.state,
      description: createSaleDto.description,
      salesTotal: createSaleDto.salesTotal,
      profit: createSaleDto.profit,
    };
    return sale;
  }

  async createDetail(saleId: string, details: Details[]) {
    try {
      const saleDetails = details.map((detail) => {
        return this.salesDetailRespository.create({
          saleId: saleId,
          productId: detail.productId,
          quantity: detail.quantity,
          price: detail.price,
          total: detail.total,
        });
      });
      await this.salesDetailRespository.save(saleDetails);
      await this.createProductSale(details);
      return saleDetails;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error creating sale details');
    }
  }

  async updateDetail(saleId: string, details?: Details[]) {
    try {
      if (details) {
        // 1. Obtenemos los detalles anteriores ANTES de eliminarlos
        const oldDetails = await this.salesDetailRespository.find({
          where: { saleId: saleId } as any,
        });

        // 2. Sumamos el stock de los detalles anteriores (revertimos)
        await Promise.all(
          oldDetails.map(async (oldDetail) => {
            const product = await this.productService.findOne(
              oldDetail.productId,
            );
            const currentStock =
              product?.stock === undefined ? 0 : Number(product.stock);
            await this.productService.update(oldDetail.productId, {
              stock: currentStock + Number(oldDetail.quantity),
            } as UpdateProductDto);
          }),
        );

        // 3. Eliminar los detalles anteriores
        await this.salesDetailRespository.delete({ saleId: saleId } as any);

        // 4. Crear los nuevos detalles
        const saleDetails = details.map((detail) => {
          return this.salesDetailRespository.create({
            saleId: saleId,
            productId: detail.productId,
            quantity: detail.quantity,
            price: detail.price,
            total: detail.total,
          });
        });
        await this.salesDetailRespository.save(saleDetails);

        // 5. Restamos el stock de los nuevos detalles
        await this.createProductSale(details);
      }
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error updating sale details');
    }
  }
  async createProductSale(details?: Details[]) {
    try {
      if (details) {
        await Promise.all(
          details.map(async (detail) => {
            const quantity: number = detail.quantity;
            const product = await this.productService.findOne(detail.productId);
            const currentStock =
              product?.stock === undefined ? 0 : product?.stock;
            const newStock = currentStock - quantity;
            // Actualizamos el stock
            await this.productService.update(detail.productId, {
              stock: newStock,
            } as UpdateProductDto);
          }),
        );
      }
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error creating product sale');
    }
  }


  async removeFind() {
    try {
      await this.salesDetailRespository.deleteAll()
      await this.salesRespository.deleteAll();
      return { message: 'Sales removed successfully' };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error removing sales');
    }
  }
}

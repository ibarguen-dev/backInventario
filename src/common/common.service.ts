import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateCommonDto } from './dto/create-common.dto';
import { UpdateCommonDto } from './dto/update-common.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from '../category/entities/category.entity';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { Product } from '../product/entities/product.entity';
import { Client } from '../client/entities/client.entity';
import { Sale } from '../sales/entities/sale.entity';

@Injectable()
export class CommonService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Sale)
    private readonly salesRepository: Repository<Sale>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async fillDataForSales() {
    try {
      const [totalProduct, totalSales, profitData, salesTotalData] =
        await Promise.all([
          this.productRepository.count(),
          this.salesRepository.count(),
          this.salesRepository
            .createQueryBuilder('sale')
            .select('SUM(sale.profit)', 'total')
            .getRawOne(),
          this.salesRepository
            .createQueryBuilder('sale')
            .select('SUM(sale.salesTotal)', 'total')
            .getRawOne(),
        ]);

      const dashboard = {
        totalProduct,
        totalSales,
        totalProfit: Number(profitData?.total) || 0,
        totalSalesAmount: Number(salesTotalData?.total) || 0,
      };

      return dashboard;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error filling data for sales');
    }
  }

  async getDashboardByDateRange(startDate: string, endDate: string) {
    try {
      // Función robusta para incrementar un día a una fecha string
      const nextDay = (dateStr: string): string => {
        // Extraer solo YYYY-MM-DD si viene con hora
        const dateOnly = dateStr.substring(0, 10);
        const d = new Date(dateOnly + 'T00:00:00');
        if (isNaN(d.getTime())) {
          throw new Error(`Invalid date: ${dateStr}`);
        }
        d.setDate(d.getDate() + 1);
        return d.toISOString().split('T')[0];
      };

      const end = nextDay(endDate);

      const [totalProduct, totalSales, profitData, salesTotalData] =
        await Promise.all([
          this.productRepository.count(),
          this.salesRepository
            .createQueryBuilder('sale')
            .where('sale.date >= :startDate', { startDate })
            .andWhere('sale.date < :end', { end })
            .getCount(),
          this.salesRepository
            .createQueryBuilder('sale')
            .select('SUM(sale.profit)', 'total')
            .where('sale.date >= :startDate', { startDate })
            .andWhere('sale.date < :end', { end })
            .getRawOne(),
          this.salesRepository
            .createQueryBuilder('sale')
            .select('SUM(sale.salesTotal)', 'total')
            .where('sale.date >= :startDate', { startDate })
            .andWhere('sale.date < :end', { end })
            .getRawOne(),
        ]);

      const dashboard = {
        totalProduct,
        totalSales,
        totalProfit: Number(profitData?.total) || 0,
        totalSalesAmount: Number(salesTotalData?.total) || 0,
        startDate,
        endDate,
      };

      return dashboard;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        error || 'Error filling data for sales by date range',
      );
    }
  }
}

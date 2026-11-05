import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from './entities/sale.entity';
import { SaleDetail } from './entities/sales-detail.entity';
import { ProductModule } from '../product/product.module';
import { ConvertSales } from './sales.convert.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sale, SaleDetail]),
    ProductModule,
    UserModule,
  ],
  controllers: [SalesController],
  providers: [SalesService, ConvertSales],
})
export class SalesModule {}

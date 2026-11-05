import { Module } from '@nestjs/common';
import { BuyService } from './buy.service';
import { BuyController } from './buy.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Buy } from './entities/buy.entity';
import { BuyDetail } from './entities/buy-detail.entity';
import { ProductModule } from '../product/product.module';
import { UserModule } from '../user/user.module';

@Module({
  imports:[
    TypeOrmModule.forFeature([Buy,BuyDetail]),
    ProductModule,
    UserModule
  ],
  controllers: [BuyController],
  providers: [BuyService],
})
export class BuyModule {}

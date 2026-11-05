import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; 
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { ClientModule } from './client/client.module';
import { CommonModule } from './common/common.module';
import { MailModule } from './mail/mail.module';
import { ProductModule } from './product/product.module';
import { RoleModule } from './role/role.module';
import { SalesModule } from './sales/sales.module';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuyModule } from './buy/buy.module';
import { SupplierModule } from './supplier/supplier.module';
@Module({
  imports: [ConfigModule.forRoot(), 
        TypeOrmModule.forRoot({
      ssl: process.env.STAGE === 'prod',
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(`${process.env.DB_PORT}`),
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize: true,
    }),
    
    AuthModule, CategoryModule, ClientModule, CommonModule, MailModule, ProductModule, RoleModule, SalesModule, UserModule, BuyModule, SupplierModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

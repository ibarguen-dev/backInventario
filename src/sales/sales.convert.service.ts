import {
  SaleInterface,
  SaleInterfaceFindAll,
} from './interfaces/sale.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ConvertSales {
  findall(data: any[]) {
    let sales: SaleInterfaceFindAll[] = [];
    data.forEach((sale) => {
      sales.push({
        id: sale.id,
        userId: sale.userId,
        clientId: sale.clientId,
        date: sale.date,
        dateUpdate: sale.dateUpdate,
        state: sale.state,
        description: sale.description,
        salesTotal: sale.salesTotal,
        profit: Number(sale.profit),
        client: sale.client.name,
        user: sale.user.name,
        details: sale.details,
      });
    });
    return sales;
  }
}

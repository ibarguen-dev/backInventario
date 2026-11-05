import { Client } from '../../client/entities/client.entity';
import { User } from '../../user/entities/user.entity';
import { Details, SearchDetails } from './details.interface';

export interface saleInteface {
  date: string;
  dateUpdate?: string;
  userId: string;
  clientId: string;
  state: boolean;
  description?: string;
  salesTotal: number;
  profit: number;
}

export interface saleSave {
  id: string;
  userId: string;
  clientId: string;
  date: string;
  dateUpdate?: string;
  state: boolean;
  description?: string;
  salesTotal: number;
  profit: number;
}

export interface SaleInterface {
  id: string;
  userId: string;
  clientId: string;
  date: string;
  dateUpdate?: string;
  state: boolean;
  description?: string;
  salesTotal: number;
  profit: number;
  client: Client;
  user: User;
  details: Details[];
}

export interface SaleInterfaceFindAll {
  id: string;
  userId: string;
  clientId: string;
  date: string;
  dateUpdate?: string;
  state: boolean;
  description?: string;
  salesTotal: number;
  profit: number;
  client: string;
  user: string;
  details: SearchDetails[];
}

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from './entities/client.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async create(createClientDto: CreateClientDto) {
    try {
      const client = this.clientRepository.create(createClientDto);
      await this.clientRepository.save(client);
      return client;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error creating client');
    }
  }

  async findAll() {
    try {
      return await this.clientRepository.find({ where: { isActive: true } });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error finding clients');
    }
  }

  async findOne(id: string) {
    let client: Client | null = null;
    try {
      if (id !== '' && isUUID(id)) {
        client = await this.clientRepository.findOneBy({
          id: String(id),
          isActive: true,
        });
      }
      if (!client && !isUUID(id)) {
        client = await this.clientRepository.findOneBy({
          name: String(id),
          isActive: true,
        });
      }
      if (!client) {
        throw new InternalServerErrorException('No customers were found');
      }
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error finding client');
    }
    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto) {
    try {
      const client = await this.clientRepository.preload({
        id: id,
        ...updateClientDto,
      });
      if (!client) {
        throw new InternalServerErrorException('Client not found');
      }
      await this.clientRepository.save(client);
      return client;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error updating client');
    }
  }

  async remove(id: string) {
    await this.update(id, { isActive: false } as UpdateClientDto);
    return `This action removes a #${id} client`;
  }
}

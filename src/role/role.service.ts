import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) { }
  async create(createRoleDto: CreateRoleDto) {
    try {
      const { name } = createRoleDto;
      const role = this.roleRepository.create({
        name,
      });
      await this.roleRepository.save(role);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('');
    }
    return 'This action adds a new user';
  }

  async findAll() {
    try {
      return await this.roleRepository.find();
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('');
    }
  }

  async seedRoles() {

    try {
      const existRole = await this.roleRepository.find();
      if (existRole.length > 0) return;
      const roles = [
        { name: 'Usuario' },
        { name: 'Visitante' },
        { name: 'Administrador' },
      ];
      await this.roleRepository.save(roles);
      return {message:"Roles creados"}
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('');
    }
  }
}

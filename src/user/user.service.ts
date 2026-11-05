import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt.payload.interface';
import { JwtService } from '@nestjs/jwt';
import { TokenDto } from './dto/token-create';
import { ConfigService } from '@nestjs/config';
import { UpdateUserDto } from './dto/update-user';
import { isUUID } from 'class-validator';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtServices: JwtService,
    private readonly configService: ConfigService,
  ) { }

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userDate } = createUserDto;
      const user = this.userRepository.create({
        ...userDate,
        password: bcrypt.hashSync(password, 10)
        ,
      });
      await this.userRepository.save(user);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('');
    }
    return { message: 'Usuario creado exitosamente' };
  }



  async findAll() {
    try {
      console.log(await this.userRepository.find({
        relations:{
          rol:true,
        }
      }))
      return await this.userRepository.find({

      });

    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('');
    }
  }

  getJwtToken(payload: JwtPayload) {
    let token
    if(this.configService.get("prod")){
      token = this.jwtServices.sign(payload, {
      expiresIn: '1h',
      secret: this.configService.get('JWT_SECRET'),
    });
    }else{
     token = this.jwtServices.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
    });
    }

    return token;
  }

  validateToken(token: TokenDto) {
    try {
      console.log(this.jwtServices.verify(token.token));
      return this.jwtServices.verify(token.token);
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Token invalido');
    }
  }

  async creationToken(user: string, id: string) {
    try {
      const userEntity = await this.findByUser(id);
      console.log('Rol' + userEntity?.rol?.name);
      return {
        token: this.getJwtToken({ user: user || 'dev', id: id || '', rol: userEntity?.rol?.name || '' }),
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error creating token');
    }
  }

  /**
   * Busca usuario por email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email: email.toLowerCase() },
      relations: {
        rol:true,
      },
    });
  }

  async findByUser(id: string) {
    if (!id || !isUUID(id)) {
      return null;
    }
    try {
      return this.userRepository.findOne({
        where: { id },
        relations: {
          rol:true,
        }
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error finding user');
    }
  }

  /**
   * Busca usuario por ID incluyendo contraseña (para login y cambio de contraseña)
   */
  async findByIdWithPassword(id: string): Promise<User | null> {
    if (!id || !isUUID(id)) {
      return null;
    }
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .addSelect('user.password')
      .leftJoinAndSelect('user.rol', 'rol')
      .getOne();
  }

  /**
   * Busca usuario por ID
   */
  async findById(id: string): Promise<User | null> {
    if (!id || !isUUID(id)) {
      return null;
    }
    return this.userRepository.findOne({
      where: { id },
      relations: {
        rol:true,
      },
    });
  }

  /**
   * Actualiza contraseña temporal del usuario
   */
  async updateTemporaryPassword(
    id: string,
    hashedPassword: string,
    mustChangePassword: boolean,
    temporaryPassword: boolean,
  ): Promise<void> {
    await this.userRepository.update(id, {
      password: hashedPassword,
      mustChangePassword,
      temporaryPassword,
    });
  }

  /**
   * Actualiza contraseña y limpia estado temporal
   */
  async updatePasswordAndClearTemp(
    id: string,
    hashedPassword: string,
    mustChangePassword: boolean,
    temporaryPassword: boolean,
    passwordChangedAt: Date,
  ): Promise<void> {
    await this.userRepository.update(id, {
      password: hashedPassword,
      mustChangePassword,
      temporaryPassword,
      passwordChangedAt,
    });
  }

  async desactivate(id: string) {
    try {
      await this.userRepository.update(id, { isActive: false });
      return { message: 'Usuario actualizado exitosamente' };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error updating user');
    }
  }


  async seed() {
    const roles = [
      {
        "name": "Juan",
        "user": "developer",
        "password": bcrypt.hashSync("12345678"),
        "email": "tifonhola@gmail.com"
      },
    ]
    try {

      await this.userRepository.save(roles);
      return { message: 'usuario creados exitosamente' };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error creating roles');
    }
  }


  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}

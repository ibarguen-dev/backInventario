import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../entities/user.entity';
import { JwtPayload } from '../interfaces/jwt.payload.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export class JwtStraregy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userReopoitory: Repository<User>,
    configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.get('JWT_SECRET') ?? 'default-secret',
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }
  async validate(paylod: JwtPayload): Promise<User> {
    const { user } = paylod;
    const userb = await this.userReopoitory.findOneBy({ user });
    if (!userb) {
      throw new UnauthorizedException('Token not valid');
    }
    if (!userb.isActive) {
      throw new UnauthorizedException('User is inactive,Talk wint an admin');
    }
    return userb;
  }
}

import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../sales/decorators/get-user-decorator';
import { User } from './entities/user.entity';
import { TokenDto } from './dto/token-create';
import { Public } from '../auth/decorators';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Public()
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }



  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(@GetUser() user: User) {
    return { name: 'private', user };
  }

  @Post('validate-token')
  @UseGuards(AuthGuard())
  validateToken(@GetUser() token: TokenDto) {
    return this.userService.validateToken(token);
  }

  @Public()
  @HttpCode(200)
  @Post('refresh-token')
  refreshToken(@Body('user') user: string, @Body('id') id: string) {
    return this.userService.creationToken(user, id);
  }

  @HttpCode(200)
  @Get('find-all')
  findAll() {
    return this.userService.findAll();
  }


  @Public()
  @Get('seed')
  seed() {
    return this.userService.seed();
  }
}

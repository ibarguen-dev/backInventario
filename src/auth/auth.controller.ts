import {
  Controller,
  Post,
  Put,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { JwtAuthGuard, ThrottlerBehindProxyGuard } from './guards';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from './decorators';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/forgot-password
   * Solicita recuperación de contraseña
   * Rate limited: 3 solicitudes por minuto por IP
   */
  @Public()
  @Post('forgot-password')
  @UseGuards(ThrottlerBehindProxyGuard)
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    this.logger.log(
      `Solicitud de forgot-password para: ${forgotPasswordDto.email}`,
    );
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  /**
   * PUT /auth/change-password
   * Cambia la contraseña (usuarios autenticados)
   * Obliga a cambiar contraseña si es temporal
   */
  @Put('change-password')
  @UseGuards(JwtAuthGuard, ThrottlerBehindProxyGuard)
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Request() req: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const userId = req.headers.userid;
    this.logger.log(
      `Solicitud de cambio de contraseña para usuario: ${userId}`,
    );
    return this.authService.changePassword(userId, changePasswordDto);
  }

  /**
   * POST /auth/reset-password
   * Restablece contraseña con token (futuro uso)
   */
  @Public()
  @Post('reset-password')
  @UseGuards(ThrottlerBehindProxyGuard)
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  /**
   * GET /auth/verify
   * Verifica si el JWT es válido y devuelve información del usuario
   * Requiere token JWT en header Authorization: Bearer <token>
   */
  @Get('verify')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async verifyToken(@Request() req: any) {
    const user = req.user;
    this.logger.log(`Token verificado para usuario: ${user.user || user.sub}`);

    return {
      valid: true,
      user: {
        id: user.userId || user.id || user.sub,
        username: user.user || user.username,
        email: user.email,
      },
      mustChangePassword: user.mustChangePassword || false,
      iat: user.iat ? new Date(user.iat * 1000).toISOString() : null,
      exp: user.exp ? new Date(user.exp * 1000).toISOString() : null,
    };
  }

  @Public()
  @HttpCode(200)
  @Post('login')
  loginUser(@Body() loginDto: LoginDto) {
    return this.authService.loginUser(loginDto);
  }
}

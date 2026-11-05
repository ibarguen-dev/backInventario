import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { MailService } from '../mail/mail.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

  /**
   * Genera una contraseña temporal segura
   * - Mínimo 12 caracteres
   * - Incluye letras mayúsculas, minúsculas y números
   */
  private generateTemporaryPassword(): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const allChars = uppercase + lowercase + numbers;

    // Asegurar al menos un carácter de cada tipo
    const getRandomChar = (charset: string): string => {
      const array = new Uint32Array(1);
      // Usar una fuente de entropía simple basada en Math.random
      // que se combina con timestamp para mayor aleatoriedad
      const randomIndex =
        Math.floor(
          ((Date.now() % 1000) / 1000) * charset.length +
          Math.random() * charset.length,
        ) % charset.length;
      return charset[randomIndex];
    };

    let password = '';
    password += getRandomChar(uppercase); // al menos 1 mayúscula
    password += getRandomChar(lowercase); // al menos 1 minúscula
    password += getRandomChar(numbers); // al menos 1 número

    // Completar hasta 16 caracteres total
    for (let i = password.length; i < 16; i++) {
      const randomIndex =
        Math.floor(
          (((Date.now() % 1000) + i * 7) / 1000) * allChars.length +
          Math.random() * allChars.length,
        ) % allChars.length;
      password += allChars[randomIndex];
    }

    // Mezclar los caracteres
    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }

  /**
   * Solicitud de recuperación de contraseña
   * - Verifica que el usuario exista (sin revelar si el email existe)
   * - Genera contraseña temporal
   * - Envía correo con instrucciones
   * - Registra el intento
   */
  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    this.logger.log(`Solicitud de recuperación de contraseña para: ${email}`);

    try {
      // Buscar usuario por email
      const user = await this.userService.findByEmail(email);

      if (user) {
        // Generar contraseña temporal
        const temporaryPassword = this.generateTemporaryPassword();
        const hashedPassword = bcrypt.hashSync(temporaryPassword, 10);

        // Actualizar usuario con contraseña temporal
        await this.userService.updateTemporaryPassword(
          user.id,
          hashedPassword,
          true, // mustChangePassword
          true, // temporaryPassword
        );

        // Enviar correo con contraseña temporal
        await this.mailService.sendTemporaryPasswordEmail(
          email,
          user.name || user.user,
          temporaryPassword,
        );

        this.logger.log(`Contraseña temporal enviada a: ${email}`);
      } else {
        // El usuario no existe, pero no lo revelamos por seguridad
        this.logger.warn(
          `Solicitud de recuperación para email no registrado: ${email}`,
        );
      }

      // Siempre devolvemos el mismo mensaje para no revelar si el email existe
      return {
        message:
          'Si el correo está registrado, recibirás las instrucciones para recuperar tu contraseña.',
      };
    } catch (error) {
      this.logger.error(
        `Error en forgotPassword: ${error}`,
        error,
      );
      // Devolver mensaje genérico también en caso de error
      return {
        message:
          'Si el correo está registrado, recibirás las instrucciones para recuperar tu contraseña.',
      };
    }
  }

  /**
   * Cambio de contraseña obligatorio tras login con temporal
   */
  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string; mustChangePassword: boolean }> {
    const { currentPassword, newPassword } = changePasswordDto;

    // Obtener usuario con contraseña
    const user = await this.userService.findByIdWithPassword(userId);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // Verificar contraseña actual
    if (!bcrypt.compareSync(currentPassword, user.password)) {
      throw new UnauthorizedException('Contraseña actual incorrecta');
    }

    // Hashear nueva contraseña
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    // Actualizar contraseña y limpiar estado temporal
    await this.userService.updatePasswordAndClearTemp(
      userId,
      hashedPassword,
      false, // mustChangePassword
      false, // temporaryPassword
      new Date(), // passwordChangedAt
    );

    this.logger.log(`Contraseña cambiada exitosamente para usuario: ${userId}`);

    return {
      message: 'Contraseña cambiada exitosamente',
      mustChangePassword: false,
    };
  }

  /**
   * Restablecer contraseña con token (para uso futuro)
   */
  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const { email, token, newPassword } = resetPasswordDto;

    // Verificar token
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      if (payload.email !== email || payload.type !== 'password-reset') {
        throw new UnauthorizedException('Token inválido');
      }
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    // Obtener usuario
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // Hashear nueva contraseña
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    // Actualizar contraseña y limpiar estado temporal
    await this.userService.updatePasswordAndClearTemp(
      user.id,
      hashedPassword,
      false,
      false,
      new Date(),
    );

    this.logger.log(`Contraseña restablecida para: ${email}`);

    return {
      message: 'Contraseña restablecida exitosamente',
    };
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const { user, password } = loginUserDto;
    try {
      const userData = await this.userRepository
        .createQueryBuilder('user')
        .where('user.user = :user', { user })
        .andWhere('user.isActive = :isActive', { isActive: true })
        .addSelect('user.password')
        .leftJoinAndSelect('user.rol', 'rol')
        .getOne();
      if (!userData) {
        throw new UnauthorizedException(
          'credenciales no validas  (usuario o contraseña)',
        );
      }
      if (!bcrypt.compareSync(password, userData.password)) {
        throw new UnauthorizedException(
          'credenciales no validas  (usuario o contraseña)',
        );
      }
      return {
        id: userData.id,
        name: userData.name,
        user: userData.user,
        // rol: userData.rol?.name,
        token: this.userService.getJwtToken({
          user: userData.user,
          id: userData.id,
          rol: userData.rol?.name,
        }), // this.creationToken(userData.user),
        mustChangePassword: userData.mustChangePassword,
        temporaryPassword: userData.temporaryPassword,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

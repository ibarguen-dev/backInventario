import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Verificar si es una ruta pública
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      this.logger.warn('No se proporcionó token JWT en la solicitud');
      throw new UnauthorizedException(
        'No se proporcionó token de autenticación',
      );
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      // Adjuntar el payload del usuario a la solicitud
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (request as any).user = payload;

      this.logger.debug(
        `Token válido para usuario: ${payload.user || payload.sub || 'unknown'}`,
      );
      return true;
    } catch (error) {
      this.logger.warn(`Token JWT inválido: ${error}`);
      throw new UnauthorizedException(
        'Token de autenticación inválido o expirado',
      );
    }
  }

  /**
   * Extrae el token del header Authorization
   * Formato esperado: "Bearer <token>"
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    console.log('authHeader');
    console.log(authHeader);

    if (!authHeader) {
      return undefined;
    }

    const [type, token] = authHeader.split(' ');

    return type === 'Bearer' ? token : undefined;
  }
}

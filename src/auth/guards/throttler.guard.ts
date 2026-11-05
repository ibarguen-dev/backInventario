import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ThrottlerGuard as NestThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';

/**
 * Guard personalizado que extiende ThrottlerGuard
 * para agregar logging de solicitudes rate-limited
 */
@Injectable()
export class ThrottlerBehindProxyGuard extends NestThrottlerGuard {
  private readonly throttlerLogger = new Logger(
    ThrottlerBehindProxyGuard.name,
  );

  protected async throwThrottlingException(
    context: ExecutionContext,
  ): Promise<void> {
    const request = context.switchToHttp().getRequest<Request>();
    const ip = this.getClientIP(request);
    const userAgent = request.headers['user-agent'] || 'unknown';

    this.throttlerLogger.warn(
      `Rate limit excedido para IP: ${ip}, User-Agent: ${userAgent}, Path: ${request.url}`,
    );

    throw new HttpException(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message:
          'Demasiadas solicitudes. Por favor intenta de nuevo en un momento.',
        error: 'Too Many Requests',
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }

  protected async getTracker(req: Request): Promise<string> {
    // Intentar obtener IP real considerando proxies
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (req.headers['x-real-ip'] as string) ||
      req.ip ||
      req.socket?.remoteAddress ||
      'unknown'
    );
  }

  private getClientIP(req: Request): string {
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (req.headers['x-real-ip'] as string) ||
      req.ip ||
      req.socket?.remoteAddress ||
      'unknown'
    );
  }
}

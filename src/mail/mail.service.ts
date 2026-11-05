import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // Configuración del transporter
    // En desarrollo/testing se puede usar ethereal.email o similar
    // En producción usar SMTP real (Gmail, SendGrid, etc.)
    const smtpHost = this.configService.get('MAIL_HOST', 'smtp.ethereal.email');
    const smtpPort = this.configService.get<number>('MAIL_PORT', 587);
    const smtpUser = this.configService.get('MAIL_USER');
    const smtpPass = this.configService.get('MAIL_PASSWORD');

    // Si no hay configuración de correo, usar modo mock
    if (!smtpUser || !smtpPass) {
      this.logger.warn(
        'Configuración de correo no encontrada. Usando modo mock.',
      );
      this.transporter = null;
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    this.logger.log('Transporter de correo inicializado');
  }

  /**
   * Envía correo con contraseña temporal
   */
  async sendTemporaryPasswordEmail(
    to: string,
    userName: string,
    temporaryPassword: string,
  ): Promise<void> {
    const subject = '🔐 Nueva contraseña temporal - Coppola';
    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperación de contraseña</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background-color: #2c3e50; color: #ffffff; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 40px 30px; }
          .password-box { background-color: #f8f9fa; border: 2px dashed #3498db; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
          .password { font-family: 'Courier New', monospace; font-size: 28px; font-weight: bold; color: #2c3e50; letter-spacing: 4px; }
          .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .warning-title { color: #856404; font-weight: bold; margin-bottom: 5px; }
          .warning-text { color: #856404; margin: 0; }
          .steps { background-color: #e8f4f8; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .steps h3 { margin-top: 0; color: #2980b9; }
          .steps ol { margin: 0; padding-left: 20px; }
          .steps li { margin: 10px 0; color: #34495e; }
          .footer { background-color: #ecf0f1; padding: 20px; text-align: center; font-size: 12px; color: #7f8c8d; }
          .button { display: inline-block; background-color: #3498db; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Recuperación de Contraseña</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${userName}</strong>,</p>
            <p>Has solicitado recuperar el acceso a tu cuenta. A continuación encontrarás tu <strong>contraseña temporal</strong>:</p>

            <div class="password-box">
              <p class="password">${temporaryPassword}</p>
            </div>

            <div class="warning">
              <p class="warning-title">⚠️ IMPORTANTE - Cambio obligatorio</p>
              <p class="warning-text">Por tu seguridad, esta contraseña es temporal y deberás cambiarla inmediatamente después de iniciar sesión. No podrás acceder a tu cuenta sin cambiar la contraseña.</p>
            </div>

            <div class="steps">
              <h3>📋 Pasos para recuperar el acceso:</h3>
              <ol>
                <li>Ingresa a la aplicación con tu usuario y la contraseña temporal proporcionada arriba.</li>
                <li>Al iniciar sesión, el sistema te solicitará <strong>cambiar tu contraseña</strong>.</li>
                <li>Crea una nueva contraseña segura que cumpla con los requisitos mínimos.</li>
                <li>Una vez cambiada, podrás acceder normalmente a tu cuenta.</li>
              </ol>
            </div>

            <p><strong>Requisitos para la nueva contraseña:</strong></p>
            <ul>
              <li>Mínimo 12 caracteres</li>
              <li>Al menos una letra mayúscula</li>
              <li>Al menos una letra minúscula</li>
              <li>Al menos un número</li>
            </ul>

            <p>Si no solicitaste este correo, por favor ignóralo o contacta al administrador del sistema.</p>

            <p>Saludos,<br><strong>Equipo Coppola</strong></p>
          </div>
          <div class="footer">
            <p>Este es un correo automático. Por favor no respondas a este mensaje.</p>
            <p>&copy; ${new Date().getFullYear()} Coppola. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Texto plano alternativo
    const text = `
    Hola ${userName},

    Has solicitado recuperar el acceso a tu cuenta. Tu contraseña temporal es:

    ${temporaryPassword}

    IMPORTANTE: Esta contraseña es temporal. Deberás cambiarla inmediatamente después de iniciar sesión.

    Pasos:
    1. Ingresa a la aplicación con tu usuario y contraseña temporal.
    2. El sistema te solicitará cambiar tu contraseña.
    3. Crea una nueva contraseña segura.

    Si no solicitaste este correo, por favor ignóralo.

    Saludos,
    Equipo Coppola
    `;

    await this.sendEmail(to, subject, text, html);
  }

  /**
   * Envía correo de confirmación de cambio de contraseña
   */
  async sendPasswordChangedConfirmation(
    to: string,
    userName: string,
  ): Promise<void> {
    const subject = '✅ Contraseña cambiada exitosamente - Coppola';
    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background-color: #27ae60; color: #ffffff; padding: 30px; text-align: center; }
          .content { padding: 40px 30px; }
          .footer { background-color: #ecf0f1; padding: 20px; text-align: center; font-size: 12px; color: #7f8c8d; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Contraseña Actualizada</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${userName}</strong>,</p>
            <p>Tu contraseña ha sido cambiada exitosamente.</p>
            <p>Si no realizaste este cambio, por favor contacta al administrador del sistema inmediatamente.</p>
            <p>Saludos,<br><strong>Equipo Coppola</strong></p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Coppola.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `Hola ${userName}, Tu contraseña ha sido cambiada exitosamente. Si no realizaste este cambio, contacta al administrador.`;

    await this.sendEmail(to, subject, text, html);
  }

  /**
   * Método base para enviar correos
   */
  private async sendEmail(
    to: string,
    subject: string,
    text: string,
    html: string,
  ): Promise<void> {
    // Modo mock cuando no hay configuración
    if (!this.transporter) {
      this.logger.log(`
        ============ MODO MOCK - CORREO NO ENVIADO ============
        Para: ${to}
        Asunto: ${subject}
        ------------------------------------------------------------
        ${text}
        ===========================================================
      `);
      return;
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"Coppola" <${this.configService.get('MAIL_FROM', 'noreply@coppola.com')}>`,
        to,
        subject,
        text,
        html,
      });

      this.logger.log(
        `Correo enviado exitosamente a ${to}. MessageId: ${info.messageId}`,
      );

      // Preview URL para Ethereal (útil en desarrollo)
      if (process.env.NODE_ENV !== 'production') {
        this.logger.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
    } catch (e) {
      this.logger.error(
        `Error al enviar correo a ${to}: ${e}`,
      );
      throw new InternalServerErrorException(
        'Error al enviar el correo electrónico',
      );
    }
  }
}

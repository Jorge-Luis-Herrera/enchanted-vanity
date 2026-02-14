import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { usuario: string; password: string }) {
    const result = await this.authService.login(body.usuario, body.password);
    if (!result) {
      return { ok: false, message: 'Credenciales incorrectas' };
    }
    return { ok: true, ...result };
  }
}

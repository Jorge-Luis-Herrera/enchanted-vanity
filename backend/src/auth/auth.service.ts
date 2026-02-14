import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async validateUser(usuario: string, password: string): Promise<{ usuario: string } | null> {
    const validUsuario = (process.env.ADMIN_USER || 'admin').toLowerCase();
    const validPasswordHash = process.env.ADMIN_PASSWORD_HASH;
    const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (usuario.toLowerCase() !== validUsuario) {
      return null;
    }

    // Si hay un hash configurado, comparamos con bcrypt
    if (validPasswordHash) {
      const isMatch = await bcrypt.compare(password, validPasswordHash);
      if (isMatch) return { usuario: usuario.toLowerCase() };
    } else {
      // Si no hay hash (dev), comparamos texto plano
      if (password === defaultPassword) {
        return { usuario: usuario.toLowerCase() };
      }
    }

    return null;
  }

  async login(usuario: string, password: string) {
    const user = await this.validateUser(usuario, password);
    if (!user) {
      return null;
    }
    return {
      access_token: this.jwtService.sign({ sub: user.usuario }),
      usuario: user.usuario,
    };
  }
}

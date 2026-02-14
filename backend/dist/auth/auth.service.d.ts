import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private readonly jwtService;
    constructor(jwtService: JwtService);
    validateUser(usuario: string, password: string): Promise<{
        usuario: string;
    } | null>;
    login(usuario: string, password: string): Promise<{
        access_token: string;
        usuario: string;
    } | null>;
}

import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(body: {
        usuario: string;
        password: string;
    }): Promise<{
        ok: boolean;
        message: string;
    } | {
        access_token: string;
        usuario: string;
        ok: boolean;
        message?: undefined;
    }>;
}

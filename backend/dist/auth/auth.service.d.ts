export declare class AuthService {
    validateUser(username: string, pass: string): Promise<any>;
    login(user: any): Promise<{
        access_token: string;
        usuario: any;
        ok: boolean;
    }>;
}

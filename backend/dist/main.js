"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const path_1 = require("path");
const fs = __importStar(require("fs"));
const common_1 = require("@nestjs/common");
async function bootstrap() {
    const isProd = process.env.NODE_ENV === 'production';
    const uploadsPath = isProd ? '/home/data/uploads' : (0, path_1.join)(__dirname, '..', 'uploads');
    const dataPath = isProd ? '/home/data' : (0, path_1.join)(__dirname, '..', 'data');
    const ensureDir = (path) => {
        try {
            if (!fs.existsSync(path)) {
                fs.mkdirSync(path, { recursive: true });
                console.log(`[STARTUP] Carpeta creada exitosamente: ${path}`);
            }
            else {
                console.log(`[STARTUP] Carpeta ya existe: ${path}`);
            }
        }
        catch (err) {
            console.error(`[STARTUP] ERROR crítico creando carpeta ${path}:`, err.message);
        }
    };
    ensureDir(dataPath);
    ensureDir(uploadsPath);
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.enableCors();
    app.setGlobalPrefix('api');
    app.useStaticAssets(uploadsPath, {
        prefix: '/uploads/',
    });
    const port = process.env.PORT || 3000;
    try {
        await app.listen(port);
        console.log(`[STARTUP] Servidor corriendo exitosamente en el puerto: ${port}`);
        console.log(`[STARTUP] Modo: ${isProd ? 'PRODUCCIÓN' : 'DESARROLLO'}`);
        console.log(`[STARTUP] Base de datos: ${isProd ? '/home/data/db.sqlite' : 'data/db.sqlite'}`);
    }
    catch (err) {
        if (err.code === 'EADDRINUSE') {
            console.error(`[STARTUP] ERROR FATAL: El puerto ${port} ya está en uso.`);
        }
        else {
            console.error(`[STARTUP] ERROR FATAL al iniciar el servidor:`, err.message);
        }
        process.exit(1);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map
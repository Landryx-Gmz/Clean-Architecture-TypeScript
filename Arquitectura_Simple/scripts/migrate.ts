import * as fs from 'fs';
import * as path from 'path';
import { Client } from 'pg';
import * as dotenv from 'dotenv';
import { config, getDatabaseUrl } from '../src/composition/config.js'

dotenv.config(); // Cargar variables de entorno desde .env

async function runMigrations() {
    const migrationsDir = path.resolve(__dirname, '../db/migrations');

    // Leer todos los archivos del directorio de migraciones
    const files = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort(); // Ordenar los archivos alfabéticamente

    // Configuración de la conexión a la base de datos desde .env
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('Conectado a la base de datos');

        for (const file of files) {
            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, 'utf-8');

            console.log(`Ejecutando migración: ${file}`);
            await client.query(sql);
            console.log(`Migración completada: ${file}`);
        }
    } catch (error) {
        console.error('Error ejecutando migraciones:', error);
    } finally {
        await client.end();
        console.log('Conexión cerrada');
    }
}

runMigrations().catch(error => console.error('Error en el script de migraciones:', error));
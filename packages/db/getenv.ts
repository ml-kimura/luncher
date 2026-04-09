import dotenv from 'dotenv';
dotenv.config({ quiet: true, override: true });
process.stdout.write(JSON.stringify(process.env) + '\n');

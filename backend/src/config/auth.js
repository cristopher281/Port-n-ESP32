import dotenv from 'dotenv';

dotenv.config();

export const authConfig = {
    apiSecret: process.env.API_SECRET || 'default-secret-change-in-production',
    tokenHeader: 'Authorization'
};

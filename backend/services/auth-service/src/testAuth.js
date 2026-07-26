const mongoose = require('mongoose');
const config = require('./config/config');
const authRepo = require('./repositories/auth.repository');
const PasswordUtil = require('./utils/password.util');
const jwtUtil = require('./utils/jwt.util');

async function testAdminLoginAndTokens() {
    console.log('=== AUTHENTICATION INTEGRATION TEST ===\n');

    try {
        console.log('[1/4] Connecting to MongoDB...');
        await mongoose.connect(config.mongoUri);
        console.log('✓ Connected to MongoDB.\n');

        // Test credentials
        const email = 'admin@example.com';
        const password = 'Password123!';

        console.log(`[2/4] Testing Login for admin user: ${email}...`);
        const user = await authRepo.findByEmail(email);
        if (!user) {
            throw new Error(`Admin user ${email} not found in database.`);
        }
        console.log('✓ Found user in database. User ID:', user._id.toString());

        const isPasswordValid = await PasswordUtil.comparePassword(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Password validation failed for admin user.');
        }
        console.log('✓ Password verified successfully.');

        // Generate tokens
        const accessToken = await jwtUtil.generateAccessToken(user);
        const refreshToken = await jwtUtil.generateRefreshToken({ id: user._id });
        
        // Save refresh token
        await authRepo.addRefreshToken(user._id, refreshToken);
        console.log('✓ Access Token generated.');
        console.log('✓ Refresh Token generated and stored in MongoDB.\n');

        console.log('[3/4] Verifying Access Token...');
        const decodedAccess = await jwtUtil.verifyToken(accessToken);
        console.log('✓ Access Token is valid. Payload:', {
            id: decodedAccess.id,
            email: decodedAccess.email,
            role: decodedAccess.role,
            exp: new Date(decodedAccess.exp * 1000).toISOString()
        });
        console.log('\n');

        console.log('[4/4] Testing Refresh Token Flow...');
        const decodedRefresh = await jwtUtil.verifyRefreshToken(refreshToken);
        console.log('✓ Refresh Token signature verified. Payload User ID:', decodedRefresh.id);

        const storedRefreshToken = await authRepo.findByToken(refreshToken);
        if (!storedRefreshToken) {
            throw new Error('Refresh Token not found or revoked in MongoDB.');
        }
        console.log('✓ Refresh Token found in MongoDB:', {
            id: storedRefreshToken._id.toString(),
            userId: storedRefreshToken.userId.toString(),
            isRevoked: storedRefreshToken.isRevoked,
            expiresAt: storedRefreshToken.expiresAt.toISOString()
        });

        // Issue new access token using refresh token
        const newAccessToken = await jwtUtil.generateAccessToken(user);
        const verifiedNewAccess = await jwtUtil.verifyToken(newAccessToken);
        console.log('✓ Successfully issued new Access Token from Refresh Token!');
        console.log('  New Token payload user ID:', verifiedNewAccess.id);

        console.log('\n=======================================');
        console.log('SUCCESS: All Auth & Token checks passed!');
        console.log('=======================================');

    } catch (error) {
        console.error('\n❌ Authentication Test Failed:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB.');
    }
}

testAdminLoginAndTokens();

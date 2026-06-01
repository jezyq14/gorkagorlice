import { setCookie, deleteCookie, getCookie } from 'hono/cookie';
import { googleAuth } from '@hono/oauth-providers/google';
import { zValidator } from '@hono/zod-validator'
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db, users, sessions } from '@repo/db';
import { SCHOOL_EMAIL_DOMAIN, AuthErrorReason } from '@repo/schema';

import { requireAuth, type AuthVariables } from '../middleware/auth';

const authRouter = new Hono<AuthVariables>()
    // GET /auth/google
    .get('/google',
        zValidator('query', z.object({
            callback: z.url().optional(),
        })),
        async (c, next) => {
            const callback = c.req.query('callback');
            if (callback) {
                setCookie(c, 'auth_callback_url', callback, {
                    maxAge: 600,
                    httpOnly: true,
                    secure: true,
                    path: '/',
                    sameSite: 'Lax',
                    domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined,
                });
            }
            await next();
        },
        googleAuth({
            client_id: process.env.GOOGLE_CLIENT_ID as string,
            client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
            scope: ['openid', 'email', 'profile'],
        }), async (c) => {
            const googleUser = c.get('user-google');
            const callbackUrl = getCookie(c, 'auth_callback_url') || (process.env.WEB_URL as string);

            const loginPageUrl = process.env.WEB_URL + '/login';

            deleteCookie(c, 'auth_callback_url');

            if (!googleUser) {
                return c.redirect(`${loginPageUrl}?error=${AuthErrorReason.AUTH_FAILED}`);
            }

            if (!googleUser.email?.toLowerCase().endsWith(`@${SCHOOL_EMAIL_DOMAIN}`)) {
                return c.redirect(`${loginPageUrl}?error=${AuthErrorReason.INVALID_DOMAIN}`);
            }
            const [user] = await db.insert(users).values({
                googleId: googleUser.id,
                name: googleUser.name,
                email: googleUser.email,
                avatar: googleUser.picture,
            }).onConflictDoUpdate({
                target: users.googleId,
                set: { name: googleUser.name, avatar: googleUser.picture }
            }).returning();

            const sessionId = crypto.randomUUID();
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30);

            await db.insert(sessions).values({
                id: sessionId,
                userId: user.id,
                expiresAt: expiresAt,
            });

            setCookie(c, 'auth_session', sessionId, {
                path: '/',
                domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined,
                secure: true,
                httpOnly: true,
                maxAge: 60 * 60 * 24 * 30,
                sameSite: 'Lax',
            });

            return c.redirect(callbackUrl);
        })
    // GET /auth/me
    .get('/me', requireAuth, async (c) => {
        const user = c.get('user');
        return c.json(user);
    })
    // POST /auth/logout
    .post('/logout', async (c) => {
        const sessionId = getCookie(c, 'auth_session');
        if (sessionId) {
            await db.delete(sessions).where(eq(sessions.id, sessionId));
        }
        deleteCookie(c, 'auth_session', {
            path: '/',
            domain: process.env.NODE_ENV === 'production' ? '.gorkagorlice.pl' : undefined,
        });
        return c.json({ success: true });
    });

export { authRouter };
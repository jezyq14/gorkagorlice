import { Hono } from 'hono';
import { googleAuth } from '@hono/oauth-providers/google';
import { setCookie, deleteCookie, getCookie } from 'hono/cookie';
import { db, users, sessions } from '@repo/db';
import { eq } from 'drizzle-orm';
import { requireAuth, type AuthVariables } from '../middleware/auth';

const authRouter = new Hono<AuthVariables>()
    .get('/google', googleAuth({
        client_id: process.env.GOOGLE_CLIENT_ID as string,
        client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
        scope: ['openid', 'email', 'profile'],
    }), async (c) => {
        const googleUser = c.get('user-google');

        if (!googleUser) {
            return c.json({ error: 'Failed to fetch user data from Google' }, 400);
        }

        const [user] = await db.insert(users).values({
            googleId: googleUser.id,
            name: googleUser.name,
            email: googleUser.email,
            avatar: googleUser.picture,
        }).onConflictDoUpdate({
            target: users.googleId,
            set: {
                name: googleUser.name,
                avatar: googleUser.picture
            }
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

        const frontendUrl = process.env.NODE_ENV === 'production' ? process.env.WEB_URL : 'http://localhost:5173';
        return c.redirect(`${frontendUrl}`);
    }).get('/me', requireAuth, async (c) => {
        const user = c.get('user');
        return c.json(user);
    }).post('/logout', async (c) => {
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
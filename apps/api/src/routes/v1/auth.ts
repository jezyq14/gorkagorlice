import { setCookie, deleteCookie, getCookie } from 'hono/cookie';
import { googleAuth } from '@hono/oauth-providers/google';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import * as v from 'valibot';
import { describeRoute, resolver, validator } from 'hono-openapi';

import { db, users, sessions } from '@repo/db';
import { SCHOOL_EMAIL_DOMAIN, AuthErrorReason } from '@repo/schema';

import { requireAuth, type AuthVariables } from '../../middleware/auth';

const googleAuthQuerySchema = v.object({
    callback: v.optional(v.pipe(v.string(), v.url())),
});

const userResponseSchema = v.object({
    id: v.string(),
    googleId: v.string(),
    name: v.string(),
    email: v.string(),
    avatar: v.nullable(v.string()),
    diaryNumber: v.nullable(v.number()),
    roles: v.array(v.string()),
    classId: v.nullable(v.string()),
    createdAt: v.nullable(v.string()),
});

export const authRouter = new Hono<AuthVariables>()
    .get(
        '/google',
        describeRoute({
            description: 'Initiates the Google OAuth2 login flow',
            responses: {
                302: { description: 'Redirect to Google servers' },
            },
        }),
        validator('query', googleAuthQuerySchema),
        async (c, next) => {
            const callback = c.req.valid('query')?.callback;
            if (callback) {
                setCookie(c, 'auth_callback_url', callback, {
                    maxAge: 600,
                    httpOnly: true,
                    secure: true,
                    path: '/',
                    sameSite: 'Lax',
                    domain:
                        process.env.NODE_ENV === 'production'
                            ? process.env.COOKIE_DOMAIN
                            : undefined,
                });
            }
            await next();
        },
        googleAuth({
            client_id: process.env.GOOGLE_CLIENT_ID as string,
            client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
            scope: ['openid', 'email', 'profile'],
        }),
        async (c) => {
            const googleUser = c.get('user-google');
            const callbackUrl =
                getCookie(c, 'auth_callback_url') || (process.env.WEB_URL as string);
            const loginPageUrl = process.env.WEB_URL + '/login';
            deleteCookie(c, 'auth_callback_url');

            if (!googleUser)
                return c.redirect(`${loginPageUrl}?error=${AuthErrorReason.AUTH_FAILED}`);
            if (!googleUser.email?.toLowerCase().endsWith(`@${SCHOOL_EMAIL_DOMAIN}`)) {
                return c.redirect(`${loginPageUrl}?error=${AuthErrorReason.INVALID_DOMAIN}`);
            }

            const [user] = await db
                .insert(users)
                .values({
                    // @ts-ignore
                    googleId: googleUser.id,
                    name: googleUser.name,
                    email: googleUser.email,
                    avatar: googleUser.picture,
                })
                .onConflictDoUpdate({
                    target: users.googleId,
                    set: { name: googleUser.name, avatar: googleUser.picture },
                })
                .returning();

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
                domain:
                    process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined,
                secure: true,
                httpOnly: true,
                maxAge: 60 * 60 * 24 * 30,
                sameSite: 'Lax',
            });

            return c.redirect(callbackUrl);
        },
    )
    .get(
        '/me',
        describeRoute({
            description: 'Fetches the profile of the currently logged-in user',
            responses: {
                200: {
                    description: 'User data',
                    content: { 'application/json': { schema: resolver(userResponseSchema) } },
                },
                401: { description: 'Unauthorized (No active session)' },
            },
        }),
        requireAuth,
        async (c) => {
            const user = c.get('user');
            return c.json(user);
        },
    )
    .post(
        '/logout',
        describeRoute({
            description: 'Logs out the user and destroys the session',
            responses: {
                200: { description: 'Successfully logged out' },
            },
        }),
        async (c) => {
            const sessionId = getCookie(c, 'auth_session');
            if (sessionId) {
                await db.delete(sessions).where(eq(sessions.id, sessionId));
            }
            deleteCookie(c, 'auth_session', {
                path: '/',
                domain: process.env.NODE_ENV === 'production' ? '.gorkagorlice.pl' : undefined,
            });
            return c.json({ success: true });
        },
    );

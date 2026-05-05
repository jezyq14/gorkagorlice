import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authRouter } from './routes/auth';
import { serve } from '@hono/node-server';
import { AuthVariables } from './middleware/auth';

const app = new Hono<AuthVariables>();

app.use('*', cors({
  origin: [process.env.WEB_URL!],
  credentials: true,
}));

app.get('/', (c) => {
  return c.text('👋 Górka Gorlice API!');
})

const routes = app
  .route('/auth', authRouter)

export type AppType = typeof routes;

const PORT = Number(process.env.API_PORT ?? '3000');

serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);

export default app;
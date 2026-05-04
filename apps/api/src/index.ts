import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { config } from 'dotenv';

config();

const app = new Hono();

app.get('/', (c) => {
  return c.text('Hello Hono!');
});

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


// Punto de entrada del Worker: las rutas /api/* las atienden las funciones;
// todo lo demás son los archivos estáticos que genera Astro en dist/.
import { onRequestPost as contacto } from './contacto';
import { onRequestGet as auth } from './auth';
import { onRequestGet as callback } from './callback';

interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  [clave: string]: unknown;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    const ctx = { request, env: env as never };

    if (pathname === '/api/contacto') {
      return request.method === 'POST' ? contacto(ctx) : new Response('Método no permitido', { status: 405 });
    }
    if (pathname === '/api/auth' && request.method === 'GET') return auth(ctx);
    if (pathname === '/api/callback' && request.method === 'GET') return callback(ctx);

    return env.ASSETS.fetch(request);
  },
};

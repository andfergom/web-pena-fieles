// Inicio de sesión de Decap CMS con GitHub (paso 2: canjea el código y devuelve el token a /admin).

interface Env { GITHUB_CLIENT_ID: string; GITHUB_CLIENT_SECRET: string }

const pagina = (estado: 'success' | 'error', contenido: object) => {
  const mensaje = JSON.stringify(`authorization:github:${estado}:${JSON.stringify(contenido)}`);
  return new Response(
    `<!doctype html><meta charset="utf-8"><script>
      (function () {
        function recibir(e) {
          window.opener.postMessage(${mensaje}, e.origin);
          window.removeEventListener('message', recibir, false);
        }
        window.addEventListener('message', recibir, false);
        window.opener.postMessage('authorizing:github', '*');
      })();
    </script>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Set-Cookie': 'decap_oauth_state=; Path=/api; Max-Age=0' } },
  );
};

export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookie = request.headers.get('Cookie') ?? '';
  const esperado = /(?:^|;\s*)decap_oauth_state=([^;]+)/.exec(cookie)?.[1];

  if (!code || !state || state !== esperado) return pagina('error', { message: 'Estado de inicio de sesión no válido.' });

  const res = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'User-Agent': 'web-pena-fieles' },
    body: JSON.stringify({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET, code }),
  });
  const data = (await res.json()) as { access_token?: string; error_description?: string };
  if (!data.access_token) return pagina('error', { message: data.error_description ?? 'No se pudo iniciar sesión.' });
  return pagina('success', { token: data.access_token, provider: 'github' });
};

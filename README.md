# Web de la Peña Bética Fieles al Balompié

Web informativa de la peña (fase 1): inicio, la peña y junta directiva, noticias, eventos, hazte socio, contacto y textos legales.

- **Astro** genera páginas estáticas (rápidas, sin servidor que mantener).
- **Cloudflare Workers** (plan gratuito) sirve la web estática de `dist/` y atiende las rutas `/api/*` con el código de `worker/`.
- **Decap CMS** en `/admin` permite a los voluntarios editar noticias, eventos y los datos de la peña sin programar. Cada cambio queda guardado en GitHub y la web se republica sola.
- **Resend** entrega por correo los formularios de contacto y de alta de socio.

## Estructura

| Carpeta / archivo | Qué contiene |
| --- | --- |
| `src/pages/` | Una página por archivo (`la-pena.astro` → `/la-pena`) |
| `src/content/noticias/` | Noticias en Markdown (las edita el CMS) |
| `src/content/eventos/` | Eventos en Markdown (las edita el CMS) |
| `src/data/pena.json` | Datos de la peña: junta, fines, NIF, correo, cuota, redes |
| `src/components/`, `src/layouts/` | Cabecera, pie, formulario y plantillas |
| `src/styles/global.css` | Colores (verde #027824, oro #D9A934) y tipografías |
| `public/` | Escudo, iconos e imágenes subidas desde el CMS (`public/uploads/`) |
| `public/admin/` | Gestor de contenidos (Decap CMS) |
| `worker/index.ts` | Punto de entrada: `/api/*` a las funciones, el resto a la web estática |
| `worker/contacto.ts` | Envía los formularios por correo |
| `worker/auth.ts`, `callback.ts` | Inicio de sesión de los editores con GitHub |
| `wrangler.toml` | Configuración del Worker |

## Trabajar en local

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # genera dist/
npm run preview    # sirve dist/ con el Worker en local (http://localhost:8787)
npm run deploy     # compila y publica a mano (normalmente no hace falta)
```

Para probar el CMS sin GitHub: descomenta `local_backend: true` en `public/admin/config.yml`, lanza `npm run cms` en otra terminal y abre `http://localhost:4321/admin/`.

## Puesta en marcha (una sola vez)

1. **GitHub**: sube este proyecto a un repositorio y pon su nombre en `public/admin/config.yml` (`backend.repo`).
2. **Cloudflare**: Workers & Pages → Create → Import a repository → elegir el repositorio.
   - Build command: `npm run build`. Deploy command: `npx wrangler deploy`.
   - Variable de compilación `SITE_URL` con la dirección definitiva (p. ej. `https://fielesalbalompie.es`).
   - Cada push a `main` vuelve a publicar la web.
3. **Dominio**: comprarlo (en Cloudflare o donde se prefiera) y añadirlo en el Worker → Settings → Domains & Routes.
4. **Correo**: Cloudflare Email Routing para tener `info@dominio` reenviando al Gmail de la peña.
5. **Formularios**: crear cuenta gratis en [Resend](https://resend.com), verificar el dominio y añadir en el Worker (Settings → Variables and secrets) las variables `RESEND_API_KEY`, `MAIL_TO` (buzón que recibe) y `MAIL_FROM` (p. ej. `Web de la peña <web@dominio>`). Hasta entonces el formulario responde que aún no está activo.
6. **Editores**: en GitHub → Settings → Developer settings → OAuth Apps → New:
   - Homepage URL: la de la web. Callback URL: `https://<dominio>/api/callback`.
   - Copiar Client ID y Client secret al Worker como `GITHUB_CLIENT_ID` y `GITHUB_CLIENT_SECRET`.
   - Cada voluntario necesita cuenta de GitHub con permiso de escritura en el repositorio.

## Para los voluntarios

Entra en `https://<dominio>/admin`, pulsa *Login with GitHub* y elige **Noticias**, **Eventos** o **Datos de la peña**. Al publicar, la web se actualiza en uno o dos minutos. Si algo sale mal, todo cambio se puede deshacer desde el historial de GitHub.

## Pendiente

- NIF de la asociación (se rellena en *Datos de la peña* cuando llegue).
- Correo de contacto, cuota de socio y redes sociales.
- Fase 2: catálogo de productos. Fase 3: tienda con Stripe.

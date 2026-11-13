# Web de la Peña Bética Fieles al Balompié

Web informativa de la peña (fase 1): inicio, la peña y junta directiva, noticias, eventos, hazte socio, contacto y textos legales.

- **Astro** genera páginas estáticas (rápidas, sin servidor que mantener).
- **Cloudflare Pages** aloja la web gratis y ejecuta las dos funciones de `functions/api/`.
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
| `functions/api/contacto.ts` | Envía los formularios por correo |
| `functions/api/auth.ts`, `callback.ts` | Inicio de sesión de los editores con GitHub |

## Trabajar en local

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # genera dist/
npm run preview    # sirve dist/ con las funciones de Cloudflare (http://localhost:8788)
```

Para probar el CMS sin GitHub: descomenta `local_backend: true` en `public/admin/config.yml`, lanza `npm run cms` en otra terminal y abre `http://localhost:4321/admin/`.

## Puesta en marcha (una sola vez)

1. **GitHub**: sube este proyecto a un repositorio y pon su nombre en `public/admin/config.yml` (`backend.repo`).
2. **Cloudflare Pages**: Workers & Pages → Create → Pages → conectar con GitHub → elegir el repositorio.
   - Framework preset: *Astro*. Build command: `npm run build`. Output: `dist`.
   - Variable `SITE_URL` con la dirección definitiva (p. ej. `https://fielesalbalompie.es`).
3. **Dominio**: comprarlo (en Cloudflare o donde se prefiera) y añadirlo en Pages → Custom domains.
4. **Correo**: Cloudflare Email Routing para tener `info@dominio` reenviando al Gmail de la peña.
5. **Formularios**: crear cuenta gratis en [Resend](https://resend.com), verificar el dominio y añadir en Pages las variables `RESEND_API_KEY`, `MAIL_TO` (buzón que recibe) y `MAIL_FROM` (p. ej. `Web de la peña <web@dominio>`). Hasta entonces el formulario responde que aún no está activo.
6. **Editores**: en GitHub → Settings → Developer settings → OAuth Apps → New:
   - Homepage URL: la de la web. Callback URL: `https://<dominio>/api/callback`.
   - Copiar Client ID y Client secret a Pages como `GITHUB_CLIENT_ID` y `GITHUB_CLIENT_SECRET`.
   - Cada voluntario necesita cuenta de GitHub con permiso de escritura en el repositorio.

## Para los voluntarios

Entra en `https://<dominio>/admin`, pulsa *Login with GitHub* y elige **Noticias**, **Eventos** o **Datos de la peña**. Al publicar, la web se actualiza en uno o dos minutos. Si algo sale mal, todo cambio se puede deshacer desde el historial de GitHub.

## Pendiente

- NIF de la asociación (se rellena en *Datos de la peña* cuando llegue).
- Correo de contacto, cuota de socio y redes sociales.
- Fase 2: catálogo de productos. Fase 3: tienda con Stripe.

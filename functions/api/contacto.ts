// Recibe los formularios de contacto y de alta de socio y los envía por correo con Resend.
// Variables de entorno (Cloudflare Pages > Settings > Environment variables):
//   RESEND_API_KEY  clave de Resend
//   MAIL_TO         buzón de la peña que recibe los formularios
//   MAIL_FROM       remitente verificado en Resend, p. ej. "Web de la peña <web@fielesalbalompie.es>"

interface Env {
  RESEND_API_KEY?: string;
  MAIL_TO?: string;
  MAIL_FROM?: string;
}

type Ctx = { request: Request; env: Env };

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } });

const limpia = (v: FormDataEntryValue | null, max: number) => String(v ?? '').trim().slice(0, max);
const escapa = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export const onRequestPost = async ({ request, env }: Ctx) => {
  const form = await request.formData();

  // Campo trampa: los humanos no lo ven; si viene relleno, es un bot.
  if (limpia(form.get('web'), 200)) return json(200, { ok: true });

  const tipo = limpia(form.get('tipo'), 20) === 'socio' ? 'socio' : 'contacto';
  const campos = {
    nombre: limpia(form.get('nombre'), 120),
    email: limpia(form.get('email'), 160),
    telefono: limpia(form.get('telefono'), 20),
    localidad: limpia(form.get('localidad'), 80),
    mensaje: limpia(form.get('mensaje'), 3000),
  };

  if (!campos.nombre || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(campos.email)) {
    return json(400, { error: 'Revisa tu nombre y tu correo electrónico.' });
  }
  if (tipo === 'socio' && !campos.telefono) return json(400, { error: 'Falta el teléfono.' });
  if (tipo === 'contacto' && !campos.mensaje) return json(400, { error: 'Escribe tu mensaje.' });
  if (!form.get('privacidad')) return json(400, { error: 'Debes aceptar la política de privacidad.' });

  if (!env.RESEND_API_KEY || !env.MAIL_TO || !env.MAIL_FROM) {
    return json(503, { error: 'El formulario aún no está activo. Inténtalo más tarde.' });
  }

  const asunto = tipo === 'socio' ? `Nueva solicitud de socio: ${campos.nombre}` : `Mensaje de contacto: ${campos.nombre}`;
  const filas = Object.entries(campos)
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><th align="left" style="padding:4px 12px 4px 0">${k}</th><td style="padding:4px 0;white-space:pre-wrap">${escapa(v)}</td></tr>`)
    .join('');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.MAIL_FROM,
      to: env.MAIL_TO.split(',').map((s) => s.trim()),
      reply_to: campos.email,
      subject: asunto,
      html: `<h2>${escapa(asunto)}</h2><table>${filas}</table><p style="color:#666">Enviado desde la web de la peña.</p>`,
    }),
  });

  if (!res.ok) return json(502, { error: 'No se pudo enviar. Inténtalo de nuevo en unos minutos.' });
  return json(200, { ok: true });
};

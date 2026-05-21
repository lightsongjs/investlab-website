export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Cerere invalidă' }, { status: 400 });
  }

  const email = (body.email || '').trim().toLowerCase();
  const type  = body.type || 'unknown';

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'Email invalid' }, { status: 400 });
  }

  const subjects = {
    membership: 'Cerere nouă: Membership',
    mentorat:   'Cerere nouă: Mentorat 1-la-1',
  };

  const requiredEnv = ['MAILJET_API_KEY', 'MAILJET_SECRET_KEY'];
  const missingEnv = requiredEnv.filter((key) => !env[key]);
  if (missingEnv.length) {
    console.error('[MAILJET notify] Missing env vars:', missingEnv.join(', '));
    return Response.json({ error: 'Eroare server' }, { status: 500 });
  }

  const auth = btoa(`${env.MAILJET_API_KEY}:${env.MAILJET_SECRET_KEY}`);
  const fromEmail = env.MAILJET_FROM_EMAIL || 'contact@investlab.ro';
  const fromName = env.MAILJET_FROM_NAME || 'InvestLab';
  const notifyToEmail = env.NOTIFY_TO_EMAIL || 'hello.investlab@gmail.com';

  const res = await fetch('https://api.mailjet.com/v3.1/send', {
    method: 'POST',
    headers: {
      Authorization:  `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      Messages: [{
        From:       { Email: fromEmail, Name: fromName },
        To:         [{ Email: notifyToEmail }],
        ReplyTo:    { Email: fromEmail },
        Subject:    subjects[type] || 'Cerere nouă de pe site',
        TextPart:   `Email: ${email}`,
        TrackOpens:  'disabled',
        TrackClicks: 'disabled',
      }],
    }),
  });

  if (!res.ok) {
    console.error('[MAILJET notify] Send error:', res.status, await res.text());
    return Response.json({ error: 'Eroare server' }, { status: 500 });
  }

  return Response.json({ success: true });
}

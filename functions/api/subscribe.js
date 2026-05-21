export async function onRequestPost(context) {
  const { request, env } = context;

  let email;
  try {
    const body = await request.json();
    email = (body.email || '').trim().toLowerCase();
  } catch {
    return Response.json({ error: 'Cerere invalidă' }, { status: 400 });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'Email invalid' }, { status: 400 });
  }

  const requiredEnv = ['MAILJET_API_KEY', 'MAILJET_SECRET_KEY', 'MAILJET_CONTACT_LIST_ID'];
  const missingEnv = requiredEnv.filter((key) => !env[key]);
  if (missingEnv.length) {
    console.error('[MAILJET subscribe] Missing env vars:', missingEnv.join(', '));
    return Response.json({ error: 'Eroare server' }, { status: 500 });
  }

  const auth = btoa(`${env.MAILJET_API_KEY}:${env.MAILJET_SECRET_KEY}`);
  const fromEmail = env.MAILJET_FROM_EMAIL || 'contact@investlab.ro';
  const fromName = env.MAILJET_FROM_NAME || 'InvestLab';

  // 1. Adaugă contactul în lista Newsletter InvestLab
  const listRes = await fetch(
    `https://api.mailjet.com/v3/REST/contactslist/${env.MAILJET_CONTACT_LIST_ID}/managecontact`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ Email: email, Action: 'addnoforce' }),
    }
  );

  if (!listRes.ok) {
    console.error('[MAILJET subscribe] Contact list error:', listRes.status, await listRes.text());
    return Response.json({ error: 'Eroare server' }, { status: 500 });
  }

  // 2. Trimite emailul de bun venit (Email 1 din secvența de onboarding)
  const welcomeRes = await fetch('https://api.mailjet.com/v3.1/send', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      Messages: [{
        From: { Email: fromEmail, Name: fromName },
        ReplyTo: { Email: fromEmail },
        To: [{ Email: email }],
        TemplateID: 7961027,
        TemplateLanguage: true,
        Subject: 'Bun venit — îți trimit ceva mâine',
      }],
    }),
  });

  if (!welcomeRes.ok) {
    console.error('[MAILJET subscribe] Welcome email error:', welcomeRes.status, await welcomeRes.text());
    return Response.json({ error: 'Eroare server' }, { status: 500 });
  }

  return Response.json({ success: true });
}

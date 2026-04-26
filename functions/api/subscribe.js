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

  const auth = btoa(`${env.MAILJET_API_KEY}:${env.MAILJET_SECRET_KEY}`);

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
    return Response.json({ error: 'Eroare server' }, { status: 500 });
  }

  // 2. Trimite emailul de bun venit (Email 1 din secvența de onboarding)
  await fetch('https://api.mailjet.com/v3.1/send', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      Messages: [{
        From: { Email: 'mihai@investlab.ro', Name: 'Mihai - InvestLab' },
        ReplyTo: { Email: 'contact@investlab.ro' },
        To: [{ Email: email }],
        TemplateID: 7961027,
        TemplateLanguage: true,
        Subject: 'Bun venit — îți trimit ceva mâine',
      }],
    }),
  });

  return Response.json({ success: true });
}

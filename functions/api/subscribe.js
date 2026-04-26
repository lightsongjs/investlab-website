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

  const mjRes = await fetch(
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

  if (!mjRes.ok) {
    return Response.json({ error: 'Eroare server' }, { status: 500 });
  }

  return Response.json({ success: true });
}

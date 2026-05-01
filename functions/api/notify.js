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

  const auth = btoa(`${env.MAILJET_API_KEY}:${env.MAILJET_SECRET_KEY}`);

  const res = await fetch('https://api.mailjet.com/v3.1/send', {
    method: 'POST',
    headers: {
      Authorization:  `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      Messages: [{
        From:       { Email: 'mihai@investlab.ro', Name: 'InvestLab' },
        To:         [{ Email: 'hello.investlab@gmail.com' }],
        Subject:    subjects[type] || 'Cerere nouă de pe site',
        TextPart:   `Email: ${email}`,
        TrackOpens:  'disabled',
        TrackClicks: 'disabled',
      }],
    }),
  });

  if (!res.ok) {
    return Response.json({ error: 'Eroare server' }, { status: 500 });
  }

  return Response.json({ success: true });
}

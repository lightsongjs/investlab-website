import { test, expect } from '@playwright/test';
import { Buffer } from 'buffer';

const EMAIL     = 'lightsongjs@gmail.com';
const API_KEY   = process.env.MAILJET_API_KEY;
const SECRET    = process.env.MAILJET_SECRET_KEY;
const LIST_ID   = process.env.MAILJET_CONTACT_LIST_ID;
const AUTH      = () => `Basic ${Buffer.from(`${API_KEY}:${SECRET}`).toString('base64')}`;

// ── Subscribe: contactul trebuie să fie în lista newsletter ────
test('Mailjet → lightsongjs@gmail.com e în lista newsletter', async ({ request }) => {
  const res  = await request.get(
    `https://api.mailjet.com/v3/REST/listrecipient?ContactsList=${LIST_ID}&ContactEmail=${EMAIL}`,
    { headers: { Authorization: AUTH() } }
  );
  const data = await res.json();
  expect(data.Count).toBeGreaterThan(0);
  expect(data.Data[0].IsUnsubscribed).toBe(false);
  expect(data.Data[0].ListID).toBe(Number(LIST_ID));
});

// ── Notify: un email a fost trimis către hello.investlab@gmail.com ──
test('Mailjet → email trimis la hello.investlab@gmail.com pentru membership', async ({ request }) => {
  const res  = await request.get(
    'https://api.mailjet.com/v3/REST/message?FromEmail=mihai@investlab.ro&Subject=Cerere+nou%C4%83%3A+Membership&Limit=5',
    { headers: { Authorization: AUTH() } }
  );
  const data = await res.json();
  expect(data.Count).toBeGreaterThan(0);
});

test('Mailjet → email trimis la hello.investlab@gmail.com pentru mentorat', async ({ request }) => {
  const res  = await request.get(
    'https://api.mailjet.com/v3/REST/message?FromEmail=mihai@investlab.ro&Subject=Cerere+nou%C4%83%3A+Mentorat+1-la-1&Limit=5',
    { headers: { Authorization: AUTH() } }
  );
  const data = await res.json();
  expect(data.Count).toBeGreaterThan(0);
});

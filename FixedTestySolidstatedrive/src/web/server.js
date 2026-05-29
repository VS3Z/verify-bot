import express from 'express';
import session from 'express-session';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import { Routes } from 'discord.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DISCORD_API = 'https://discord.com/api/v10';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export function createWebServer(client) {
  const app = express();

  app.use(session({
    secret: process.env.SESSION_SECRET || 'southgroup_secret_2025',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 15 * 60 * 1000 },
  }));

  app.use(express.static(path.join(__dirname, 'public')));

  // ── Home page ──────────────────────────────────────────────────
  app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
  });

  // ── Start OAuth2 ───────────────────────────────────────────────
  app.get('/verify', (_req, res) => {
    const scopes = ['identify', 'email', 'guilds', 'guilds.join'].join(' ');
    const params = new URLSearchParams({
      client_id:     process.env.CLIENT_ID,
      redirect_uri:  process.env.REDIRECT_URI,
      response_type: 'code',
      scope:         scopes,
    });
    res.redirect(`https://discord.com/oauth2/authorize?${params}`);
  });

  // ── OAuth2 Callback ────────────────────────────────────────────
  app.get('/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) return res.redirect('/error?reason=no_code');

    try {
      // 1. Exchange code for access token
      const tokenRes = await axios.post(
        `${DISCORD_API}/oauth2/token`,
        new URLSearchParams({
          client_id:     process.env.CLIENT_ID,
          client_secret: process.env.CLIENT_SECRET,
          grant_type:    'authorization_code',
          code,
          redirect_uri:  process.env.REDIRECT_URI,
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      const { access_token } = tokenRes.data;

      // 2. Fetch user info
      const userRes = await axios.get(`${DISCORD_API}/users/@me`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      const user = userRes.data;

      // 3. Bot check
      if (user.bot) return res.redirect('/error?reason=bot');

      // 4. Account age check (Discord snowflake → creation date)
      const DISCORD_EPOCH = 1420070400000n;
      const createdAt = Number((BigInt(user.id) >> 22n) + DISCORD_EPOCH);
      const accountAge = Date.now() - createdAt;
      if (accountAge < THIRTY_DAYS_MS) {
        const daysOld  = Math.floor(accountAge / (24 * 60 * 60 * 1000));
        const daysLeft = 30 - daysOld;
        return res.redirect(`/error?reason=age&days_old=${daysOld}&days_left=${daysLeft}`);
      }

      // 5. Add user to guild if not already in it (requires guilds.join scope)
      if (process.env.GUILD_ID) {
        try {
          await client.rest.put(
            Routes.guildMember(process.env.GUILD_ID, user.id),
            { body: { access_token } }
          );
        } catch (_) { /* user already in guild — that's fine */ }
      }

      // 6. Assign verified role via bot REST
      if (process.env.GUILD_ID && process.env.VERIFIED_ROLE_ID) {
        await client.rest.put(
          Routes.guildMemberRole(
            process.env.GUILD_ID,
            user.id,
            process.env.VERIFIED_ROLE_ID
          )
        );
      }

      // 7. Save user to session and redirect to success
      const avatar = user.avatar
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
        : `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(user.id) % 5n)}.png`;

      req.session.verifiedUser = {
        username: user.global_name || user.username,
        avatar,
        email: user.email || null,
      };

      res.redirect('/success');
    } catch (err) {
      console.error('OAuth2 error:', err.response?.data || err.message);
      res.redirect('/error?reason=server');
    }
  });

  // ── Success page ───────────────────────────────────────────────
  app.get('/success', (_req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'success.html'));
  });

  // ── Error page ─────────────────────────────────────────────────
  app.get('/error', (_req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'error.html'));
  });

  // ── API: session user info (used by success page JS) ──────────
  app.get('/api/me', (req, res) => {
    res.json(req.session.verifiedUser || null);
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Web server running on port ${PORT}`);
  });

  return app;
}

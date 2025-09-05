const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const nodemailer = require('nodemailer');
const Mailjet = require('node-mailjet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Security & parsing
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(
    cors({
        origin: process.env.ORIGIN || true,
    })
);

// Rate limit
const limiter = rateLimit({ windowMs: 60 * 1000, max: 20 });
app.use(limiter);

// Static files
app.use(express.static('public'));

// Serve the landing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Multer for single audio file (up to 25MB)
const upload = multer({ limits: { fileSize: 25 * 1024 * 1024 } });

// Mail transport selection
const hasMailjet = !!(process.env.MJ_APIKEY_PUBLIC && process.env.MJ_APIKEY_PRIVATE);
let transporter = null;
let mailjetClient = null;

if (hasMailjet) {
    try {
        mailjetClient = Mailjet.apiConnect(
            process.env.MJ_APIKEY_PUBLIC,
            process.env.MJ_APIKEY_PRIVATE
        );
        console.log('Mailjet ready');
    } catch (e) {
        console.error('Mailjet init error:', e);
    }
} else {
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
    transporter
        .verify()
        .then(() => console.log('SMTP ready'))
        .catch((err) => console.error('SMTP error:', err));
}

// Helpers
const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s || '');
const clean = (s) => String(s || '').trim().slice(0, 500);

// Generic sender helper
async function sendEmail({ to, subject, html, replyTo, attachments }) {
    const fromEmail = process.env.MJ_SENDER || process.env.SMTP_USER;
    const fromName = 'SmartLab Site';
    const toList = Array.isArray(to)
        ? to
        : String(to || '')
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean);
    const text = html
        .replace(/<\s*br\s*\/?\s*>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
    const listUnsubUrl = process.env.UNSUB_URL || '';

    if (hasMailjet && mailjetClient) {
        const message = {
            From: { Email: fromEmail, Name: fromName },
            To: toList.map((email) => ({ Email: email })),
            Subject: subject,
            HTMLPart: html,
            TextPart: text,
        };
        if (replyTo) {
            message.ReplyTo = { Email: replyTo };
        }
        if (attachments && attachments.length > 0) {
            message.Attachments = attachments.map((att) => ({
                ContentType: att.contentType || 'application/octet-stream',
                Filename: att.filename,
                Base64Content: att.content.toString('base64'),
            }));
        }
        if (listUnsubUrl) {
            message.Headers = {
                'List-Unsubscribe': `<${listUnsubUrl}>`,
            };
        }
        await mailjetClient.post('send', { version: 'v3.1' }).request({
            Messages: [message],
        });
        return;
    }

    // Fallback SMTP
    await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: toList.join(', '),
        subject,
        replyTo,
        html,
        text,
        attachments,
    });
}

// === DEMO request ===
app.post('/api/send-demo', async (req, res) => {
    try {
        const name = clean(req.body.name);
        const company = clean(req.body.company);
        const email = clean(req.body.email);
        const phone = clean(req.body.phone);

        if (!name || !company || !isEmail(email) || !phone) {
            return res.status(400).json({ ok: false, error: 'bad_request' });
        }

        const html = `
      <h2>Заявка на демо</h2>
      <p><b>Имя:</b> ${name}</p>
      <p><b>Компания:</b> ${company}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Телефон:</b> ${phone}</p>
      <hr/>
      <p>Отправлено с сайта SmartLab.</p>
    `;

        await sendEmail({
            to: process.env.TO_DEMO,
            subject: 'Заявка на демо (SmartLab)',
            html,
            replyTo: email,
        });

        res.json({ ok: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ ok: false, error: 'server_error' });
    }
});

// === AUDIT upload ===
app.post('/api/send-audit', upload.single('audio'), async (req, res) => {
    try {
        const email = clean(req.body.email);
        const comment = clean(req.body.comment);

        if (!isEmail(email) || !req.file) {
            return res.status(400).json({ ok: false, error: 'bad_request' });
        }

        const html = `
      <h2>Бесплатный анализ звонка</h2>
      <p><b>Email для отчёта:</b> ${email}</p>
      ${comment ? `<p><b>Комментарий:</b> ${comment}</p>` : ''}
      <hr/>
      <p>Отправлено с сайта SmartLab.</p>
    `;

        await sendEmail({
            to: process.env.TO_AUDIT,
            subject: 'Новый файл для аудита (SmartLab)',
            html,
            replyTo: email,
            attachments: [
                {
                    filename: req.file.originalname,
                    content: req.file.buffer,
                    contentType: req.file.mimetype,
                },
            ],
        });

        res.json({ ok: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ ok: false, error: 'server_error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server on ${PORT}`);
});

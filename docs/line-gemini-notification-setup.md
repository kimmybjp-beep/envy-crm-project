# ENVY Reward CRM - LINE + Gemini Notification Setup

This setup enables:

- Daily Back Office summary through Vercel Cron
- Manual "Send LINE Summary" button in `/admin/dashboard`
- LINE chatbot commands for Back Office
- Gemini Thai summary text, with a fallback template if Gemini is not configured

## 1. Vercel Environment Variables

Add these variables in Vercel Project Settings -> Environment Variables:

```txt
NEXT_PUBLIC_SITE_URL=https://envy-crm-project.vercel.app
CRON_SECRET=choose-a-long-random-secret
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.0-flash-lite
LINE_CHANNEL_ACCESS_TOKEN=your-line-messaging-api-channel-access-token
LINE_CHANNEL_SECRET=your-line-channel-secret
LINE_ADMIN_TO=your-line-user-id-or-group-id
```

After adding env vars, redeploy Vercel.

## 2. LINE Webhook URL

In LINE Developers -> Messaging API -> Webhook URL, use:

```txt
https://envy-crm-project.vercel.app/api/line/webhook
```

Enable webhook.

## 3. Get LINE_ADMIN_TO

1. Add the LINE Official Account into the Back Office group.
2. In the group, type:

```txt
groupid
```

3. The bot will reply with an ID.
4. Copy that ID into Vercel env `LINE_ADMIN_TO`.
5. Redeploy Vercel.

## 4. Chatbot Commands

Type these in LINE:

```txt
สรุป
summary
dashboard
groupid
```

The bot will only summarize and notify. It will not approve stores, reset passwords, or mark rewards as shipped.

## 5. Daily Cron

`vercel.json` runs:

```txt
0 2 * * *
```

This is 02:00 UTC, approximately 09:00 Thailand time.

## 6. Manual Send

Admin can go to:

```txt
/admin/dashboard
```

Then click:

```txt
Send LINE Summary
```

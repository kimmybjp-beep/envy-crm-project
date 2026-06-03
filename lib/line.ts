import { createHmac, timingSafeEqual } from "node:crypto";

type LineMessage = {
  type: "text";
  text: string;
};

export type LineSendResult = {
  ok: boolean;
  message: string;
};

export async function pushLineText(text: string): Promise<LineSendResult> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const to = process.env.LINE_ADMIN_TO;

  if (!token || !to) {
    return {
      ok: false,
      message: "LINE config is missing. Set LINE_CHANNEL_ACCESS_TOKEN and LINE_ADMIN_TO in Vercel."
    };
  }

  return sendLineRequest("https://api.line.me/v2/bot/message/push", token, {
    to,
    messages: [lineTextMessage(text)] satisfies LineMessage[]
  });
}

export async function replyLineText(replyToken: string, text: string): Promise<LineSendResult> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;

  if (!token) {
    return {
      ok: false,
      message: "LINE config is missing. Set LINE_CHANNEL_ACCESS_TOKEN in Vercel."
    };
  }

  return sendLineRequest("https://api.line.me/v2/bot/message/reply", token, {
    replyToken,
    messages: [lineTextMessage(text)] satisfies LineMessage[]
  });
}

export function lineTextMessage(text: string): LineMessage {
  return {
    type: "text",
    text: appendOpenExternalBrowserToCrmLinks(text)
  };
}

export function appendOpenExternalBrowserToCrmLinks(text: string) {
  return text.replace(
    /https:\/\/envy-crm-project\.vercel\.app[^\s)>\]]*/g,
    (url) => appendOpenExternalBrowser(url)
  );
}

export function appendOpenExternalBrowser(url: string) {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname !== "envy-crm-project.vercel.app") return url;

    parsedUrl.searchParams.set("openExternalBrowser", "1");
    return parsedUrl.toString();
  } catch {
    const separator = url.includes("?") ? "&" : "?";

    return url.includes("openExternalBrowser=")
      ? url
      : `${url}${separator}openExternalBrowser=1`;
  }
}

export function verifyLineSignature(body: string, signature: string | null) {
  const secret = process.env.LINE_CHANNEL_SECRET;

  if (!secret) return true;
  if (!signature) return false;

  const expected = createHmac("sha256", secret).update(body).digest("base64");
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== actualBuffer.length) return false;

  return timingSafeEqual(expectedBuffer, actualBuffer);
}

async function sendLineRequest(url: string, token: string, body: unknown): Promise<LineSendResult> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    return {
      ok: false,
      message: await response.text()
    };
  }

  return {
    ok: true,
    message: "LINE message sent."
  };
}

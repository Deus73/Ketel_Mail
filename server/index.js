import express from "express";
import compression from "compression";
import fs from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import tls from "node:tls";
import { fileURLToPath } from "node:url";
import nodemailer from "nodemailer";
import { ImapFlow } from "imapflow";
import { franc } from "franc-min";
import { simpleParser } from "mailparser";
import sanitizeHtml from "sanitize-html";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dataRoot = process.env.KETEL_MAIL_DATA_DIR ? path.resolve(process.env.KETEL_MAIL_DATA_DIR) : root;
const envPath = path.join(dataRoot, ".env");
const app = express();
const mailTimeoutMs = 12000;
const maxSourceLength = 500000;
const maxTranslateLength = 16000;
const myMemoryChunkLength = 450;
const myMemoryMaxTranslateLength = 3000;
const myMemoryUrl = "https://api.mymemory.translated.net/get";
const governmentFeedRefreshMs = 110000;
const governmentFeedCache = new Map();
const folderCacheMs = 300000;
const folderListCache = new Map();
const messageListCacheMs = 20000;
const messageListCache = new Map();
const imapKeepAliveMs = 180000;
const imapSession = {
  key: "",
  client: null,
  connecting: null,
  closeTimer: null
};
const languageCodeMap = {
  afr: "af",
  ara: "ar",
  bos: "bs",
  bul: "bg",
  cat: "ca",
  ces: "cs",
  cym: "cy",
  dan: "da",
  deu: "de",
  ell: "el",
  eng: "en",
  est: "et",
  eus: "eu",
  fin: "fi",
  fra: "fr",
  gle: "ga",
  glg: "gl",
  heb: "he",
  hin: "hi",
  hrv: "hr",
  hun: "hu",
  ind: "id",
  ita: "it",
  jpn: "ja",
  kor: "ko",
  lav: "lv",
  lit: "lt",
  msa: "ms",
  nld: "nl",
  nor: "no",
  pol: "pl",
  por: "pt",
  ron: "ro",
  rus: "ru",
  slk: "sk",
  slv: "sl",
  spa: "es",
  sqi: "sq",
  srp: "sr",
  swe: "sv",
  tha: "th",
  tur: "tr",
  ukr: "uk",
  urd: "ur",
  vie: "vi",
  zho: "zh"
};

const governmentFeedKeywords = [
  "opiumwet",
  "opiumlijst",
  "lijst i",
  "lijst ii",
  "lijst ia",
  "verdovende middelen",
  "harddrugs",
  "softdrugs",
  "drugs",
  "drugspand",
  "drugscriminaliteit",
  "ondermijning",
  "designerdrugs",
  "designer drugs",
  "nieuwe psychoactieve stoffen",
  "nps",
  "3-mmc",
  "4-mmc",
  "2c-b",
  "xtc",
  "mdma",
  "cocaïne",
  "cocaine",
  "cannabis",
  "hennep",
  "wiet",
  "hasj",
  "coffeeshop",
  "coffeeshops",
  "smartshop",
  "smartshops",
  "growshop",
  "growshops",
  "seedshop",
  "seedshops",
  "cannabiszaad",
  "cannabiszaden",
  "drugsbeleid",
  "gedoogbeleid",
  "wet damocles",
  "drugslab"
];

const governmentFeedSignalWords = [
  "wijziging",
  "wet",
  "wetsvoorstel",
  "besluit",
  "regeling",
  "staatsblad",
  "staatscourant",
  "kamerstuk",
  "brief",
  "motie",
  "aankondiging",
  "nieuwsbericht",
  "onderzoek",
  "rapport",
  "aanpak",
  "controle",
  "handhaving",
  "verbod",
  "strafmaximum",
  "lijst"
];

const governmentFeedCoreWords = [
  "opiumwet",
  "verdovende middelen",
  "designerdrugs",
  "nieuwe psychoactieve stoffen",
  "drugscriminaliteit",
  "coffeeshop",
  "coffeeshops",
  "smartshop",
  "growshop",
  "cannabis",
  "hennep"
];

const governmentFeedSources = [
  { label: "Rijksoverheid", url: "https://www.rijksoverheid.nl/zoeken?trefwoord=drugs&periode=afgelopen-jaar" },
  { label: "Rijksoverheid", url: "https://www.rijksoverheid.nl/zoeken?trefwoord=opiumwet&periode=afgelopen-jaar" },
  { label: "Rijksoverheid", url: "https://www.rijksoverheid.nl/zoeken?trefwoord=coffeeshop&periode=afgelopen-jaar" },
  { label: "Rijksoverheid", url: "https://www.rijksoverheid.nl/zoeken?trefwoord=designerdrugs&periode=afgelopen-jaar" },
  { label: "Officiële Bekendmakingen", url: "https://zoek.officielebekendmakingen.nl/dossier/36159" },
  { label: "Officiële Bekendmakingen", url: "https://zoek.officielebekendmakingen.nl/dossier/36705" },
  { label: "Officiële Bekendmakingen", url: "https://www.officielebekendmakingen.nl/staatscourant" },
  { label: "WODC", url: "https://www.wodc.nl/actueel/nieuws?keyword=drugs" }
];

const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https:",
  "frame-src 'self' https://www.youtube-nocookie.com https://open.spotify.com",
  "media-src 'self' blob: data: https:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'"
].join("; ");

app.disable("x-powered-by");
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", contentSecurityPolicy);
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  next();
});
app.use("/api", (_req, res, next) => {
  res.setHeader("Cache-Control", "no-store, private");
  res.setHeader("Pragma", "no-cache");
  next();
});
app.use(compression({ threshold: 1024 }));
app.use(express.json({ limit: "1mb" }));

await fs.mkdir(dataRoot, { recursive: true });
await loadEnvFile();

const port = Number(process.env.PORT || 8080);

function isRecoverableMailRuntimeError(error) {
  return ["NoConnection", "ETIMEOUT", "ETIMEDOUT"].includes(error?.code) || /Connection not available|Socket timeout/i.test(error?.message || "");
}

process.on("uncaughtException", (error) => {
  if (isRecoverableMailRuntimeError(error)) {
    console.warn(`Mailverbinding afgebroken: ${error.message}`);
    return;
  }
  console.error(error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  if (isRecoverableMailRuntimeError(reason)) {
    console.warn(`Mailverbinding afgebroken: ${reason.message}`);
    return;
  }
  console.error(reason);
});

const fallbackFolders = ["Inbox", "Archive", "Sent", "Drafts", "Spam", "Trash"];

const demoMessages = [
  {
    id: "welcome",
    folder: "Inbox",
    from: "Ketel Mail Team <hello@ketelmeel.local>",
    to: "jij@jouwdomein.nl",
    subject: "Welkom in je eigen webmail",
    preview: "Alles draait op jouw server, zonder abonnement en zonder vendor-lock-in.",
    body: "Welkom bij Ketel Mail.\n\nDeze demo laat zien hoe je webmail kan voelen: snel, rustig en gericht op werk. Koppel straks IMAP en SMTP en je behandelt mail via je eigen server.",
    date: new Date().toISOString(),
    read: false,
    starred: true,
    labels: ["Start"],
    attachments: []
  },
  {
    id: "dns",
    folder: "Inbox",
    from: "Postmaster <postmaster@server.local>",
    to: "jij@jouwdomein.nl",
    subject: "Checklist: MX, SPF, DKIM en DMARC",
    preview: "Vier DNS-records bepalen of jouw mail betrouwbaar aankomt.",
    body: "Voor echte mailhosting heb je MX, SPF, DKIM en DMARC nodig.\n\nMX wijst naar je mailserver. SPF vertelt welke servers mogen verzenden. DKIM ondertekent uitgaande mail. DMARC bepaalt wat ontvangers doen als controles falen.",
    date: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    read: true,
    starred: false,
    labels: ["DNS"],
    attachments: []
  },
  {
    id: "contract",
    folder: "Inbox",
    from: "Legal Desk <legal@example.test>",
    to: "jij@jouwdomein.nl",
    subject: "Contract klaar voor akkoord",
    preview: "De laatste versie staat klaar. Controleer vooral de SLA en verwerkingsovereenkomst.",
    body: "De laatste versie van het contract staat klaar.\n\nLet vooral op de SLA, de verwerkingsovereenkomst en de opzegtermijn. Als dit vandaag akkoord is, kunnen we morgen live.",
    date: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    read: false,
    starred: true,
    labels: ["Juridisch", "VIP"],
    attachments: ["contract-v3.pdf", "dpa.pdf"]
  },
  {
    id: "lead",
    folder: "Inbox",
    from: "Nieuwe klant <founder@startup.test>",
    to: "jij@jouwdomein.nl",
    subject: "Vraag over self-hosted mail voor ons team",
    preview: "We zoeken iets simpels zonder maandelijkse kosten per mailbox.",
    body: "Hoi,\n\nWe zoeken een alternatief voor betaalde mail suites. Belangrijk: eigen domein, snelle webmail, geen gedoe voor het team en volledig self-hosted.\n\nKun je een voorstel sturen?",
    date: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    read: false,
    starred: false,
    labels: ["Sales"],
    attachments: []
  },
  {
    id: "invoice",
    folder: "Archive",
    from: "Facturen <billing@example.test>",
    to: "jij@jouwdomein.nl",
    subject: "Voorbeeldfactuur ontvangen",
    preview: "Deze mail staat in het archief om foldernavigatie te tonen.",
    body: "Dit is een voorbeeldbericht in het archief.",
    date: new Date(Date.now() - 1000 * 60 * 60 * 21).toISOString(),
    read: true,
    starred: false,
    labels: ["Administratie"],
    attachments: ["factuur-demo.pdf"]
  }
];

function envConfig() {
  return {
    demoMode: process.env.DEMO_MODE !== "false",
    user: process.env.MAILBOX_USER,
    pass: process.env.MAILBOX_PASSWORD,
    imapHost: process.env.IMAP_HOST,
    imapPort: Number(process.env.IMAP_PORT || 993),
    imapSecure: process.env.IMAP_SECURE !== "false",
    smtpHost: process.env.SMTP_HOST,
    smtpPort: Number(process.env.SMTP_PORT || 465),
    smtpSecure: process.env.SMTP_SECURE !== "false",
    from: process.env.MAIL_FROM || process.env.MAILBOX_USER,
    translateProvider: process.env.TRANSLATE_PROVIDER || "mymemory",
    translateUrl: process.env.TRANSLATE_URL || "http://127.0.0.1:5000",
    translateApiKey: process.env.TRANSLATE_API_KEY || ""
  };
}

function isDemoMode() {
  return process.env.DEMO_MODE !== "false";
}

async function loadEnvFile() {
  try {
    const content = await fs.readFile(envPath, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const index = trimmed.indexOf("=");
      const key = trimmed.slice(0, index).trim();
      let value = trimmed.slice(index + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

function quoteEnv(value = "") {
  const text = String(value);
  if (!text || /[\s"#=]/.test(text)) return `"${text.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  return text;
}

function safeSettings() {
  const cfg = envConfig();
  return {
    demoMode: cfg.demoMode,
    mailboxUser: cfg.user || "",
    mailboxPasswordSet: Boolean(cfg.pass),
    imapHost: cfg.imapHost || "",
    imapPort: cfg.imapPort || 993,
    imapSecure: cfg.imapSecure,
    smtpHost: cfg.smtpHost || "",
    smtpPort: cfg.smtpPort || 465,
    smtpSecure: cfg.smtpSecure,
    mailFrom: cfg.from || "",
    translateProvider: cfg.translateProvider || "mymemory",
    translateUrl: cfg.translateUrl || "",
    translateApiKeySet: Boolean(cfg.translateApiKey),
    envFile: envPath
  };
}

async function saveSettings(settings) {
  const current = envConfig();
  const next = {
    PORT: String(settings.port || process.env.PORT || 8080),
    DEMO_MODE: settings.demoMode ? "true" : "false",
    MAILBOX_USER: settings.mailboxUser || "",
    MAILBOX_PASSWORD: settings.mailboxPassword || current.pass || "",
    IMAP_HOST: settings.imapHost || "",
    IMAP_PORT: String(settings.imapPort || 993),
    IMAP_SECURE: settings.imapSecure === false ? "false" : "true",
    SMTP_HOST: settings.smtpHost || "",
    SMTP_PORT: String(settings.smtpPort || 465),
    SMTP_SECURE: settings.smtpSecure === false ? "false" : "true",
    MAIL_FROM: settings.mailFrom || settings.mailboxUser || "",
    TRANSLATE_PROVIDER: ["libretranslate", "mymemory"].includes(settings.translateProvider) ? settings.translateProvider : current.translateProvider || "mymemory",
    TRANSLATE_URL: settings.translateUrl || current.translateUrl || "http://127.0.0.1:5000",
    TRANSLATE_API_KEY: settings.translateApiKey || current.translateApiKey || ""
  };

  const content = [
    "# Ketel Mail instellingen - beheerd via de instellingenpagina",
    ...Object.entries(next).map(([key, value]) => `${key}=${quoteEnv(value)}`),
    ""
  ].join("\n");

  await fs.writeFile(envPath, content, "utf8");
  Object.assign(process.env, next);
  clearRuntimeMailState();
  return safeSettings();
}

function requireRealConfig() {
  const cfg = envConfig();
  const missing = ["user", "pass", "imapHost", "smtpHost"].filter((key) => !cfg[key]);
  if (missing.length) {
    const err = new Error(`Ontbrekende mailinstellingen: ${missing.join(", ")}`);
    err.status = 400;
    throw err;
  }
  return cfg;
}

function publicMailError(error) {
  const detail = error.responseText || error.serverResponse || error.response || error.code || error.command || "";
  const detailText = detail ? ` (${detail})` : "";
  if (error.message === "Command failed" && detail) return `Mailserver opdracht mislukt${detailText}`;
  if (error.code === "ETIMEDOUT" || /timeout/i.test(error.message)) return "Mailserver reageert niet op tijd. Controleer host, poort en SSL/TLS.";
  if (/auth|login|credentials|password|authentication/i.test(`${error.message} ${detail}`)) {
    return "Inloggen mislukt. Controleer mailbox, wachtwoord of app-wachtwoord en of IMAP/SMTP aan staat.";
  }
  return `${error.message || "Mailverbinding mislukt"}${detailText}`;
}

async function contentToBuffer(content) {
  if (!content) return Buffer.alloc(0);
  if (Buffer.isBuffer(content)) return content;
  if (typeof content === "string") return Buffer.from(content);
  const chunks = [];
  for await (const chunk of content) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks);
}

function sanitizeEmailHtml(html = "") {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "img",
      "table",
      "thead",
      "tbody",
      "tfoot",
      "tr",
      "td",
      "th",
      "colgroup",
      "col",
      "center",
      "font",
      "span",
      "div"
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      "*": ["style", "class", "align", "title"],
      a: ["href", "name", "target", "rel", "title"],
      img: ["src", "alt", "title", "width", "height"],
      table: ["width", "height", "cellpadding", "cellspacing", "border", "align"],
      td: ["width", "height", "colspan", "rowspan", "align", "valign"],
      th: ["width", "height", "colspan", "rowspan", "align", "valign"],
      font: ["color", "face", "size"]
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: {
      img: ["http", "https", "data", "cid"]
    },
    allowedStyles: {
      "*": {
        color: [/^#[0-9a-f]+$/i, /^rgb\(/, /^rgba\(/, /^[a-z]+$/i],
        "background-color": [/^#[0-9a-f]+$/i, /^rgb\(/, /^rgba\(/, /^[a-z]+$/i],
        "font-size": [/^\d+(?:px|em|rem|%)$/],
        "font-family": [/^[a-z0-9 ,.'"_-]+$/i],
        "font-weight": [/^\d+$/, /^bold$/, /^normal$/],
        "font-style": [/^italic$/, /^normal$/],
        "text-align": [/^left$/, /^right$/, /^center$/, /^justify$/],
        "text-decoration": [/^[a-z -]+$/i],
        width: [/^\d+(?:px|%)$/],
        height: [/^\d+(?:px|%)$/],
        margin: [/^[0-9px emrem%. auto-]+$/i],
        padding: [/^[0-9px emrem%.-]+$/i],
        border: [/^[0-9px solid dashed dotted #a-z(),. -]+$/i],
        "border-collapse": [/^collapse$/, /^separate$/],
        "line-height": [/^\d+(?:px|em|rem|%)?$/]
      }
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { target: "_blank", rel: "noopener noreferrer nofollow" })
    }
  });
}

function htmlToPlainText(html = "") {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).replace(/\s{3,}/g, " ").trim();
}

function buildEmailView(parsed, rawBuffer) {
  const text = parsed.text || "";
  const html = parsed.html ? sanitizeEmailHtml(parsed.html) : "";
  const source = rawBuffer.toString("utf8");
  return {
    body: text || parsed.textAsHtml || "",
    bodyText: text,
    bodyHtml: html,
    bodySource: source.slice(0, maxSourceLength),
    sourceTruncated: source.length > maxSourceLength,
    preferredView: html ? "html" : "text"
  };
}

function safeAttachmentName(name = "bijlage") {
  const cleaned = String(name).replace(/[\\/:*?"<>|\r\n\t]/g, "_").trim();
  return cleaned ? path.basename(cleaned) : "bijlage";
}

function attachmentMetadata(item, index) {
  return {
    id: String(index),
    name: safeAttachmentName(item.filename || `bijlage-${index + 1}`),
    contentType: item.contentType || "application/octet-stream",
    size: item.size || item.content?.length || 0,
    disposition: item.contentDisposition || "attachment"
  };
}

function findParsedAttachment(parsed, index, requestedName = "") {
  const attachments = parsed.attachments || [];
  const byIndex = attachments[index] || null;
  if (!requestedName) return byIndex;
  const safeRequestedName = safeAttachmentName(requestedName).toLowerCase();
  if (byIndex && safeAttachmentName(byIndex.filename || "").toLowerCase() === safeRequestedName) return byIndex;
  return attachments.find((item) => safeAttachmentName(item.filename || "").toLowerCase() === safeRequestedName) || byIndex;
}

function attachmentHintsFromStructure(structure) {
  const hints = [];

  function walk(node) {
    if (!node || typeof node !== "object") return;
    for (const child of node.childNodes || node.children || node.parts || []) walk(child);

    const params = {
      ...(node.parameters || {}),
      ...(node.params || {}),
      ...(node.dispositionParameters || {}),
      ...(node.dispositionParams || {})
    };
    const filename = node.filename || params.filename || params.name;
    const disposition = String(node.disposition || node.dispositionType || "").toLowerCase();
    const contentType =
      node.contentType ||
      (node.type && node.subtype ? `${node.type}/${node.subtype}` : "") ||
      (node.type && String(node.type).includes("/") ? node.type : "");

    if (filename || disposition.includes("attachment")) {
      hints.push({
        id: String(hints.length),
        name: safeAttachmentName(filename || `bijlage-${hints.length + 1}`),
        contentType: contentType || "application/octet-stream",
        size: Number(node.size || 0),
        disposition: disposition || "attachment"
      });
    }
  }

  walk(structure);
  return hints;
}

function decodeEntities(value = "") {
  return String(value)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_match, code) => String.fromCharCode(Number(code)));
}

function cleanFeedText(value = "") {
  return decodeEntities(String(value).replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function absoluteFeedUrl(href = "", baseUrl = "") {
  try {
    return new URL(decodeEntities(href), baseUrl).toString();
  } catch {
    return "";
  }
}

function feedKeywordScore(text = "") {
  const haystack = text.toLowerCase();
  const keywordScore = governmentFeedKeywords.reduce((score, keyword) => score + (haystack.includes(keyword) ? 3 : 0), 0);
  const signalScore = governmentFeedSignalWords.reduce((score, keyword) => score + (haystack.includes(keyword) ? 1 : 0), 0);
  return keywordScore + signalScore;
}

function isRelevantGovernmentFeedText(text = "") {
  const haystack = text.toLowerCase();
  const hasKeyword = governmentFeedKeywords.some((keyword) => haystack.includes(keyword));
  const hasSignal = governmentFeedSignalWords.some((keyword) => haystack.includes(keyword));
  const hasCore = governmentFeedCoreWords.some((keyword) => haystack.includes(keyword));
  return hasKeyword && (hasSignal || hasCore);
}

function parseFeedDate(text = "") {
  const clean = cleanFeedText(text);
  const iso = clean.match(/\b\d{4}-\d{2}-\d{2}\b/);
  if (iso) return new Date(`${iso[0]}T00:00:00Z`).toISOString();
  const numeric = clean.match(/\b(\d{1,2})-(\d{1,2})-(\d{4})\b/);
  if (numeric) return new Date(`${numeric[3]}-${numeric[2].padStart(2, "0")}-${numeric[1].padStart(2, "0")}T00:00:00Z`).toISOString();
  const months = { januari: "01", februari: "02", maart: "03", april: "04", mei: "05", juni: "06", juli: "07", augustus: "08", september: "09", oktober: "10", november: "11", december: "12" };
  const words = clean.match(/\b(\d{1,2})\s+(januari|februari|maart|april|mei|juni|juli|augustus|september|oktober|november|december)\s+(\d{4})\b/i);
  if (words) return new Date(`${words[3]}-${months[words[2].toLowerCase()]}-${words[1].padStart(2, "0")}T00:00:00Z`).toISOString();
  const parsed = Date.parse(clean);
  return Number.isNaN(parsed) ? "" : new Date(parsed).toISOString();
}

function extractXmlTag(block = "", tag = "") {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? cleanFeedText(match[1]) : "";
}

function parseXmlFeed(xml = "", source) {
  return [...xml.matchAll(/<(item|entry)\b[\s\S]*?<\/\1>/gi)]
    .map((match) => {
      const block = match[0];
      const title = extractXmlTag(block, "title");
      const href = extractXmlTag(block, "link") || absoluteFeedUrl(block.match(/<link[^>]+href=["']([^"']+)["']/i)?.[1] || "", source.url);
      const summary = extractXmlTag(block, "description") || extractXmlTag(block, "summary") || extractXmlTag(block, "content");
      return {
        title,
        url: absoluteFeedUrl(href, source.url),
        summary,
        date: parseFeedDate(extractXmlTag(block, "pubDate") || extractXmlTag(block, "updated") || extractXmlTag(block, "published") || block),
        source: source.label,
        score: feedKeywordScore(`${title} ${summary}`)
      };
    })
    .filter((item) => item.title && item.url && isRelevantGovernmentFeedText(`${item.title} ${item.summary}`));
}

function parseHtmlFeed(html = "", source) {
  const items = [];
  const anchorRegex = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = anchorRegex.exec(html))) {
    const title = cleanFeedText(match[2]);
    if (
      title.length < 18 ||
      /^(home|contact|rss|help|zoeken|download pdf|volgende pagina|pas zoekopdracht aan)$/i.test(title) ||
      /^(toon \d+ resultaten per pagina|sorteer op:|kamerstuk:|bijlage bij kamerstuk|agenda's)/i.test(title)
    ) {
      continue;
    }
    const url = absoluteFeedUrl(match[1], source.url);
    if (!url || url.includes("#")) continue;
    const context = html.slice(Math.max(0, match.index - 550), Math.min(html.length, match.index + 1400));
    const summary = cleanFeedText(context).slice(0, 280);
    const combined = `${title} ${summary}`;
    if (!isRelevantGovernmentFeedText(combined)) continue;
    items.push({ title, url, summary, date: parseFeedDate(context), source: source.label, score: feedKeywordScore(combined) });
  }
  return items;
}

async function fetchGovernmentSource(source) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(source.url, {
      headers: { "User-Agent": "Ketel Mail feedreader/1.0 (+self-hosted webmail)" },
      signal: controller.signal
    });
    const body = await response.text();
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return /<(rss|feed|channel)\b/i.test(body) ? parseXmlFeed(body, source) : parseHtmlFeed(body, source);
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeCustomFeedSources(rawSources) {
  if (!rawSources) return [];
  let values = rawSources;
  if (typeof rawSources === "string") {
    try {
      values = JSON.parse(rawSources);
    } catch {
      values = rawSources.split(/\r?\n|,/);
    }
  }
  if (!Array.isArray(values)) return [];
  return values
    .map((source) => (typeof source === "string" ? { url: source } : source))
    .map((source) => {
      try {
        const url = new URL(String(source.url || "").trim());
        if (!["http:", "https:"].includes(url.protocol)) return null;
        return {
          label: String(source.label || url.hostname).trim().slice(0, 80) || url.hostname,
          url: url.toString()
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .slice(0, 20);
}

function governmentFeedCacheKey({ sources, limit, latestFirst }) {
  return JSON.stringify({
    sources: sources.map((source) => source.url),
    limit,
    latestFirst
  });
}

async function getGovernmentFeeds(force = false, options = {}) {
  const now = Date.now();
  const customSources = normalizeCustomFeedSources(options.sources);
  const sources = [...governmentFeedSources, ...customSources];
  const limit = Math.max(1, Math.min(60, Number(options.limit || 18)));
  const latestFirst = options.latestFirst !== false;
  const cacheKey = governmentFeedCacheKey({ sources, limit, latestFirst });
  const cached = governmentFeedCache.get(cacheKey);
  if (!force && cached && now - cached.fetchedAt < governmentFeedRefreshMs) return cached;
  const results = await Promise.allSettled(sources.map(fetchGovernmentSource));
  const errors = [];
  const seen = new Map();

  for (let index = 0; index < results.length; index += 1) {
    const result = results[index];
    if (result.status === "rejected") {
      errors.push(`${sources[index].label} ${sources[index].url}: ${result.reason?.message || "niet bereikbaar"}`);
      continue;
    }
    for (const item of result.value) {
      const key = `${item.url}|${item.title.toLowerCase()}`;
      if (!seen.has(key) || item.score > seen.get(key).score) seen.set(key, item);
    }
  }

  const items = [...seen.values()]
    .sort((a, b) =>
      latestFirst
        ? (Date.parse(b.date || 0) || 0) - (Date.parse(a.date || 0) || 0) || b.score - a.score
        : b.score - a.score || (Date.parse(b.date || 0) || 0) - (Date.parse(a.date || 0) || 0)
    )
    .slice(0, limit)
    .map(({ score, ...item }) => item);

  const feed = { fetchedAt: now, items, errors };
  governmentFeedCache.set(cacheKey, feed);
  return feed;
}

function contentDispositionHeader(disposition, filename) {
  const safe = safeAttachmentName(filename);
  const fallback = safe.replace(/[^\x20-\x7E]/g, "_").replace(/["\\;]/g, "_");
  return `${disposition}; filename="${fallback}"; filename*=UTF-8''${encodeURIComponent(safe)}`;
}

function inlineDispositionFor(contentType = "") {
  const type = contentType.toLowerCase();
  return /^(image\/|application\/pdf|text\/plain)/.test(type) ? "inline" : "attachment";
}

function isSpamFolderName(folder = "") {
  return /spam|junk|ongewenst|bulk/i.test(String(folder));
}

function findSpamFolderName(folders = []) {
  return folders.find(isSpamFolderName) || "";
}

function translateEndpoint(baseUrl) {
  const base = String(baseUrl || "").trim().replace(/\/+$/, "");
  if (!base) {
    const err = new Error("Vertaalserver ontbreekt. Vul een LibreTranslate URL in bij Serverinstellingen.");
    err.status = 400;
    throw err;
  }
  return new URL(`${base}/translate`).toString();
}

function normalizeLanguageCode(language, fallback = "en") {
  const code = String(language || "").trim().toLowerCase();
  if (!code || code === "auto" || code === "und") return fallback;
  return languageCodeMap[code] || code.slice(0, 2);
}

function detectLanguageCode(text, fallback = "en") {
  const compact = String(text || "")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[<>{}[\]|*_`~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (compact.length < 18) return fallback;
  const detected = franc(compact.slice(0, 1200), { minLength: 10 });
  return normalizeLanguageCode(detected, fallback);
}

function resolveSourceLanguage(source, text, fallback = "en") {
  if (source && source !== "auto") return normalizeLanguageCode(source, fallback);
  return detectLanguageCode(text, fallback);
}

function splitTranslationChunks(text, maxLength) {
  const chunks = [];
  let buffer = "";
  const parts = String(text || "")
    .split(/(\n{2,}|[.!?;:]\s+)/)
    .reduce((items, part, index, partsList) => {
      if (index % 2 === 0) items.push(`${part}${partsList[index + 1] || ""}`);
      return items;
    }, [])
    .filter((part) => part.trim());

  for (const part of parts.length ? parts : [text]) {
    if ((buffer + part).length <= maxLength) {
      buffer += part;
      continue;
    }
    if (buffer.trim()) chunks.push(buffer.trim());
    if (part.length <= maxLength) {
      buffer = part;
      continue;
    }
    const words = part.split(/\s+/);
    buffer = "";
    for (const word of words) {
      if ((buffer ? `${buffer} ${word}` : word).length > maxLength) {
        if (buffer.trim()) chunks.push(buffer.trim());
        buffer = word;
      } else {
        buffer = buffer ? `${buffer} ${word}` : word;
      }
    }
  }

  if (buffer.trim()) chunks.push(buffer.trim());
  return chunks;
}

function languagePairForMyMemory(source, target) {
  const from = normalizeLanguageCode(source, "en");
  const to = normalizeLanguageCode(target, "nl");
  return `${from}|${to}`;
}

async function translateWithMyMemory({ q, source, target, truncated, signal }) {
  const sourceLanguage = normalizeLanguageCode(source, "en");
  const targetLanguage = normalizeLanguageCode(target, "nl");
  if (sourceLanguage === targetLanguage) {
    return {
      translatedText: q,
      sourceLanguage,
      targetLanguage,
      translated: false,
      truncated,
      provider: "Geen vertaling nodig"
    };
  }

  const translated = [];
  for (const chunk of splitTranslationChunks(q, myMemoryChunkLength)) {
    const url = new URL(myMemoryUrl);
    url.searchParams.set("q", chunk);
    url.searchParams.set("langpair", languagePairForMyMemory(sourceLanguage, targetLanguage));

    const response = await fetch(url, { signal });
    const data = await response.json().catch(async () => ({ responseDetails: await response.text().catch(() => "") }));
    const translatedText = data?.responseData?.translatedText || data?.translatedText || "";
    const status = Number(data?.responseStatus || response.status);

    if (!response.ok || status >= 400 || !translatedText) {
      const err = new Error(data?.responseDetails || "Gratis online vertaaldienst gaf geen bruikbaar antwoord.");
      err.status = response.status || 502;
      throw err;
    }

    translated.push(translatedText);
  }

  return {
    translatedText: translated.join("\n\n"),
    sourceLanguage,
    targetLanguage,
    translated: true,
    truncated,
    provider: "MyMemory gratis online"
  };
}

async function translateWithLibreTranslate({ cfg, q, source, target, truncated, signal }) {
  const payload = {
    q,
    source: source || "auto",
    target: target || "nl",
    format: "text"
  };
  if (cfg.translateApiKey) payload.api_key = cfg.translateApiKey;

  const response = await fetch(translateEndpoint(cfg.translateUrl), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal
  });

  const data = await response.json().catch(async () => ({ error: await response.text().catch(() => "") }));
  if (!response.ok) {
    const err = new Error(data?.error || data?.message || "Vertaalserver gaf geen bruikbaar antwoord.");
    err.status = response.status;
    throw err;
  }

  const translatedText = data.translatedText || data.translation || data.result || "";
  if (!translatedText) {
    const err = new Error("Vertaalserver gaf geen vertaalde tekst terug.");
    err.status = 502;
    throw err;
  }

  return {
    translatedText,
    sourceLanguage: data.detectedLanguage?.language || data.sourceLanguage || source || "auto",
    targetLanguage: target || "nl",
    translated: true,
    truncated,
    provider: "LibreTranslate"
  };
}

async function translateText({ text, source = "auto", target = "nl" }) {
  const cfg = envConfig();
  const cleanText = String(text || "").replace(/\u0000/g, "").trim();
  if (!cleanText) {
    const err = new Error("Geen tekst gevonden om te vertalen.");
    err.status = 400;
    throw err;
  }

  const provider = cfg.translateProvider === "libretranslate" ? "libretranslate" : "mymemory";
  const sourceLanguage = provider === "mymemory" ? resolveSourceLanguage(source, cleanText, "en") : source || "auto";
  const targetLanguage = normalizeLanguageCode(target, "nl");
  const limit = provider === "mymemory" ? myMemoryMaxTranslateLength : maxTranslateLength;
  const truncated = cleanText.length > limit;
  const q = truncated ? cleanText.slice(0, limit) : cleanText;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    if (provider === "mymemory") return await translateWithMyMemory({ q, source: sourceLanguage, target: targetLanguage, truncated, signal: controller.signal });
    return await translateWithLibreTranslate({ cfg, q, source: sourceLanguage, target: targetLanguage, truncated, signal: controller.signal });
  } catch (error) {
    if (error.name === "AbortError") {
      const err = new Error("Vertaaldienst reageert niet op tijd.");
      err.status = 504;
      throw err;
    }
    if (/fetch failed|ECONNREFUSED|ENOTFOUND/i.test(error.message || "")) {
      const err = new Error(
        provider === "mymemory"
          ? "Gratis online vertaaldienst is niet bereikbaar. Probeer later opnieuw of kies LibreTranslate."
          : "Vertaalserver niet bereikbaar. Controleer de LibreTranslate URL bij Serverinstellingen."
      );
      err.status = 502;
      throw err;
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function tcpCheck(host, port, secure) {
  return new Promise((resolve) => {
    if (!host || !port) return resolve({ ok: false, error: "Host of poort ontbreekt." });
    const socket = secure ? tls.connect({ host, port, servername: host, rejectUnauthorized: true }) : net.connect({ host, port });
    const timer = setTimeout(() => {
      socket.destroy();
      resolve({ ok: false, error: "Timeout bij verbinden." });
    }, mailTimeoutMs);

    function done(result) {
      clearTimeout(timer);
      socket.destroy();
      resolve(result);
    }

    socket.once(secure ? "secureConnect" : "connect", () => {
      done({ ok: true, authorized: secure ? socket.authorized : true, authorizationError: secure ? socket.authorizationError || null : null });
    });
    socket.once("error", (error) => done({ ok: false, error: error.message, code: error.code || null }));
  });
}

async function runDiagnostics() {
  const cfg = requireRealConfig();
  const diagnostics = {
    settings: safeSettings(),
    imapTcp: await tcpCheck(cfg.imapHost, cfg.imapPort, cfg.imapSecure),
    smtpTcp: await tcpCheck(cfg.smtpHost, cfg.smtpPort, cfg.smtpSecure),
    imapLogin: { ok: false },
    smtpLogin: { ok: false }
  };

  try {
    const folders = await withImap(async (client) => {
      const boxes = await client.list();
      return boxes.map((box) => box.path);
    });
    diagnostics.imapLogin = { ok: true, folders: folders.slice(0, 20) };
  } catch (error) {
    diagnostics.imapLogin = { ok: false, error: publicMailError(error) };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: cfg.smtpHost,
      port: cfg.smtpPort,
      secure: cfg.smtpSecure,
      connectionTimeout: mailTimeoutMs,
      greetingTimeout: mailTimeoutMs,
      socketTimeout: mailTimeoutMs,
      auth: { user: cfg.user, pass: cfg.pass }
    });
    await transporter.verify();
    diagnostics.smtpLogin = { ok: true };
  } catch (error) {
    diagnostics.smtpLogin = { ok: false, error: publicMailError(error) };
  }

  return diagnostics;
}

function imapConfigKey(cfg) {
  return `${cfg.user}@${cfg.imapHost}:${cfg.imapPort}:${cfg.imapSecure ? "tls" : "plain"}`;
}

function createImapClient(cfg) {
  const client = new ImapFlow({
    host: cfg.imapHost,
    port: cfg.imapPort,
    secure: cfg.imapSecure,
    auth: { user: cfg.user, pass: cfg.pass },
    connectionTimeout: mailTimeoutMs,
    greetingTimeout: mailTimeoutMs,
    socketTimeout: mailTimeoutMs,
    logger: false
  });
  client.on("error", () => {
    if (imapSession.client === client) clearRuntimeMailState(false);
  });
  client.on("close", () => {
    if (imapSession.client === client) clearRuntimeMailState(false);
  });
  return client;
}

async function closeImapSession() {
  if (imapSession.closeTimer) windowClearTimeout(imapSession.closeTimer);
  const client = imapSession.client;
  imapSession.key = "";
  imapSession.client = null;
  imapSession.connecting = null;
  imapSession.closeTimer = null;
  if (client) await client.logout().catch(() => {});
}

function windowClearTimeout(timer) {
  if (timer) clearTimeout(timer);
}

function clearRuntimeMailState(closeSession = true) {
  folderListCache.clear();
  messageListCache.clear();
  if (closeSession) {
    closeImapSession().catch(() => {});
    return;
  }
  windowClearTimeout(imapSession.closeTimer);
  imapSession.key = "";
  imapSession.client = null;
  imapSession.connecting = null;
  imapSession.closeTimer = null;
}

function scheduleImapClose() {
  windowClearTimeout(imapSession.closeTimer);
  imapSession.closeTimer = setTimeout(() => {
    closeImapSession();
  }, imapKeepAliveMs);
  if (typeof imapSession.closeTimer.unref === "function") imapSession.closeTimer.unref();
}

async function getSharedImapClient(cfg) {
  const key = imapConfigKey(cfg);
  if (imapSession.client && imapSession.key === key) {
    if (imapSession.connecting) await imapSession.connecting;
    scheduleImapClose();
    return imapSession.client;
  }

  await closeImapSession();
  imapSession.key = key;
  imapSession.client = createImapClient(cfg);
  imapSession.connecting = imapSession.client.connect();
  await imapSession.connecting;
  imapSession.connecting = null;
  scheduleImapClose();
  return imapSession.client;
}

async function withFreshImap(fn, cfg) {
  const client = createImapClient(cfg);
  let connected = false;
  try {
    await client.connect();
    connected = true;
    return await fn(client, cfg);
  } finally {
    if (connected) await client.logout().catch(() => {});
  }
}

async function withImap(fn, options = {}) {
  const cfg = requireRealConfig();
  if (options.fresh) return withFreshImap(fn, cfg);

  try {
    const client = await getSharedImapClient(cfg);
    return await fn(client, cfg);
  } catch (error) {
    await closeImapSession();
    throw error;
  }
}

function statusPayload() {
  const cfg = envConfig();
  const missing = ["user", "pass", "imapHost", "smtpHost"].filter((key) => !cfg[key]);
  return {
    mode: isDemoMode() ? "demo" : "real",
    mailbox: process.env.MAILBOX_USER || "demo@ketelmeel.local",
    configComplete: isDemoMode() || missing.length === 0,
    missing
  };
}

function messageListLimit(value) {
  return Math.max(10, Math.min(100, Number(value || 40)));
}

async function listFoldersFromClient(client) {
  const boxes = await client.list();
  return boxes.map((box) => box.path);
}

function folderCacheKey(cfg) {
  return `${cfg.user}@${cfg.imapHost}:${cfg.imapPort}`;
}

function messageCacheKey(cfg, folder, limit) {
  return `${folderCacheKey(cfg)}:${folder}:${limit}`;
}

function clearMessageCachesForFolder(cfg, folder) {
  const prefix = cfg ? `${folderCacheKey(cfg)}:${folder}:` : "";
  for (const key of messageListCache.keys()) {
    if (!cfg || key.startsWith(prefix)) messageListCache.delete(key);
  }
}

async function cachedFoldersFromClient(client, cfg, force = false) {
  const key = folderCacheKey(cfg);
  const cached = folderListCache.get(key);
  if (!force && cached && Date.now() - cached.fetchedAt < folderCacheMs) return cached.folders;
  const folders = await listFoldersFromClient(client);
  folderListCache.set(key, { fetchedAt: Date.now(), folders });
  return folders;
}

function preferredFolder(folder, folders) {
  if (!folders.length || folders.includes(folder)) return folder;
  return folders.find((name) => /^(inbox|postvak in)$/i.test(name)) || folders[0] || folder;
}

async function fetchMessageList(client, folder, limit = 40) {
  const lock = await client.getMailboxLock(folder);
  try {
    const rows = [];
    if (!client.mailbox.exists) return [];
    const start = Math.max(1, client.mailbox.exists - limit + 1);
    for await (const msg of client.fetch(`${start}:*`, { envelope: true, flags: true, uid: true, bodyStructure: true })) {
      const subject = msg.envelope?.subject || "(geen onderwerp)";
      const from = msg.envelope?.from?.map((item) => `${item.name || item.address} <${item.address}>`).join(", ") || "";
      const attachments = attachmentHintsFromStructure(msg.bodyStructure);
      rows.push({
        id: String(msg.uid),
        folder,
        from,
        to: "",
        subject,
        preview: "Open dit bericht om de inhoud te laden.",
        body: "",
        date: msg.envelope?.date?.toISOString?.() || new Date().toISOString(),
        read: msg.flags?.has("\\Seen") || false,
        starred: msg.flags?.has("\\Flagged") || false,
        labels: [],
        attachments
      });
    }
    return rows.reverse().slice(0, limit);
  } finally {
    lock.release();
  }
}

async function cachedMessageListFromClient(client, cfg, folder, limit = 40, force = false) {
  const key = messageCacheKey(cfg, folder, limit);
  const cached = messageListCache.get(key);
  if (!force && cached && Date.now() - cached.fetchedAt < messageListCacheMs) return cached.messages;
  const messages = await fetchMessageList(client, folder, limit);
  messageListCache.set(key, { fetchedAt: Date.now(), messages });
  return messages;
}

app.get("/api/status", (_req, res) => {
  res.json(statusPayload());
});

app.get("/api/settings", (_req, res) => {
  res.json(safeSettings());
});

app.post("/api/settings", async (req, res, next) => {
  try {
    const saved = await saveSettings(req.body || {});
    res.json({ ok: true, settings: saved });
  } catch (error) {
    next(error);
  }
});

app.get("/api/diagnostics", async (_req, res, next) => {
  try {
    if (isDemoMode()) return res.json({ demoMode: true, ok: true });
    res.json(await runDiagnostics());
  } catch (error) {
    next(error);
  }
});

app.get("/api/government-feeds", async (req, res, next) => {
  try {
    const feed = await getGovernmentFeeds(req.query.refresh === "1", {
      sources: req.query.sources,
      limit: req.query.limit,
      latestFirst: req.query.latestFirst !== "0"
    });
    res.json({
      ok: true,
      refreshedAt: new Date(feed.fetchedAt).toISOString(),
      refreshAfterMs: 120000,
      topics: governmentFeedKeywords,
      items: feed.items,
      errors: feed.errors
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/mailbox", async (req, res, next) => {
  try {
    const status = statusPayload();
    const requestedFolder = String(req.query.folder || "Inbox");
    const limit = messageListLimit(req.query.limit);

    if (!status.configComplete) {
      return res.json({ status, folders: fallbackFolders, folder: requestedFolder, messages: [] });
    }

    if (isDemoMode()) {
      const folder = preferredFolder(requestedFolder, fallbackFolders);
      return res.json({
        status,
        folders: fallbackFolders,
        folder,
        messages: demoMessages.filter((message) => message.folder === folder).slice(0, limit)
      });
    }

    const mailbox = await withImap(async (client, cfg) => {
      const folders = await cachedFoldersFromClient(client, cfg, req.query.refresh === "1");
      const folder = preferredFolder(requestedFolder, folders);
      const messages = await cachedMessageListFromClient(client, cfg, folder, limit, req.query.refresh === "1");
      return { folders, folder, messages };
    });

    res.json({ status, ...mailbox });
  } catch (error) {
    next(error);
  }
});

app.get("/api/folders", async (req, res, next) => {
  try {
    if (isDemoMode()) {
      return res.json(["Inbox", "Archive", "Sent", "Drafts", "Spam", "Trash"]);
    }
    const folders = await withImap(async (client, cfg) => {
      return cachedFoldersFromClient(client, cfg, req.query.refresh === "1");
    });
    res.json(folders);
  } catch (error) {
    next(error);
  }
});

app.get("/api/messages", async (req, res, next) => {
  try {
    const folder = String(req.query.folder || "Inbox");
    const limit = messageListLimit(req.query.limit);
    if (isDemoMode()) {
      return res.json(demoMessages.filter((message) => message.folder === folder).slice(0, limit));
    }
    const messages = await withImap(async (client, cfg) => {
      return cachedMessageListFromClient(client, cfg, folder, limit, req.query.refresh === "1");
    });
    res.json(messages);
  } catch (error) {
    next(error);
  }
});

app.get("/api/messages/:folder/:id", async (req, res, next) => {
  try {
    const { folder, id } = req.params;
    if (isDemoMode()) {
      const message = demoMessages.find((item) => item.folder === folder && item.id === id);
      return message ? res.json(message) : res.status(404).json({ error: "Bericht niet gevonden" });
    }
    const message = await withImap(async (client) => {
      const lock = await client.getMailboxLock(folder);
      try {
        const downloaded = await client.download(Number(id), undefined, { uid: true });
        const rawBuffer = await contentToBuffer(downloaded.content);
        const parsed = await simpleParser(rawBuffer);
        const view = buildEmailView(parsed, rawBuffer);
        return {
          id,
          folder,
          from: parsed.from?.text || "",
          to: parsed.to?.text || "",
          subject: parsed.subject || "(geen onderwerp)",
          preview: parsed.text?.slice(0, 160) || "",
          ...view,
          date: parsed.date?.toISOString?.() || new Date().toISOString(),
          read: true,
          starred: false,
          labels: [],
          attachments: parsed.attachments?.map(attachmentMetadata) || []
        };
      } finally {
        lock.release();
      }
    });
    res.json(message);
  } catch (error) {
    next(error);
  }
});

app.post("/api/messages/:folder/:id/move", async (req, res, next) => {
  try {
    const { folder, id } = req.params;
    const targetFolder = String(req.body?.targetFolder || "").trim();

    if (!targetFolder) return res.status(400).json({ error: "Kies eerst een doelmap." });
    if (targetFolder === folder) return res.json({ ok: true, id, folder, targetFolder, unchanged: true });

    if (isDemoMode()) {
      const availableFolders = new Set([...fallbackFolders, ...demoMessages.map((message) => message.folder)]);
      if (!availableFolders.has(targetFolder)) return res.status(404).json({ error: "Doelmap niet gevonden." });
      const message = demoMessages.find((item) => item.folder === folder && item.id === id);
      if (!message) return res.status(404).json({ error: "Bericht niet gevonden." });
      message.folder = targetFolder;
      return res.json({ ok: true, demo: true, id, folder, targetFolder });
    }

    const result = await withImap(async (client, cfg) => {
      const folders = await cachedFoldersFromClient(client, cfg);
      if (!folders.includes(targetFolder)) {
        const err = new Error("Doelmap niet gevonden.");
        err.status = 404;
        throw err;
      }

      const uid = Number(id);
      if (!Number.isSafeInteger(uid) || uid < 1) {
        const err = new Error("Ongeldig bericht.");
        err.status = 400;
        throw err;
      }

      const lock = await client.getMailboxLock(folder);
      try {
        const moveResult = await client.messageMove(uid, targetFolder, { uid: true });
        if (!moveResult) {
          const err = new Error("Bericht niet gevonden.");
          err.status = 404;
          throw err;
        }
        const movedUid = moveResult.uidMap?.get(uid) || uid;
        clearMessageCachesForFolder(cfg, folder);
        clearMessageCachesForFolder(cfg, targetFolder);
        return { id: String(movedUid), folder, targetFolder };
      } finally {
        lock.release();
      }
    });

    res.json({ ok: true, ...result });
  } catch (error) {
    next(error);
  }
});

app.get("/api/messages/:folder/:id/attachments/:attachmentId", async (req, res, next) => {
  try {
    const { folder, id, attachmentId } = req.params;
    const index = Number(attachmentId);
    const requestedDisposition = req.query.disposition === "inline" ? "inline" : "attachment";
    const requestedName = String(req.query.name || "");

    if (!Number.isInteger(index) || index < 0) return res.status(400).json({ error: "Ongeldige bijlage." });

    if (isDemoMode()) {
      const message = demoMessages.find((item) => item.folder === folder && item.id === id);
      const name = Array.isArray(message?.attachments) ? message.attachments[index] : null;
      if (!name) return res.status(404).json({ error: "Bijlage niet gevonden." });
      const body = Buffer.from(`Demo-bijlage: ${name}\n\nKoppel een echte mailbox om bestanden te openen of op te slaan.`);
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Content-Disposition", contentDispositionHeader(requestedDisposition, name));
      res.setHeader("Content-Length", String(body.length));
      return res.send(body);
    }

    const attachment = await withImap(async (client) => {
      const lock = await client.getMailboxLock(folder);
      try {
        const downloaded = await client.download(Number(id), undefined, { uid: true });
        const rawBuffer = await contentToBuffer(downloaded.content);
        const parsed = await simpleParser(rawBuffer);
        return findParsedAttachment(parsed, index, requestedName);
      } finally {
        lock.release();
      }
    });

    if (!attachment) return res.status(404).json({ error: "Bijlage niet gevonden." });

    const filename = safeAttachmentName(attachment.filename || `bijlage-${index + 1}`);
    const contentType = attachment.contentType || "application/octet-stream";
    const disposition = requestedDisposition === "inline" ? inlineDispositionFor(contentType) : "attachment";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", contentDispositionHeader(disposition, filename));
    res.setHeader("Content-Length", String(attachment.content?.length || 0));
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Security-Policy", "sandbox");
    res.send(attachment.content);
  } catch (error) {
    next(error);
  }
});

app.post("/api/spam-cleaner", async (req, res, next) => {
  try {
    const requestedFolder = String(req.body?.folder || "").trim();

    if (isDemoMode()) {
      const folder = requestedFolder || "Spam";
      if (!isSpamFolderName(folder)) {
        return res.status(400).json({ error: "Spam-opruimer mag alleen op een spam-, junk- of ongewenst-map draaien." });
      }
      let removed = 0;
      for (let index = demoMessages.length - 1; index >= 0; index -= 1) {
        if (demoMessages[index].folder === folder) {
          demoMessages.splice(index, 1);
          removed += 1;
        }
      }
      return res.json({ ok: true, demo: true, folder, removed });
    }

    const result = await withImap(async (client, cfg) => {
      const folders = await cachedFoldersFromClient(client, cfg);
      const folder = requestedFolder || findSpamFolderName(folders);

      if (!folder) {
        const err = new Error("Geen spammap gevonden.");
        err.status = 404;
        throw err;
      }

      if (!isSpamFolderName(folder)) {
        const err = new Error("Spam-opruimer mag alleen op een spam-, junk- of ongewenst-map draaien.");
        err.status = 400;
        throw err;
      }

      const lock = await client.getMailboxLock(folder);
      try {
        const removed = client.mailbox.exists || 0;
        if (removed > 0) await client.messageDelete("1:*");
        clearMessageCachesForFolder(cfg, folder);
        return { folder, removed };
      } finally {
        lock.release();
      }
    });

    res.json({ ok: true, ...result });
  } catch (error) {
    next(error);
  }
});

app.post("/api/translate", async (req, res, next) => {
  try {
    const { text, source, target } = req.body || {};
    res.json(await translateText({ text, source, target }));
  } catch (error) {
    next(error);
  }
});

app.post("/api/send", async (req, res, next) => {
  try {
    const { to, from, subject, body, htmlBody, format } = req.body;
    const plainText = String(body || "").trim() || htmlToPlainText(htmlBody);
    const safeHtml = format === "html" && htmlBody ? sanitizeEmailHtml(String(htmlBody)) : "";
    if (!to || !subject || (!plainText && !safeHtml)) return res.status(400).json({ error: "Vul ontvanger, onderwerp en bericht in." });
    if (isDemoMode()) return res.json({ ok: true, id: `demo-${Date.now()}` });
    const cfg = requireRealConfig();
    const mailFrom = String(from || "").trim() || cfg.from;
    const transporter = nodemailer.createTransport({
      host: cfg.smtpHost,
      port: cfg.smtpPort,
      secure: cfg.smtpSecure,
      connectionTimeout: mailTimeoutMs,
      greetingTimeout: mailTimeoutMs,
      socketTimeout: mailTimeoutMs,
      auth: { user: cfg.user, pass: cfg.pass }
    });
    const info = await transporter.sendMail({
      from: mailFrom,
      to,
      subject,
      text: plainText,
      ...(safeHtml ? { html: safeHtml } : {})
    });
    res.json({ ok: true, id: info.messageId });
  } catch (error) {
    next(error);
  }
});

app.use(
  express.static(path.join(root, "dist"), {
    setHeaders(res, filePath) {
      if (filePath.includes(`${path.sep}assets${path.sep}`)) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      }
    }
  })
);
app.get(/.*/, (_req, res) => res.sendFile(path.join(root, "dist", "index.html")));

app.use((error, _req, res, _next) => {
  res.status(error.status || 500).json({ error: publicMailError(error) || "Er ging iets mis." });
});

app.listen(port, () => {
  console.log(`Ketel Mail draait op http://localhost:${port}`);
});

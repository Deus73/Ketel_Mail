import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Archive,
  Bell,
  Bot,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  Code2,
  Clock3,
  Command,
  Crown,
  Download,
  Eye,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Inbox,
  Layers3,
  Languages,
  ListMusic,
  Mail,
  Maximize2,
  Menu,
  Minimize2,
  Moon,
  Music2,
  Paperclip,
  PenLine,
  Play,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Tag,
  Trash2,
  Upload,
  X,
  Youtube,
  Zap
} from "lucide-react";
import "./styles.css";

const fallbackFolders = ["Inbox", "Archive", "Sent", "Drafts", "Spam", "Trash"];

const folderIcons = {
  Inbox,
  Archive,
  Sent: Send,
  Drafts: FileText,
  Spam: ShieldCheck,
  Trash: Trash2
};

const focusTabs = [
  { id: "Alles", label: "Alles", icon: Mail },
  { id: "Vandaag", label: "Vandaag", icon: CalendarDays },
  { id: "Ongelezen", label: "Ongelezen", icon: Bell },
  { id: "Belangrijk", label: "Hoog", icon: Zap },
  { id: "Ster", label: "Ster", icon: Star },
  { id: "Rood !", label: "!", icon: CircleAlert },
  { id: "Bijlagen", label: "Bijlagen", icon: Paperclip }
];

const smartFolders = [
  { id: "boss-mails", label: "BossMails", icon: Crown },
  { id: "wordpress-mails", label: "WordPressMails", icon: Code2 }
];

const assistantSuggestions = [
  "Vat deze mail samen in drie actiepunten",
  "Maak een vriendelijk kort antwoord",
  "Zet afzender op VIP en label als belangrijk",
  "Plan opvolging voor morgen 09:00"
];

const zohoLinks = [
  { label: "Open Zoho Mail EU", href: "https://mail.zoho.eu/zm/" },
  { label: "IMAP aanzetten", href: "https://www.zoho.com/mail/help/imap-access.html" },
  { label: "SMTP instellingen", href: "https://www.zoho.com/mail/help/zoho-smtp.html" },
  { label: "App-wachtwoord", href: "https://accounts.zoho.eu/home#security" }
];

const providerPresets = {
  zohoBusinessEu: {
    imapHost: "imappro.zoho.eu",
    imapPort: 993,
    imapSecure: true,
    smtpHost: "smtppro.zoho.eu",
    smtpPort: 465,
    smtpSecure: true
  },
  zohoPersonalEu: {
    imapHost: "imap.zoho.eu",
    imapPort: 993,
    imapSecure: true,
    smtpHost: "smtp.zoho.eu",
    smtpPort: 465,
    smtpSecure: true
  }
};

const layoutOptions = [
  { id: "standard", label: "Standaard", icon: Layers3 },
  { id: "focus", label: "Focus reader", icon: Eye },
  { id: "split", label: "Split work", icon: Inbox },
  { id: "triage", label: "Triage cockpit", icon: Zap },
  { id: "wide", label: "Wide desk", icon: Bot }
];

const templatePresets = [
  {
    id: "librepost",
    label: "Ketel Mail Pro",
    tone: "Rustig zakelijk",
    theme: "light",
    layoutMode: "standard",
    density: "comfortable",
    swatches: ["#0d7c72", "#2b6fcb", "#ba7c16"],
    vars: {
      light: { "--bg": "#edf2ef", "--panel": "#fbfdf9", "--panel-soft": "#f5f8f3", "--panel-deep": "#e7eee9", "--border": "#d5ded7", "--ink": "#17201d", "--ink-soft": "#68746d", "--accent": "#0d7c72", "--accent-dark": "#075d56", "--sky": "#2b6fcb", "--gold": "#ba7c16", "--rose": "#b6425a" },
      dark: { "--bg": "#0f1512", "--panel": "#17201c", "--panel-soft": "#1e2a25", "--panel-deep": "#283a32", "--border": "rgba(169, 196, 181, 0.18)", "--ink": "#f3f8f4", "--ink-soft": "#a7b8ae", "--accent": "#49d5b6", "--accent-dark": "#2fb79e", "--sky": "#78aef5", "--gold": "#e3ad4f", "--rose": "#e66d83" }
    }
  },
  {
    id: "heksenketel",
    label: "Heksenketel Logo",
    tone: "Paars, magenta en helder wit",
    theme: "light",
    layoutMode: "split",
    density: "comfortable",
    cornerLogo: "/brand/heksenketel-logo.png",
    swatches: ["#601060", "#a060a0", "#ff4090", "#ffffff"],
    vars: {
      light: { "--bg": "#f7f1f7", "--panel": "#ffffff", "--panel-soft": "#fbf7fb", "--panel-deep": "#ead9ea", "--border": "#dcc5df", "--ink": "#25072c", "--ink-soft": "#79577e", "--accent": "#601060", "--accent-dark": "#500050", "--sky": "#a060a0", "--gold": "#c050a0", "--rose": "#ff4090" },
      dark: { "--bg": "#130818", "--panel": "#1f1026", "--panel-soft": "#2b1733", "--panel-deep": "#3c2144", "--border": "rgba(224, 208, 224, 0.20)", "--ink": "#fff7ff", "--ink-soft": "#d7bedb", "--accent": "#ff4090", "--accent-dark": "#f04090", "--sky": "#c78bd0", "--gold": "#f08bc5", "--rose": "#ff5aa2" }
    }
  },
  {
    id: "executive",
    label: "Executive Clear",
    tone: "Direct en strak",
    theme: "light",
    layoutMode: "focus",
    density: "comfortable",
    swatches: ["#155e75", "#7c3aed", "#b45309"],
    vars: {
      light: { "--bg": "#eef3f6", "--panel": "#ffffff", "--panel-soft": "#f4f7f9", "--panel-deep": "#e3ebf0", "--border": "#d3dde4", "--ink": "#15232b", "--ink-soft": "#64717a", "--accent": "#155e75", "--accent-dark": "#0e4a5d", "--sky": "#2563eb", "--gold": "#b45309", "--rose": "#be3b5d" },
      dark: { "--bg": "#0c1216", "--panel": "#151d22", "--panel-soft": "#1d2930", "--panel-deep": "#2a3942", "--border": "rgba(172, 190, 200, 0.18)", "--ink": "#f4f8fa", "--ink-soft": "#a9b9c0", "--accent": "#4fc3df", "--accent-dark": "#38a9c2", "--sky": "#82aaff", "--gold": "#efb65a", "--rose": "#ef7993" }
    }
  },
  {
    id: "invoice",
    label: "Finance Desk",
    tone: "Facturen en admin",
    theme: "light",
    layoutMode: "triage",
    density: "compact",
    swatches: ["#276749", "#2563eb", "#c2410c"],
    vars: {
      light: { "--bg": "#eef4f1", "--panel": "#ffffff", "--panel-soft": "#f3f7f4", "--panel-deep": "#e0ebe4", "--border": "#cfddd5", "--ink": "#15231d", "--ink-soft": "#607269", "--accent": "#276749", "--accent-dark": "#1f513a", "--sky": "#2563eb", "--gold": "#c2410c", "--rose": "#a93651" },
      dark: { "--bg": "#0d1411", "--panel": "#17221d", "--panel-soft": "#202d27", "--panel-deep": "#2b3b33", "--border": "rgba(171, 196, 182, 0.17)", "--ink": "#f4f9f5", "--ink-soft": "#a8b9af", "--accent": "#72d39a", "--accent-dark": "#4eb879", "--sky": "#7aa7ff", "--gold": "#f29c63", "--rose": "#e8738c" }
    }
  },
  {
    id: "night",
    label: "Night Ops",
    tone: "Donker en kalm",
    theme: "dark",
    layoutMode: "wide",
    density: "comfortable",
    swatches: ["#60a5fa", "#34d399", "#fbbf24"],
    vars: {
      light: { "--bg": "#eef2f8", "--panel": "#ffffff", "--panel-soft": "#f4f6fb", "--panel-deep": "#e4eaf4", "--border": "#d4dceb", "--ink": "#162132", "--ink-soft": "#657285", "--accent": "#2563eb", "--accent-dark": "#1d4ed8", "--sky": "#0ea5e9", "--gold": "#b7791f", "--rose": "#c2416b" },
      dark: { "--bg": "#0b1020", "--panel": "#121a2c", "--panel-soft": "#1a253a", "--panel-deep": "#273550", "--border": "rgba(174, 190, 214, 0.18)", "--ink": "#f3f7ff", "--ink-soft": "#aab8cf", "--accent": "#60a5fa", "--accent-dark": "#3b82f6", "--sky": "#34d399", "--gold": "#fbbf24", "--rose": "#fb7185" }
    }
  },
  {
    id: "compact",
    label: "Compact Admin",
    tone: "Veel mail tegelijk",
    theme: "light",
    layoutMode: "split",
    density: "compact",
    swatches: ["#334155", "#0f766e", "#ca8a04"],
    vars: {
      light: { "--bg": "#f0f3f4", "--panel": "#ffffff", "--panel-soft": "#f5f7f8", "--panel-deep": "#e4e9eb", "--border": "#d5dcdf", "--ink": "#17202a", "--ink-soft": "#64717a", "--accent": "#334155", "--accent-dark": "#1f2937", "--sky": "#0f766e", "--gold": "#ca8a04", "--rose": "#b23a5b" },
      dark: { "--bg": "#101418", "--panel": "#181f25", "--panel-soft": "#222b32", "--panel-deep": "#303b43", "--border": "rgba(175, 190, 198, 0.18)", "--ink": "#f5f7f8", "--ink-soft": "#adb8be", "--accent": "#94a3b8", "--accent-dark": "#cbd5e1", "--sky": "#5eead4", "--gold": "#facc15", "--rose": "#fb7185" }
    }
  },
  {
    id: "crm",
    label: "CRM Soft",
    tone: "Sales en relaties",
    theme: "light",
    layoutMode: "triage",
    density: "comfortable",
    swatches: ["#7c3aed", "#0891b2", "#db2777"],
    vars: {
      light: { "--bg": "#f3f1f8", "--panel": "#ffffff", "--panel-soft": "#f8f6fb", "--panel-deep": "#e8e2f2", "--border": "#ded6ea", "--ink": "#211a2f", "--ink-soft": "#746985", "--accent": "#7c3aed", "--accent-dark": "#5b21b6", "--sky": "#0891b2", "--gold": "#b7791f", "--rose": "#db2777" },
      dark: { "--bg": "#120f1c", "--panel": "#1d182b", "--panel-soft": "#282238", "--panel-deep": "#392f4c", "--border": "rgba(194, 181, 214, 0.18)", "--ink": "#faf7ff", "--ink-soft": "#bdb0d1", "--accent": "#a78bfa", "--accent-dark": "#8b5cf6", "--sky": "#67e8f9", "--gold": "#f7c66b", "--rose": "#f472b6" }
    }
  },
  {
    id: "clean",
    label: "Clean Mail",
    tone: "Minimalistisch",
    theme: "light",
    layoutMode: "focus",
    density: "relaxed",
    swatches: ["#0f766e", "#475569", "#d97706"],
    vars: {
      light: { "--bg": "#f4f7f6", "--panel": "#ffffff", "--panel-soft": "#f8faf9", "--panel-deep": "#e8efec", "--border": "#dce5e1", "--ink": "#111c18", "--ink-soft": "#6a7671", "--accent": "#0f766e", "--accent-dark": "#115e59", "--sky": "#475569", "--gold": "#d97706", "--rose": "#be3455" },
      dark: { "--bg": "#0d1110", "--panel": "#171d1b", "--panel-soft": "#202926", "--panel-deep": "#2d3834", "--border": "rgba(179, 196, 188, 0.17)", "--ink": "#f7faf8", "--ink-soft": "#afbbb5", "--accent": "#5eead4", "--accent-dark": "#2dd4bf", "--sky": "#cbd5e1", "--gold": "#fbbf24", "--rose": "#fb7185" }
    }
  },
  {
    id: "support",
    label: "Support Queue",
    tone: "Tickets en opvolging",
    theme: "light",
    layoutMode: "split",
    density: "compact",
    swatches: ["#0369a1", "#16a34a", "#ea580c"],
    vars: {
      light: { "--bg": "#edf5fa", "--panel": "#ffffff", "--panel-soft": "#f3f8fb", "--panel-deep": "#dfeef6", "--border": "#cfe0e9", "--ink": "#142631", "--ink-soft": "#607480", "--accent": "#0369a1", "--accent-dark": "#075985", "--sky": "#16a34a", "--gold": "#ea580c", "--rose": "#be3a60" },
      dark: { "--bg": "#09151d", "--panel": "#121e27", "--panel-soft": "#1a2a34", "--panel-deep": "#263946", "--border": "rgba(166, 192, 205, 0.18)", "--ink": "#f2faff", "--ink-soft": "#a9bdc8", "--accent": "#38bdf8", "--accent-dark": "#0ea5e9", "--sky": "#86efac", "--gold": "#fb923c", "--rose": "#fb7185" }
    }
  },
  {
    id: "editorial",
    label: "Editorial",
    tone: "Ruim leeswerk",
    theme: "light",
    layoutMode: "wide",
    density: "relaxed",
    swatches: ["#9f1239", "#0f766e", "#2563eb"],
    vars: {
      light: { "--bg": "#f5f2f3", "--panel": "#fffefe", "--panel-soft": "#faf6f7", "--panel-deep": "#eee3e6", "--border": "#e2d5da", "--ink": "#25191d", "--ink-soft": "#76686c", "--accent": "#9f1239", "--accent-dark": "#881337", "--sky": "#2563eb", "--gold": "#b7791f", "--rose": "#0f766e" },
      dark: { "--bg": "#160d11", "--panel": "#21161a", "--panel-soft": "#2c2025", "--panel-deep": "#3b2d32", "--border": "rgba(213, 181, 191, 0.18)", "--ink": "#fff7f9", "--ink-soft": "#c8b2b9", "--accent": "#fb7185", "--accent-dark": "#f43f5e", "--sky": "#93c5fd", "--gold": "#fbbf24", "--rose": "#5eead4" }
    }
  },
  {
    id: "zoho-look",
    label: "Zoho Mail Look",
    tone: "Cloudmail compact",
    theme: "light",
    layoutMode: "split",
    density: "compact",
    swatches: ["#d93025", "#2563eb", "#16a34a"],
    vars: {
      light: { "--bg": "#f4f6f9", "--panel": "#ffffff", "--panel-soft": "#f7f9fc", "--panel-deep": "#e9eef5", "--border": "#dce3ec", "--ink": "#1f2933", "--ink-soft": "#637083", "--accent": "#d93025", "--accent-dark": "#b3261e", "--sky": "#2563eb", "--gold": "#f59e0b", "--rose": "#d93025" },
      dark: { "--bg": "#101418", "--panel": "#171d23", "--panel-soft": "#202832", "--panel-deep": "#2d3744", "--border": "rgba(180, 194, 210, 0.18)", "--ink": "#f5f7fb", "--ink-soft": "#aeb8c5", "--accent": "#ff6b5f", "--accent-dark": "#f04438", "--sky": "#8ab4f8", "--gold": "#fbbf24", "--rose": "#ff6b5f" }
    }
  },
  {
    id: "contrast",
    label: "High Contrast",
    tone: "Maximaal leesbaar",
    theme: "dark",
    layoutMode: "standard",
    density: "comfortable",
    swatches: ["#f8fafc", "#22d3ee", "#fde047"],
    vars: {
      light: { "--bg": "#f8fafc", "--panel": "#ffffff", "--panel-soft": "#f1f5f9", "--panel-deep": "#e2e8f0", "--border": "#b6c2cf", "--ink": "#0f172a", "--ink-soft": "#475569", "--accent": "#0f172a", "--accent-dark": "#020617", "--sky": "#0284c7", "--gold": "#a16207", "--rose": "#be123c" },
      dark: { "--bg": "#050607", "--panel": "#0d1117", "--panel-soft": "#161b22", "--panel-deep": "#242c36", "--border": "rgba(226, 232, 240, 0.28)", "--ink": "#f8fafc", "--ink-soft": "#cbd5e1", "--accent": "#f8fafc", "--accent-dark": "#e2e8f0", "--sky": "#22d3ee", "--gold": "#fde047", "--rose": "#fb7185" }
    }
  },
  {
    id: "paper-ledger",
    label: "Paper Ledger",
    tone: "Papier, lijnen en dossiergevoel",
    theme: "light",
    layoutMode: "wide",
    density: "comfortable",
    swatches: ["#116a5c", "#274c77", "#c44536"],
    vars: {
      light: { "--bg": "#f6f1e8", "--panel": "#fffdf5", "--panel-soft": "#fbf6ea", "--panel-deep": "#eee3d0", "--border": "#d8cab2", "--ink": "#20211d", "--ink-soft": "#756b5e", "--accent": "#116a5c", "--accent-dark": "#0b5146", "--sky": "#274c77", "--gold": "#b26d18", "--rose": "#c44536" },
      dark: { "--bg": "#12100c", "--panel": "#1c1913", "--panel-soft": "#272217", "--panel-deep": "#352d1f", "--border": "rgba(236, 222, 190, 0.20)", "--ink": "#fff8e9", "--ink-soft": "#c9baa2", "--accent": "#70d6bd", "--accent-dark": "#44bda2", "--sky": "#8ab4f8", "--gold": "#f0b75a", "--rose": "#ef7f6f" }
    }
  },
  {
    id: "command-wall",
    label: "Command Wall",
    tone: "Donkere controlekamer",
    theme: "dark",
    layoutMode: "triage",
    density: "compact",
    swatches: ["#25e0a4", "#f3c623", "#ff4d6d"],
    vars: {
      light: { "--bg": "#eef6f3", "--panel": "#ffffff", "--panel-soft": "#f2faf7", "--panel-deep": "#dceee8", "--border": "#bfd8ce", "--ink": "#0f211b", "--ink-soft": "#587168", "--accent": "#087f5b", "--accent-dark": "#066344", "--sky": "#1463ff", "--gold": "#b98200", "--rose": "#c92a4f" },
      dark: { "--bg": "#070a0d", "--panel": "#0f1519", "--panel-soft": "#151f24", "--panel-deep": "#203038", "--border": "rgba(111, 255, 211, 0.20)", "--ink": "#f0fff8", "--ink-soft": "#93b9aa", "--accent": "#25e0a4", "--accent-dark": "#15b989", "--sky": "#61a5ff", "--gold": "#f3c623", "--rose": "#ff4d6d" }
    }
  },
  {
    id: "cork-board",
    label: "Prikbord Mail",
    tone: "Notities, pins en werkbord",
    theme: "light",
    layoutMode: "standard",
    density: "relaxed",
    swatches: ["#0f766e", "#e11d48", "#facc15"],
    vars: {
      light: { "--bg": "#eef5ed", "--panel": "#fffdf7", "--panel-soft": "#f8fbef", "--panel-deep": "#e5efd9", "--border": "#c9d8bd", "--ink": "#20251c", "--ink-soft": "#66715f", "--accent": "#0f766e", "--accent-dark": "#0b5d56", "--sky": "#2563eb", "--gold": "#d69e2e", "--rose": "#e11d48" },
      dark: { "--bg": "#10150e", "--panel": "#192018", "--panel-soft": "#222c1f", "--panel-deep": "#303d2a", "--border": "rgba(196, 215, 180, 0.20)", "--ink": "#fbfff6", "--ink-soft": "#b7c6ad", "--accent": "#5eead4", "--accent-dark": "#2dd4bf", "--sky": "#93c5fd", "--gold": "#facc15", "--rose": "#fb7185" }
    }
  },
  {
    id: "pixel-mail",
    label: "Pixel Console",
    tone: "Retro blokken en harde lijnen",
    theme: "dark",
    layoutMode: "split",
    density: "compact",
    swatches: ["#00f0ff", "#ffde59", "#ff357a"],
    vars: {
      light: { "--bg": "#eef7fb", "--panel": "#ffffff", "--panel-soft": "#f4fbff", "--panel-deep": "#dceff7", "--border": "#a8cedd", "--ink": "#10202a", "--ink-soft": "#587180", "--accent": "#047b9b", "--accent-dark": "#035f78", "--sky": "#2952ff", "--gold": "#c47f00", "--rose": "#d91d63" },
      dark: { "--bg": "#050616", "--panel": "#10112a", "--panel-soft": "#17183a", "--panel-deep": "#252657", "--border": "rgba(0, 240, 255, 0.28)", "--ink": "#f7fbff", "--ink-soft": "#a8b6d4", "--accent": "#00f0ff", "--accent-dark": "#08b7d6", "--sky": "#7c5cff", "--gold": "#ffde59", "--rose": "#ff357a" }
    }
  },
  {
    id: "studio-cards",
    label: "Studio Cards",
    tone: "Heldere panelen en magazinekleur",
    theme: "light",
    layoutMode: "focus",
    density: "relaxed",
    swatches: ["#005f73", "#ee9b00", "#d62828"],
    vars: {
      light: { "--bg": "#eef7f5", "--panel": "#ffffff", "--panel-soft": "#f3fbf8", "--panel-deep": "#dcefeb", "--border": "#c6dbd6", "--ink": "#102422", "--ink-soft": "#607370", "--accent": "#005f73", "--accent-dark": "#00495a", "--sky": "#0a9396", "--gold": "#ee9b00", "--rose": "#d62828" },
      dark: { "--bg": "#081313", "--panel": "#132020", "--panel-soft": "#1d2b2b", "--panel-deep": "#2b3b3a", "--border": "rgba(170, 210, 205, 0.20)", "--ink": "#f2fffd", "--ink-soft": "#a8c4bf", "--accent": "#5eead4", "--accent-dark": "#2dd4bf", "--sky": "#7dd3fc", "--gold": "#fbbf24", "--rose": "#fb7185" }
    }
  },
  {
    id: "blueprint",
    label: "Blueprint Desk",
    tone: "Raster, lijnen en technisch overzicht",
    theme: "dark",
    layoutMode: "wide",
    density: "comfortable",
    swatches: ["#7dd3fc", "#a7f3d0", "#fef08a"],
    vars: {
      light: { "--bg": "#edf7fb", "--panel": "#ffffff", "--panel-soft": "#f3fbff", "--panel-deep": "#dceff7", "--border": "#bfd7e2", "--ink": "#102434", "--ink-soft": "#5e7483", "--accent": "#0369a1", "--accent-dark": "#075985", "--sky": "#0f766e", "--gold": "#b7791f", "--rose": "#be3a60" },
      dark: { "--bg": "#071420", "--panel": "#0e2030", "--panel-soft": "#132b3f", "--panel-deep": "#1e3b54", "--border": "rgba(125, 211, 252, 0.24)", "--ink": "#f0fbff", "--ink-soft": "#9fc6d9", "--accent": "#7dd3fc", "--accent-dark": "#38bdf8", "--sky": "#a7f3d0", "--gold": "#fef08a", "--rose": "#fda4af" }
    }
  },
  {
    id: "sunrise-tiles",
    label: "Sunrise Tiles",
    tone: "Gekleurde blokken en zachte focus",
    theme: "light",
    layoutMode: "triage",
    density: "comfortable",
    swatches: ["#0e7490", "#f97316", "#10b981"],
    vars: {
      light: { "--bg": "#f4fbf9", "--panel": "#ffffff", "--panel-soft": "#f7fff8", "--panel-deep": "#dff4ea", "--border": "#c9e2d8", "--ink": "#142521", "--ink-soft": "#63746d", "--accent": "#0e7490", "--accent-dark": "#155e75", "--sky": "#10b981", "--gold": "#f97316", "--rose": "#e11d48" },
      dark: { "--bg": "#071615", "--panel": "#11211f", "--panel-soft": "#1b2e2b", "--panel-deep": "#2a413c", "--border": "rgba(166, 224, 210, 0.20)", "--ink": "#f3fffb", "--ink-soft": "#a8c5bb", "--accent": "#67e8f9", "--accent-dark": "#22d3ee", "--sky": "#6ee7b7", "--gold": "#fb923c", "--rose": "#fb7185" }
    }
  },
  {
    id: "kleuter-vlekken",
    label: "Kleuter Vlekken",
    tone: "Handgetekend met verfspetters",
    theme: "light",
    layoutMode: "split",
    density: "relaxed",
    swatches: ["#ff2e7a", "#2ec4b6", "#ffd166", "#6a4c93"],
    vars: {
      light: { "--bg": "#fff9e8", "--panel": "#fffef7", "--panel-soft": "#fff6d8", "--panel-deep": "#ffe8a8", "--border": "#1d1d1b", "--ink": "#1b1b1b", "--ink-soft": "#5a5144", "--accent": "#ff2e7a", "--accent-dark": "#cf195d", "--sky": "#2ec4b6", "--gold": "#ffd166", "--rose": "#6a4c93" },
      dark: { "--bg": "#17110d", "--panel": "#251c16", "--panel-soft": "#30231a", "--panel-deep": "#463221", "--border": "rgba(255, 229, 166, 0.24)", "--ink": "#fff8e6", "--ink-soft": "#d3c2a6", "--accent": "#ff6aa2", "--accent-dark": "#ff3f88", "--sky": "#4ee4d8", "--gold": "#ffd166", "--rose": "#c4a1ff" }
    }
  }
];

function getTemplatePreset(id) {
  return templatePresets.find((preset) => preset.id === id) || templatePresets[0];
}

function templateStyleFor(id, theme) {
  const preset = getTemplatePreset(id);
  return preset.vars?.[theme] || preset.vars?.light || {};
}

function api(path, options) {
  return fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options
  }).then(async (response) => {
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.error || "De server gaf geen bruikbaar antwoord.");
    return data;
  });
}

function formatDate(value) {
  return new Intl.DateTimeFormat("nl-NL", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatFeedDate(value) {
  return new Intl.DateTimeFormat("nl-NL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function inferPriority(message) {
  const text = `${message.subject} ${message.preview} ${(message.labels || []).join(" ")}`.toLowerCase();
  if (message.urgent || message.starred || text.includes("dns") || text.includes("contract") || text.includes("urgent")) return "Hoog";
  if ((message.attachments || []).length || text.includes("factuur")) return "Midden";
  return "Laag";
}

function isToday(value) {
  const date = new Date(value);
  const now = new Date();
  return !Number.isNaN(date.getTime()) && date.toDateString() === now.toDateString();
}

function matchesFocusMode(message, mode) {
  if (mode === "Alles") return true;
  if (mode === "Vandaag") return isToday(message.date);
  if (mode === "Belangrijk") return message.priority === "Hoog";
  if (mode === "Ongelezen") return !message.read;
  if (mode === "Ster") return Boolean(message.starred);
  if (mode === "Rood !") return Boolean(message.urgent);
  if (mode === "Bijlagen") return (message.attachments || []).length > 0;
  return true;
}

function searchableMessageText(message) {
  return [
    message.from,
    message.to,
    message.subject,
    message.preview,
    message.priority,
    message.starred ? "ster favoriet" : "",
    message.urgent ? "urgent rood uitroepteken belangrijk" : "",
    ...(message.labels || [])
  ]
    .join(" ")
    .toLowerCase();
}

function matchesSmartFolder(message, folderId) {
  if (!folderId) return true;
  const text = searchableMessageText(message);
  if (folderId === "boss-mails") {
    return (
      message.urgent ||
      message.starred ||
      message.priority === "Hoog" ||
      /\b(vip|boss|baas|directie|ceo|founder|owner|eigenaar|zaakvoerder|management|contract|legal)\b/i.test(text)
    );
  }
  if (folderId === "wordpress-mails") {
    return /wordpress|wp-|wp_|woocommerce|jetpack|plugin|plugins|theme|update|geüpdatet|geupdate|automatisch bijgewerkt|site health|admin@|wp-admin/i.test(
      text
    );
  }
  return true;
}

function isSpamFolderName(folder = "") {
  return /spam|junk|ongewenst|bulk/i.test(String(folder));
}

function findSpamFolderName(folders = []) {
  return folders.find(isSpamFolderName) || "";
}

function findInboxFolderName(folders = []) {
  return folders.find((name) => /^(inbox|postvak in)$/i.test(name)) || folders[0] || "Inbox";
}

function findArchiveFolderName(folders = []) {
  return folders.find((name) => /^(archive|archief|all mail|alle mail)$/i.test(name)) || folders.find((name) => /archive|archief/i.test(name)) || "";
}

function findTrashFolderName(folders = []) {
  return folders.find((name) => /^(trash|afval|prullenbak|deleted|bin)$/i.test(name)) || folders.find((name) => /trash|afval|prullenbak|deleted|bin/i.test(name)) || "";
}

function smartSummary(message) {
  if (!message) return "";
  const priority = inferPriority(message);
  const priorityText = priority === "Hoog" ? "Hoge" : priority === "Midden" ? "Middelmatige" : "Lage";
  const labels = (message.labels || []).join(", ") || "geen label";
  return `${priorityText} prioriteit. Label: ${labels}. Beste volgende stap: ${
    priority === "Hoog" ? "antwoord vandaag of zet een regel klaar" : "archiveer na lezen of plan opvolging"
  }.`;
}

function normalizeAttachment(attachment, index) {
  if (typeof attachment === "string") {
    return {
      id: String(index),
      name: attachment || `bijlage-${index + 1}`,
      contentType: "",
      size: 0
    };
  }

  return {
    id: String(attachment?.id ?? index),
    name: attachment?.name || attachment?.filename || `bijlage-${index + 1}`,
    contentType: attachment?.contentType || "",
    size: Number(attachment?.size || 0)
  };
}

function formatBytes(size) {
  if (!size || Number.isNaN(size)) return "grootte onbekend";
  const units = ["B", "KB", "MB", "GB"];
  let value = size;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value >= 10 || unitIndex === 0 ? Math.round(value) : value.toFixed(1)} ${units[unitIndex]}`;
}

function friendlyContentType(contentType = "") {
  const type = contentType.toLowerCase();
  if (!type) return "Bestand";
  if (type.includes("pdf")) return "PDF";
  if (type.startsWith("image/")) return `Afbeelding ${type.replace("image/", "").toUpperCase()}`;
  if (type.startsWith("text/")) return "Tekstbestand";
  if (type.includes("spreadsheet") || type.includes("excel")) return "Spreadsheet";
  if (type.includes("wordprocessing") || type.includes("msword")) return "Document";
  if (type.includes("zip") || type.includes("compressed")) return "Archief";
  return contentType.split(";")[0];
}

function attachmentUrl(message, attachment, disposition) {
  return `/api/messages/${encodeURIComponent(message.folder)}/${encodeURIComponent(message.id)}/attachments/${encodeURIComponent(
    attachment.id
  )}?disposition=${disposition}`;
}

function messageKey(message) {
  return message ? `${message.folder}:${message.id}` : "";
}

function loadMessageMarks() {
  try {
    return JSON.parse(localStorage.getItem("ketelpost-message-marks") || "{}");
  } catch {
    return {};
  }
}

function applyMessageMarks(message, marks) {
  const mark = marks[messageKey(message)] || {};
  return {
    ...message,
    starred: mark.starred ?? message.starred,
    urgent: mark.urgent ?? message.urgent ?? false
  };
}

function messageTextForTranslation(message) {
  return (message?.bodyText || message?.body || message?.preview || "").replace(/\n{4,}/g, "\n\n").trim();
}

function messageTranslationPayload(message) {
  const subject = String(message?.subject || "(geen onderwerp)").trim();
  const body = messageTextForTranslation(message);
  return `Onderwerp:\n${subject}\n\nBericht:\n${body}`;
}

function splitTranslatedMessage(value = "", fallbackSubject = "") {
  const text = String(value || "").trim();
  const match = text.match(/onderwerp\s*:\s*([\s\S]*?)\n\s*bericht\s*:\s*([\s\S]*)/i);
  if (match) {
    return {
      subject: match[1].trim() || fallbackSubject,
      body: match[2].trim()
    };
  }
  return {
    subject: fallbackSubject,
    body: text
  };
}

function isImageAttachment(attachment) {
  const type = String(attachment?.contentType || "").toLowerCase();
  const name = String(attachment?.name || "").toLowerCase();
  return type.startsWith("image/") || /\.(png|jpe?g|gif|webp|bmp|avif)$/i.test(name);
}

function loadAutoTranslateSetting() {
  if (localStorage.getItem("ketelmeel-auto-translate-language-flow") !== "true") return true;
  return localStorage.getItem("librepost-auto-translate") !== "false";
}

const defaultSignatureSettings = {
  autoInsert: true,
  defaultFormat: "text",
  text: "Met vriendelijke groet,",
  html: "<p>Met vriendelijke groet,</p>"
};

function normalizeSignatureSettings(settings = {}) {
  return {
    ...defaultSignatureSettings,
    ...settings,
    autoInsert: settings.autoInsert !== false,
    defaultFormat: settings.defaultFormat === "html" ? "html" : "text"
  };
}

function loadSignatureSettings() {
  try {
    return normalizeSignatureSettings(JSON.parse(localStorage.getItem("ketelmeel-signature-settings") || "{}"));
  } catch {
    return defaultSignatureSettings;
  }
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function plainTextToHtml(value = "") {
  return escapeHtml(value)
    .split(/\r?\n/)
    .map((line) => (line ? line : "<br>"))
    .join("<br>");
}

function htmlToPlainText(value = "") {
  if (typeof document === "undefined") return String(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const element = document.createElement("div");
  element.innerHTML = String(value)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n");
  return (element.textContent || "").replace(/\n{3,}/g, "\n\n").trim();
}

function appendWithGap(current = "", addition = "") {
  const extra = String(addition || "").trim();
  if (!extra) return current;
  const base = String(current || "").trimEnd();
  return base ? `${base}\n\n${extra}` : extra;
}

function appendHtmlWithGap(current = "", addition = "") {
  const extra = String(addition || "").trim();
  if (!extra) return current;
  const base = String(current || "").trim();
  return base ? `${base}<br><br>${extra}` : extra;
}

const languageLabels = {
  af: "Afrikaans",
  ar: "Arabisch",
  bs: "Bosnisch",
  bg: "Bulgaars",
  ca: "Catalaans",
  cs: "Tsjechisch",
  da: "Deens",
  de: "Duits",
  el: "Grieks",
  en: "Engels",
  es: "Spaans",
  et: "Ests",
  fi: "Fins",
  fr: "Frans",
  he: "Hebreeuws",
  hi: "Hindi",
  hr: "Kroatisch",
  hu: "Hongaars",
  id: "Indonesisch",
  it: "Italiaans",
  ja: "Japans",
  ko: "Koreaans",
  nl: "Nederlands",
  no: "Noors",
  pl: "Pools",
  pt: "Portugees",
  ro: "Roemeens",
  ru: "Russisch",
  sk: "Slowaaks",
  sl: "Sloveens",
  sr: "Servisch",
  sv: "Zweeds",
  tr: "Turks",
  uk: "Oekraïens",
  ur: "Urdu",
  vi: "Vietnamees",
  zh: "Chinees"
};

function normalizeLanguage(value = "") {
  return String(value || "").trim().toLowerCase().slice(0, 2);
}

function languageLabel(value = "") {
  const code = normalizeLanguage(value);
  return languageLabels[code] || (code ? code.toUpperCase() : "onbekende taal");
}

function shouldTranslateReplyTo(language = "") {
  const code = normalizeLanguage(language);
  return Boolean(code && code !== "nl" && code !== "au");
}

function replySubject(subject = "") {
  return /^re:/i.test(subject) ? subject : `Re: ${subject || "(geen onderwerp)"}`;
}

function composeInitialForm(signature, context = null, defaultFrom = "") {
  const settings = normalizeSignatureSettings(signature);
  const format = settings.defaultFormat;
  const textSignature = settings.text || htmlToPlainText(settings.html);
  const htmlSignature = settings.html || plainTextToHtml(settings.text);
  return {
    from: defaultFrom,
    to: context?.to || "",
    subject: context?.subject || "",
    body: settings.autoInsert ? textSignature : "",
    htmlBody: settings.autoInsert ? htmlSignature : "",
    format
  };
}

function loadMusicQueue() {
  try {
    return JSON.parse(localStorage.getItem("ketelmeel-music-queue") || "[]");
  } catch {
    return [];
  }
}

function loadLogoThemeVars() {
  try {
    return JSON.parse(localStorage.getItem("ketelmeel-logo-theme-vars") || "null");
  } catch {
    return null;
  }
}

function loadSenderSettings() {
  try {
    const parsed = JSON.parse(localStorage.getItem("ketelmeel-sender-settings") || "{}");
    return {
      defaultFrom: parsed.defaultFrom || "",
      identities: Array.isArray(parsed.identities) ? parsed.identities.filter(Boolean) : []
    };
  } catch {
    return { defaultFrom: "", identities: [] };
  }
}

function loadFeedSettings() {
  try {
    const parsed = JSON.parse(localStorage.getItem("ketelmeel-feed-settings") || "{}");
    return {
      scrollSeconds: Math.max(600, Math.min(1800, Number(parsed.scrollSeconds || 1200))),
      refreshMode: parsed.refreshMode === "fast" ? "fast" : "normal",
      limit: Math.max(1, Math.min(60, Number(parsed.limit || 18))),
      latestFirst: parsed.latestFirst !== false,
      customSources: String(parsed.customSources || "")
    };
  } catch {
    return { scrollSeconds: 1200, refreshMode: "normal", limit: 18, latestFirst: true, customSources: "" };
  }
}

function normalizeSenderOptions(settings, mailbox = "") {
  const options = [mailbox, settings.defaultFrom, ...(settings.identities || [])]
    .map((item) => String(item || "").trim())
    .filter(Boolean);
  return [...new Set(options)];
}

function rgbToHex({ r, g, b }) {
  return `#${[r, g, b].map((value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0")).join("")}`;
}

function mixRgb(color, target, amount) {
  return {
    r: color.r + (target.r - color.r) * amount,
    g: color.g + (target.g - color.g) * amount,
    b: color.b + (target.b - color.b) * amount
  };
}

function colorLuminance(color) {
  return (0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b) / 255;
}

function colorSaturation(color) {
  const max = Math.max(color.r, color.g, color.b);
  const min = Math.min(color.r, color.g, color.b);
  return max ? (max - min) / max : 0;
}

function buildLogoThemeVars(colors) {
  const white = { r: 255, g: 255, b: 255 };
  const black = { r: 0, g: 0, b: 0 };
  const byCount = [...colors].sort((a, b) => b.count - a.count);
  const bySaturation = [...colors].sort((a, b) => colorSaturation(b) * b.count - colorSaturation(a) * a.count);
  const darkest = [...colors].sort((a, b) => colorLuminance(a) - colorLuminance(b))[0] || { r: 96, g: 16, b: 96 };
  const accent = bySaturation.find((color) => colorLuminance(color) > 0.12 && colorLuminance(color) < 0.82) || byCount[0] || darkest;
  const secondary = byCount.find((color) => rgbToHex(color) !== rgbToHex(accent)) || accent;
  const rose = bySaturation[0] || accent;
  const lightBg = mixRgb(accent, white, 0.92);
  const lightSoft = mixRgb(accent, white, 0.96);
  const lightDeep = mixRgb(accent, white, 0.82);
  const darkBg = mixRgb(darkest, black, 0.48);
  const darkPanel = mixRgb(darkest, black, 0.30);

  return {
    light: {
      "--bg": rgbToHex(lightBg),
      "--panel": "#ffffff",
      "--panel-soft": rgbToHex(lightSoft),
      "--panel-deep": rgbToHex(lightDeep),
      "--border": rgbToHex(mixRgb(accent, white, 0.70)),
      "--ink": rgbToHex(mixRgb(darkest, black, 0.18)),
      "--ink-soft": rgbToHex(mixRgb(darkest, white, 0.42)),
      "--accent": rgbToHex(accent),
      "--accent-dark": rgbToHex(mixRgb(darkest, black, 0.06)),
      "--sky": rgbToHex(secondary),
      "--gold": rgbToHex(mixRgb(secondary, white, 0.18)),
      "--rose": rgbToHex(rose)
    },
    dark: {
      "--bg": rgbToHex(darkBg),
      "--panel": rgbToHex(darkPanel),
      "--panel-soft": rgbToHex(mixRgb(darkPanel, white, 0.08)),
      "--panel-deep": rgbToHex(mixRgb(darkPanel, white, 0.15)),
      "--border": "rgba(235, 215, 238, 0.20)",
      "--ink": "#fff7ff",
      "--ink-soft": "#d9c4dc",
      "--accent": rgbToHex(rose),
      "--accent-dark": rgbToHex(accent),
      "--sky": rgbToHex(mixRgb(secondary, white, 0.25)),
      "--gold": rgbToHex(mixRgb(rose, white, 0.22)),
      "--rose": rgbToHex(rose)
    }
  };
}

function extractLogoThemeVars(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const size = 96;
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      context.drawImage(image, 0, 0, size, size);
      const { data } = context.getImageData(0, 0, size, size);
      const counts = new Map();

      for (let index = 0; index < data.length; index += 16) {
        const alpha = data[index + 3];
        if (alpha < 128) continue;
        const color = { r: data[index], g: data[index + 1], b: data[index + 2] };
        if (color.r > 245 && color.g > 245 && color.b > 245) continue;
        const key = [color.r, color.g, color.b].map((value) => Math.round(value / 16) * 16).join(",");
        counts.set(key, (counts.get(key) || 0) + 1);
      }

      const colors = [...counts.entries()]
        .map(([key, count]) => {
          const [r, g, b] = key.split(",").map((value) => Math.max(0, Math.min(255, Number(value))));
          return { r, g, b, count };
        })
        .filter((color) => color.count > 1);

      resolve(colors.length ? buildLogoThemeVars(colors) : null);
    };
    image.onerror = () => reject(new Error("Logo-kleuren konden niet worden gelezen."));
    image.src = dataUrl;
  });
}

function parseYouTubeMusicUrl(rawUrl) {
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  if (!host.includes("youtube.com") && host !== "youtu.be") return null;
  const parts = url.pathname.split("/").filter(Boolean);
  const list = url.searchParams.get("list") || "";
  let videoId = "";

  if (host === "youtu.be") videoId = parts[0] || "";
  if (host.includes("youtube.com")) {
    if (parts[0] === "watch") videoId = url.searchParams.get("v") || "";
    if (parts[0] === "embed") videoId = parts[1] || "";
    if (parts[0] === "shorts") videoId = parts[1] || "";
  }

  if (list) {
    return {
      provider: "youtube",
      sourceLabel: "YouTube",
      title: "YouTube playlist",
      subtitle: list,
      embedUrl: `https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(list)}&rel=0&modestbranding=1`,
      externalUrl: rawUrl
    };
  }

  if (videoId) {
    return {
      provider: "youtube",
      sourceLabel: "YouTube",
      title: "YouTube video",
      subtitle: videoId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?rel=0&modestbranding=1`,
      externalUrl: rawUrl
    };
  }

  return null;
}

function parseSpotifyMusicUrl(rawUrl) {
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  if (!host.includes("spotify.com")) return null;
  const parts = url.pathname.split("/").filter(Boolean);
  const offset = parts[0] === "embed" ? 1 : 0;
  const type = parts[offset] || "";
  const id = parts[offset + 1] || "";
  const allowed = ["playlist", "album", "track", "episode", "show", "artist"];
  if (!allowed.includes(type) || !id) return null;

  return {
    provider: "spotify",
    sourceLabel: "Spotify",
    title: `Spotify ${type}`,
    subtitle: id,
    embedUrl: `https://open.spotify.com/embed/${encodeURIComponent(type)}/${encodeURIComponent(id)}?utm_source=generator`,
    externalUrl: rawUrl
  };
}

function parseMusicUrl(rawUrl) {
  const value = rawUrl.trim();
  if (!value) throw new Error("Plak eerst een YouTube of Spotify link.");
  const parsed = parseYouTubeMusicUrl(value) || parseSpotifyMusicUrl(value);
  if (!parsed) throw new Error("Deze link wordt nog niet herkend. Gebruik een publieke YouTube of Spotify link.");
  return {
    ...parsed,
    id: `${parsed.provider}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  };
}

function clampSidebarWidth(value) {
  const width = Number(value) || 238;
  return Math.max(176, Math.min(340, Math.round(width)));
}

function clampMessageListWidth(value) {
  const width = Number(value) || 390;
  return Math.max(260, Math.min(640, Math.round(width)));
}

function clampMessageListHeight(value) {
  const height = Number(value) || 360;
  return Math.max(220, Math.min(680, Math.round(height)));
}

function App() {
  const [status, setStatus] = useState({ mode: "demo", mailbox: "demo@ketelmeel.local" });
  const [folders, setFolders] = useState(fallbackFolders);
  const [activeFolder, setActiveFolder] = useState("Inbox");
  const [activeSmartFolder, setActiveSmartFolder] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [readerView, setReaderView] = useState("view");
  const [query, setQuery] = useState("");
  const [focusMode, setFocusMode] = useState("Alles");
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeContext, setComposeContext] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(() => clampSidebarWidth(localStorage.getItem("ketelmeel-sidebar-width") || 238));
  const [messageListWidth, setMessageListWidth] = useState(() => clampMessageListWidth(localStorage.getItem("ketelmeel-message-list-width") || 390));
  const [messageListHeight, setMessageListHeight] = useState(() => clampMessageListHeight(localStorage.getItem("ketelmeel-message-list-height") || 360));
  const [overviewExpanded, setOverviewExpanded] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("librepost-theme") || "light");
  const [templateId, setTemplateId] = useState(() => localStorage.getItem("librepost-template") || templatePresets[0].id);
  const [layoutMode, setLayoutMode] = useState(() => localStorage.getItem("librepost-layout") || templatePresets[0].layoutMode);
  const [density, setDensity] = useState(() => localStorage.getItem("librepost-density") || templatePresets[0].density);
  const [logoDataUrl, setLogoDataUrl] = useState(() => localStorage.getItem("ketelpost-logo") || "");
  const [logoSize, setLogoSize] = useState(() => Number(localStorage.getItem("ketelpost-logo-size") || 42));
  const [logoBackdrop, setLogoBackdrop] = useState(() => localStorage.getItem("ketelmeel-logo-backdrop") || "white");
  const [logoThemeVars, setLogoThemeVars] = useState(loadLogoThemeVars);
  const [senderSettings, setSenderSettings] = useState(loadSenderSettings);
  const [activeMailbox, setActiveMailbox] = useState(() => localStorage.getItem("ketelmeel-active-mailbox") || "");
  const [pendingMailboxSetup, setPendingMailboxSetup] = useState("");
  const [feedSettings, setFeedSettings] = useState(loadFeedSettings);
  const [signature, setSignature] = useState(loadSignatureSettings);
  const [autoTranslate, setAutoTranslate] = useState(loadAutoTranslateSetting);
  const [messageMarks, setMessageMarks] = useState(loadMessageMarks);
  const [translationCache, setTranslationCache] = useState({});
  const [translationError, setTranslationError] = useState("");
  const [translatingId, setTranslatingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [folderMenu, setFolderMenu] = useState(null);
  const [spamCleaning, setSpamCleaning] = useState(false);
  const [connectionError, setConnectionError] = useState("");
  const [toast, setToast] = useState("");
  const [governmentFeed, setGovernmentFeed] = useState({ items: [], refreshedAt: "", loading: true, error: "" });
  const [governmentFeedIndex, setGovernmentFeedIndex] = useState(0);
  const [draggedMessage, setDraggedMessage] = useState(null);
  const [dragOverFolder, setDragOverFolder] = useState("");
  const [movingMessageKey, setMovingMessageKey] = useState("");
  const mailboxOptions = useMemo(() => normalizeSenderOptions(senderSettings, status.mailbox), [senderSettings, status.mailbox]);

  async function loadMailbox(folder = activeFolder) {
    setLoading(true);
    setConnectionError("");
    try {
      const nextStatus = await api("/api/status");
      setStatus(nextStatus);
      if (!nextStatus.configComplete) {
        setFolders(fallbackFolders);
        setMessages([]);
        setSelectedId(null);
        setSettingsOpen(true);
        setToast("Vul eerst je mailinstellingen in.");
        return;
      }
      const nextFolders = await api("/api/folders");
      const usableFolders = nextFolders.length ? nextFolders : fallbackFolders;
      const targetFolder =
        usableFolders.includes(folder) || usableFolders.length === 0
          ? folder
          : usableFolders.find((name) => /^(inbox|postvak in)$/i.test(name)) || usableFolders[0];
      if (targetFolder !== activeFolder) setActiveFolder(targetFolder);
      const nextMessages = await api(`/api/messages?folder=${encodeURIComponent(targetFolder)}`);
      setFolders(usableFolders);
      setMessages(nextMessages);
      setSelectedId(nextMessages[0]?.id || null);
    } catch (error) {
      setToast(error.message);
      setConnectionError(error.message);
      setMessages([]);
      setSelectedId(null);
      if (error.message.includes("Ontbrekende mailinstellingen")) {
        setSettingsOpen(true);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMailbox(activeFolder);
  }, [activeFolder]);

  function governmentFeedPath(refresh = false) {
    const params = new URLSearchParams();
    if (refresh) params.set("refresh", "1");
    params.set("limit", String(feedSettings.limit));
    params.set("latestFirst", feedSettings.latestFirst ? "1" : "0");
    const customSources = feedSettings.customSources
      .split(/\r?\n/)
      .map((source) => source.trim())
      .filter(Boolean);
    if (customSources.length) params.set("sources", JSON.stringify(customSources));
    return `/api/government-feeds?${params.toString()}`;
  }

  useEffect(() => {
    let alive = true;
    let intervalId;

    async function loadGovernmentFeed(refresh = false) {
      try {
        const feed = await api(governmentFeedPath(refresh));
        if (!alive) return;
        setGovernmentFeed({ ...feed, loading: false, error: "" });
        setGovernmentFeedIndex(0);
      } catch (error) {
        if (!alive) return;
        setGovernmentFeed((current) => ({ ...current, loading: false, error: error.message }));
      }
    }

    loadGovernmentFeed();
    intervalId = window.setInterval(() => loadGovernmentFeed(true), feedSettings.refreshMode === "fast" ? 300000 : 1800000);
    return () => {
      alive = false;
      window.clearInterval(intervalId);
    };
  }, [feedSettings]);

  useEffect(() => {
    if (governmentFeed.items.length < 2) return undefined;
    const intervalId = window.setInterval(() => {
      setGovernmentFeedIndex((current) => (current + 1) % governmentFeed.items.length);
    }, 7500);
    return () => window.clearInterval(intervalId);
  }, [governmentFeed.items.length]);

  useEffect(() => {
    if (!selectedId) {
      setSelectedMessage(null);
      return;
    }
    api(`/api/messages/${encodeURIComponent(activeFolder)}/${encodeURIComponent(selectedId)}`)
      .then((message) => {
        setSelectedMessage(message);
        setMessages((current) =>
          current.map((item) => (item.id === selectedId && item.folder === activeFolder ? { ...item, read: true } : item))
        );
      })
      .catch((error) => setToast(error.message));
  }, [activeFolder, selectedId]);

  useEffect(() => {
    if (selectedMessage) setReaderView(selectedMessage.preferredView === "html" ? "view" : "text");
  }, [selectedMessage?.id]);

  useEffect(() => {
    if (selectedId) setOverviewExpanded(false);
  }, [selectedId]);

  useEffect(() => {
    function onKeyDown(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
      }
      if (event.key === "Escape") {
        setCommandOpen(false);
        setSettingsOpen(false);
        setFolderMenu(null);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    function closeFolderMenu(event) {
      if (event.button !== 0 || event.target?.closest?.(".folder-context-menu")) return;
      setFolderMenu(null);
    }

    window.addEventListener("pointerdown", closeFolderMenu);
    window.addEventListener("resize", closeFolderMenu);
    window.addEventListener("scroll", closeFolderMenu, true);
    return () => {
      window.removeEventListener("pointerdown", closeFolderMenu);
      window.removeEventListener("resize", closeFolderMenu);
      window.removeEventListener("scroll", closeFolderMenu, true);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("librepost-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("librepost-template", templateId);
  }, [templateId]);

  useEffect(() => {
    localStorage.setItem("librepost-layout", layoutMode);
  }, [layoutMode]);

  useEffect(() => {
    localStorage.setItem("librepost-density", density);
  }, [density]);

  useEffect(() => {
    localStorage.setItem("ketelmeel-sidebar-width", String(sidebarWidth));
  }, [sidebarWidth]);

  useEffect(() => {
    localStorage.setItem("ketelmeel-message-list-width", String(messageListWidth));
  }, [messageListWidth]);

  useEffect(() => {
    localStorage.setItem("ketelmeel-message-list-height", String(messageListHeight));
  }, [messageListHeight]);

  useEffect(() => {
    if (logoDataUrl) localStorage.setItem("ketelpost-logo", logoDataUrl);
    else localStorage.removeItem("ketelpost-logo");
  }, [logoDataUrl]);

  useEffect(() => {
    localStorage.setItem("ketelpost-logo-size", String(logoSize));
  }, [logoSize]);

  useEffect(() => {
    localStorage.setItem("ketelmeel-logo-backdrop", logoBackdrop);
  }, [logoBackdrop]);

  useEffect(() => {
    if (logoThemeVars) localStorage.setItem("ketelmeel-logo-theme-vars", JSON.stringify(logoThemeVars));
    else localStorage.removeItem("ketelmeel-logo-theme-vars");
  }, [logoThemeVars]);

  useEffect(() => {
    localStorage.setItem("ketelmeel-sender-settings", JSON.stringify(senderSettings));
  }, [senderSettings]);

  useEffect(() => {
    if (!mailboxOptions.length) return;
    if (!activeMailbox || !mailboxOptions.includes(activeMailbox)) {
      setActiveMailbox(status.mailbox || mailboxOptions[0]);
    }
  }, [activeMailbox, mailboxOptions, status.mailbox]);

  useEffect(() => {
    if (activeMailbox) localStorage.setItem("ketelmeel-active-mailbox", activeMailbox);
    else localStorage.removeItem("ketelmeel-active-mailbox");
  }, [activeMailbox]);

  useEffect(() => {
    localStorage.setItem("ketelmeel-feed-settings", JSON.stringify(feedSettings));
  }, [feedSettings]);

  useEffect(() => {
    localStorage.setItem("ketelmeel-signature-settings", JSON.stringify(signature));
  }, [signature]);

  useEffect(() => {
    localStorage.setItem("ketelmeel-auto-translate-language-flow", "true");
    localStorage.setItem("librepost-auto-translate", autoTranslate ? "true" : "false");
  }, [autoTranslate]);

  useEffect(() => {
    localStorage.setItem("ketelpost-message-marks", JSON.stringify(messageMarks));
  }, [messageMarks]);

  const enrichedMessages = useMemo(
    () =>
      messages.map((message) => {
        const marked = applyMessageMarks(message, messageMarks);
        return {
          ...marked,
          priority: inferPriority(marked)
        };
      }),
    [messages, messageMarks]
  );

  const smartScopedMessages = useMemo(
    () => enrichedMessages.filter((message) => matchesSmartFolder(message, activeSmartFolder)),
    [enrichedMessages, activeSmartFolder]
  );

  const filteredMessages = useMemo(() => {
    const term = query.trim().toLowerCase();
    return smartScopedMessages.filter((message) => {
      const matchesSearch = !term || searchableMessageText(message).includes(term);
      const matchesFocus = matchesFocusMode(message, focusMode);
      return matchesSearch && matchesFocus;
    });
  }, [smartScopedMessages, focusMode, query]);

  const stats = useMemo(() => {
    const unread = enrichedMessages.filter((message) => !message.read).length;
    const important = enrichedMessages.filter((message) => message.priority === "Hoog").length;
    const attachments = enrichedMessages.filter((message) => (message.attachments || []).length).length;
    return { unread, important, attachments };
  }, [enrichedMessages]);

  const tabCounts = useMemo(
    () =>
      Object.fromEntries(
        focusTabs.map((tab) => [tab.id, smartScopedMessages.filter((message) => matchesFocusMode(message, tab.id)).length])
      ),
    [smartScopedMessages]
  );

  const smartFolderCounts = useMemo(
    () =>
      Object.fromEntries(
        smartFolders.map((folder) => [folder.id, enrichedMessages.filter((message) => matchesSmartFolder(message, folder.id)).length])
      ),
    [enrichedMessages]
  );

  const activeSmartFolderMeta = smartFolders.find((folder) => folder.id === activeSmartFolder) || null;

  const detectedSpamFolder = useMemo(() => findSpamFolderName(folders), [folders]);
  const contextSpamFolder = folderMenu ? (isSpamFolderName(folderMenu.folder) ? folderMenu.folder : detectedSpamFolder) : "";

  const selectedEnriched = useMemo(() => {
    if (!selectedMessage) return null;
    const marked = applyMessageMarks(selectedMessage, messageMarks);
    return { ...marked, priority: inferPriority(marked) };
  }, [selectedMessage, messageMarks]);
  const selectedMessageKey = messageKey(selectedEnriched);
  const selectedTranslation = selectedMessageKey ? translationCache[selectedMessageKey] : null;
  const translationBusy = Boolean(selectedMessageKey && translatingId === selectedMessageKey);

  useEffect(() => {
    if (loading) return;
    if (!filteredMessages.length) {
      if (selectedId) setSelectedId(null);
      return;
    }
    if (!filteredMessages.some((message) => message.id === selectedId)) setSelectedId(filteredMessages[0].id);
  }, [filteredMessages, loading, selectedId]);

  async function translateMessage(message = selectedEnriched, automatic = false) {
    if (!message) return;
    const key = messageKey(message);
    if (translationCache[key] && automatic) return translationCache[key];
    const text = messageTranslationPayload(message);
    if (!text) {
      if (!automatic) setTranslationError("Geen tekst gevonden om te vertalen.");
      return null;
    }

    setTranslatingId(key);
    setTranslationError("");
    try {
      const result = await api("/api/translate", {
        method: "POST",
        body: JSON.stringify({ text, source: "auto", target: "nl" })
      });
      const parsed = splitTranslatedMessage(result.translatedText, message.subject);
      const translated = {
        ...result,
        translatedSubject: parsed.subject,
        translatedBody: parsed.body || result.translatedText
      };
      setTranslationCache((current) => ({ ...current, [key]: translated }));
      return translated;
    } catch (error) {
      setTranslationError(error.message);
      if (!automatic) setToast(error.message);
      return null;
    } finally {
      setTranslatingId((current) => (current === key ? "" : current));
    }
  }

  function openCompose(context = null) {
    setComposeContext(context);
    setComposeOpen(true);
  }

  function closeCompose() {
    setComposeOpen(false);
    setComposeContext(null);
  }

  async function openReply(message) {
    if (!message) return;
    const key = messageKey(message);
    let translation = translationCache[key];
    if (!translation) {
      setToast("Taal bepalen en bericht naar Nederlands vertalen...");
      translation = await translateMessage(message, true);
    }
    const sourceLanguage = normalizeLanguage(translation?.sourceLanguage || "");
    const targetLanguage = shouldTranslateReplyTo(sourceLanguage) ? sourceLanguage : "";
    const replyBaseSubject = translation?.translatedSubject || message.subject;
    openCompose({
      mode: "reply",
      to: message.from,
      subject: replySubject(replyBaseSubject),
      sourceLanguage,
      targetLanguage
    });
  }

  useEffect(() => {
    setTranslationError("");
    if (autoTranslate && selectedEnriched) translateMessage(selectedEnriched, true);
  }, [autoTranslate, selectedMessage?.id]);

  function toggleMessageMark(message, field) {
    if (!message) return;
    const key = messageKey(message);
    const currentValue = Boolean(message[field]);
    setMessageMarks((marks) => {
      const nextMarks = {
        ...marks,
        [key]: {
          ...(marks[key] || {}),
          [field]: !currentValue
        }
      };
      localStorage.setItem("ketelpost-message-marks", JSON.stringify(nextMarks));
      return nextMarks;
    });
    setToast(
      field === "starred"
        ? currentValue
          ? "Gele ster verwijderd."
          : "Gele ster toegewezen."
        : currentValue
          ? "Rood uitroepteken verwijderd."
          : "Rood uitroepteken toegewezen."
    );
  }

  function handleMessageDragStart(event, message) {
    const payload = {
      id: message.id,
      folder: message.folder,
      subject: message.subject
    };
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("application/x-ketelmeel-message", JSON.stringify(payload));
    event.dataTransfer.setData("text/plain", `${message.subject} -> map`);
    setDraggedMessage(payload);
    setDragOverFolder("");
  }

  function handleMessageDragEnd() {
    setDraggedMessage(null);
    setDragOverFolder("");
  }

  function messageFromDrop(event) {
    const raw = event.dataTransfer.getData("application/x-ketelmeel-message");
    if (!raw) return draggedMessage;
    try {
      return JSON.parse(raw);
    } catch {
      return draggedMessage;
    }
  }

  function handleFolderDragOver(event, folder) {
    if (!draggedMessage) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = draggedMessage.folder === folder ? "none" : "move";
    setDragOverFolder(folder);
  }

  function handleFolderDragLeave(event, folder) {
    if (event.relatedTarget && event.currentTarget.contains(event.relatedTarget)) return;
    setDragOverFolder((current) => (current === folder ? "" : current));
  }

  async function moveMessageToFolder(message, targetFolder) {
    if (!message?.id || !message?.folder || !targetFolder) return;
    if (message.folder === targetFolder) {
      setToast(`Bericht staat al in ${targetFolder}.`);
      setDraggedMessage(null);
      setDragOverFolder("");
      return;
    }

    const sourceKey = `${message.folder}:${message.id}`;
    setMovingMessageKey(sourceKey);
    try {
      const result = await api(`/api/messages/${encodeURIComponent(message.folder)}/${encodeURIComponent(message.id)}/move`, {
        method: "POST",
        body: JSON.stringify({ targetFolder })
      });
      const nextId = result.id || message.id;
      const nextFolder = result.targetFolder || targetFolder;
      const nextKey = `${nextFolder}:${nextId}`;

      setMessageMarks((marks) => {
        if (!marks[sourceKey]) return marks;
        const nextMarks = { ...marks, [nextKey]: marks[sourceKey] };
        delete nextMarks[sourceKey];
        return nextMarks;
      });

      if (selectedId === message.id && activeFolder === message.folder) {
        setSelectedId(null);
        setSelectedMessage(null);
      }

      await loadMailbox(activeFolder);
      setToast(`Bericht verplaatst naar ${nextFolder}.`);
    } catch (error) {
      setToast(error.message);
    } finally {
      setMovingMessageKey("");
      setDraggedMessage(null);
      setDragOverFolder("");
    }
  }

  async function handleFolderDrop(event, targetFolder) {
    event.preventDefault();
    const message = messageFromDrop(event);
    await moveMessageToFolder(message, targetFolder);
  }

  async function openMailboxChoice(mailbox) {
    if (!mailbox) return;
    setActiveMailbox(mailbox);
    setActiveSmartFolder("");

    if (mailbox === status.mailbox) {
      await loadMailbox(activeFolder);
      setToast(`Mailbox geopend: ${mailbox}`);
      return;
    }

    setPendingMailboxSetup(mailbox);
    setSettingsOpen(true);
    setToast(`${mailbox} staat klaar. Vul wachtwoord/app-wachtwoord en IMAP/SMTP in om deze mailbox te openen.`);
  }

  function ensureActionReady(actionLabel) {
    if (!selectedEnriched) {
      setToast(`Kies eerst een e-mail om ${actionLabel.toLowerCase()} uit te voeren.`);
      return false;
    }
    if (!status.configComplete) {
      setSettingsOpen(true);
      setToast("Vul bij Serverinstellingen je mailbox, wachtwoord/app-wachtwoord, IMAP server en SMTP server in. Daarna werken de mailknoppen automatisch.");
      return false;
    }
    return true;
  }

  async function moveSelectedToSpecialFolder(kind) {
    const label = kind === "trash" ? "Verwijderen" : "Archiveren";
    if (!ensureActionReady(label)) return;
    const targetFolder = kind === "trash" ? findTrashFolderName(folders) : findArchiveFolderName(folders);
    if (!targetFolder) {
      setToast(
        kind === "trash"
          ? "Geen prullenbak gevonden. Maak in je mailserver een map Trash, Afval of Prullenbak en klik daarna op Vernieuw."
          : "Geen archiefmap gevonden. Maak in je mailserver een map Archive of Archief en klik daarna op Vernieuw."
      );
      return;
    }
    await moveMessageToFolder(selectedEnriched, targetFolder);
  }

  function fakeAction(label) {
    setToast(`${label} klaargezet. In echte mailbox-modus koppel je dit aan IMAP-acties of regels.`);
  }

  function openFolderMenu(event, folder) {
    event.preventDefault();
    const width = 260;
    const height = 292;
    setFolderMenu({
      folder,
      x: Math.max(8, Math.min(event.clientX, window.innerWidth - width - 8)),
      y: Math.max(8, Math.min(event.clientY, window.innerHeight - height - 8))
    });
  }

  function applyFolderFilter(folder, mode = "Alles") {
    setActiveSmartFolder("");
    setActiveFolder(folder);
    setFocusMode(mode);
    setQuery("");
    setSidebarOpen(false);
    setFolderMenu(null);
    setToast(`Filter actief: ${folder} · ${mode}.`);
  }

  function openSmartFolder(folderId) {
    const targetFolder = findInboxFolderName(folders);
    setActiveSmartFolder(folderId);
    setFocusMode("Alles");
    setQuery("");
    setSidebarOpen(false);
    if (activeFolder !== targetFolder) setActiveFolder(targetFolder);
  }

  async function runSpamCleaner(folder) {
    const targetFolder = folder || contextSpamFolder;
    if (!targetFolder || spamCleaning) return;
    setSpamCleaning(true);
    try {
      const result = await api("/api/spam-cleaner", { method: "POST", body: JSON.stringify({ folder: targetFolder }) });
      setToast(
        result.removed === 1
          ? `Spam opruimer klaar: 1 bericht verwijderd uit ${result.folder}.`
          : `Spam opruimer klaar: ${result.removed} berichten verwijderd uit ${result.folder}.`
      );
      setFolderMenu(null);
      if (activeFolder === result.folder) await loadMailbox(result.folder);
    } catch (error) {
      setToast(error.message);
    } finally {
      setSpamCleaning(false);
    }
  }

  function updateAppearance(next) {
    if (next.theme) setTheme(next.theme);
    if (next.templateId) setTemplateId(next.templateId);
    if (next.layoutMode) setLayoutMode(next.layoutMode);
    if (next.density) setDensity(next.density);
    if ("logoDataUrl" in next) setLogoDataUrl(next.logoDataUrl || "");
    if (next.logoSize) setLogoSize(Number(next.logoSize));
    if (next.logoBackdrop) setLogoBackdrop(next.logoBackdrop);
    if ("logoThemeVars" in next) setLogoThemeVars(next.logoThemeVars || null);
  }

  function updateSignature(next) {
    setSignature((current) => normalizeSignatureSettings({ ...current, ...next }));
  }

  function startSidebarResize(event) {
    if (event.button !== 0) return;
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = sidebarWidth;
    document.body.classList.add("resizing-sidebar");

    function move(pointerEvent) {
      setSidebarWidth(clampSidebarWidth(startWidth + pointerEvent.clientX - startX));
    }

    function stop() {
      document.body.classList.remove("resizing-sidebar");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    }

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
  }

  function startMessageListResize(event) {
    if (event.button !== 0) return;
    event.preventDefault();
    const compactStack = window.matchMedia("(max-width: 900px)").matches;
    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = messageListWidth;
    const startHeight = messageListHeight;
    document.body.classList.add("resizing-message-list");

    function move(pointerEvent) {
      if (compactStack) {
        setMessageListHeight(clampMessageListHeight(startHeight + pointerEvent.clientY - startY));
      } else {
        setMessageListWidth(clampMessageListWidth(startWidth + pointerEvent.clientX - startX));
      }
    }

    function stop() {
      document.body.classList.remove("resizing-message-list");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    }

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
  }

  const appStyle = {
    ...templateStyleFor(templateId, theme),
    ...(logoDataUrl && logoThemeVars ? logoThemeVars[theme] || {} : {}),
    "--brand-logo-size": `${logoSize}px`,
    "--sidebar-width": `${sidebarWidth}px`,
    "--message-list-width": `${messageListWidth}px`,
    "--message-list-height": `${messageListHeight}px`
  };
  const selectedTemplate = getTemplatePreset(templateId);
  const senderOptions = useMemo(() => normalizeSenderOptions(senderSettings, status.mailbox), [senderSettings, status.mailbox]);
  const overviewCompact = Boolean(selectedId && !overviewExpanded);

  return (
    <main
      className={`app-shell template-${templateId} ${theme === "dark" ? "dark" : ""} layout-${layoutMode} density-${density} logo-bg-${logoBackdrop}`}
      style={appStyle}
    >
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <button
          type="button"
          className="sidebar-resize-handle"
          onPointerDown={startSidebarResize}
          aria-label="Linker kolom versmallen of verbreden"
          title="Sleep om de linker kolom te verkleinen of vergroten"
        />
        <div className="brand-row">
          <div className={`brand-mark ${logoDataUrl ? "has-custom-logo" : ""}`}>
            {logoDataUrl ? <img src={logoDataUrl} alt="Ketel Mail logo" /> : <Mail size={22} />}
          </div>
          <div>
            <strong>Ketel Mail</strong>
            <label className="mailbox-switcher">
              <span>Mailbox openen</span>
              <select value={activeMailbox || status.mailbox} onChange={(event) => openMailboxChoice(event.target.value)}>
                {mailboxOptions.map((mailbox) => (
                  <option key={mailbox} value={mailbox}>
                    {mailbox === status.mailbox ? `${mailbox} (actief)` : mailbox}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button className="icon-button mobile-only" onClick={() => setSidebarOpen(false)} aria-label="Sluit menu">
            <X size={18} />
          </button>
        </div>

        <button className="compose-button" onClick={() => openCompose()}>
          <PenLine size={18} />
          Nieuw bericht
        </button>

        <nav className="folder-list" aria-label="Mappen">
          {folders.map((folder) => {
            const Icon = folderIcons[folder] || Inbox;
            const isActiveFolder = !activeSmartFolder && folder === activeFolder;
            const isDropTarget = dragOverFolder === folder && draggedMessage?.folder !== folder;
            const isDropReady = Boolean(draggedMessage && draggedMessage.folder !== folder);
            const isDropDisabled = Boolean(draggedMessage && draggedMessage.folder === folder);
            const folderTitle = draggedMessage
              ? isDropDisabled
                ? `Bericht staat al in ${folder}`
                : `Laat los om te verplaatsen naar ${folder}`
              : "Rechtermuisknop voor mapfilters";
            return (
              <button
                key={folder}
                data-folder-name={folder}
                className={`${isActiveFolder ? "active" : ""} ${isDropReady ? "drop-ready" : ""} ${isDropTarget ? "drop-target" : ""} ${isDropDisabled ? "drop-disabled" : ""}`}
                title={folderTitle}
                onContextMenu={(event) => openFolderMenu(event, folder)}
                onDragOver={(event) => handleFolderDragOver(event, folder)}
                onDragEnter={(event) => handleFolderDragOver(event, folder)}
                onDragLeave={(event) => handleFolderDragLeave(event, folder)}
                onDrop={(event) => handleFolderDrop(event, folder)}
                onClick={() => {
                  setActiveSmartFolder("");
                  setActiveFolder(folder);
                  setSidebarOpen(false);
                }}
              >
                <Icon size={18} />
                <span>{folder}</span>
                {folder === "Inbox" && stats.unread > 0 ? <em>{stats.unread}</em> : null}
              </button>
            );
          })}
          <div className="folder-list-divider">
            <span>Slimme mappen</span>
          </div>
          {smartFolders.map((folder) => {
            const Icon = folder.icon;
            return (
              <button
                key={folder.id}
                data-smart-folder-id={folder.id}
                className={`smart-folder-button ${activeSmartFolder === folder.id ? "active" : ""}`}
                onClick={() => openSmartFolder(folder.id)}
              >
                <Icon size={18} />
                <span>{folder.label}</span>
                <em>{smartFolderCounts[folder.id] || 0}</em>
              </button>
            );
          })}
        </nav>

        {folderMenu ? (
          <div
            className="folder-context-menu"
            role="menu"
            aria-label={`Mapacties voor ${folderMenu.folder}`}
            style={{ left: folderMenu.x, top: folderMenu.y }}
            onClick={(event) => event.stopPropagation()}
            onContextMenu={(event) => event.preventDefault()}
          >
            <div className="folder-context-heading">
              <strong>{folderMenu.folder}</strong>
              <span>RMK mapfilter</span>
            </div>
            <button type="button" role="menuitem" data-folder-action="all" onClick={() => applyFolderFilter(folderMenu.folder, "Alles")}>
              <Search size={16} />
              Filter: alles in map
            </button>
            <button type="button" role="menuitem" data-folder-action="unread" onClick={() => applyFolderFilter(folderMenu.folder, "Ongelezen")}>
              <Bell size={16} />
              Alleen ongelezen
            </button>
            <button type="button" role="menuitem" data-folder-action="important" onClick={() => applyFolderFilter(folderMenu.folder, "Belangrijk")}>
              <Zap size={16} />
              Alleen hoge prioriteit
            </button>
            <button type="button" role="menuitem" data-folder-action="attachments" onClick={() => applyFolderFilter(folderMenu.folder, "Bijlagen")}>
              <Paperclip size={16} />
              Alleen bijlagen
            </button>
            <div className="folder-context-divider" />
            <button
              type="button"
              role="menuitem"
              data-folder-action="spam-cleaner"
              className="danger"
              disabled={!contextSpamFolder || spamCleaning}
              onClick={() => runSpamCleaner(contextSpamFolder)}
            >
              <Trash2 size={16} />
              {spamCleaning ? "Spam opruimen..." : "Spam opruimer uitvoeren"}
            </button>
            <span className="folder-context-note">
              {contextSpamFolder ? `Doelmap: ${contextSpamFolder}` : "Geen spammap gevonden"}
            </span>
          </div>
        ) : null}

        <section className="smart-lanes" aria-label="Slimme lanes">
          <button onClick={() => setFocusMode("Belangrijk")}>
            <Zap size={17} />
            Prioriteit
            <em>{stats.important}</em>
          </button>
          <button onClick={() => setFocusMode("Bijlagen")}>
            <Paperclip size={17} />
            Bijlagen
            <em>{stats.attachments}</em>
          </button>
          <button onClick={() => setCommandOpen(true)}>
            <Command size={17} />
            Command center
            <kbd>Ctrl K</kbd>
          </button>
        </section>

        <div className="server-panel">
          <ShieldCheck size={18} />
          <div>
            <strong>{status.mode === "demo" ? "Demo-modus" : "Eigen server actief"}</strong>
            <span>{status.mode === "demo" ? "Koppel IMAP/SMTP wanneer je live gaat." : "Mail loopt via jouw instellingen."}</span>
          </div>
        </div>
      </aside>

      <section className="mail-area">
        <header className="topbar">
          <button className="icon-button mobile-only" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>
          <div className="search-box">
            <Search size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Zoek afzender, onderwerp, label of prioriteit" />
          </div>
          <GovernmentFeedTicker
            feed={governmentFeed}
            settings={feedSettings}
            index={governmentFeedIndex}
            onRefresh={() =>
              api(governmentFeedPath(true))
                .then((feed) => setGovernmentFeed({ ...feed, loading: false, error: "" }))
                .catch((error) => setGovernmentFeed((current) => ({ ...current, loading: false, error: error.message })))
            }
          />
          <button className="icon-button" onClick={() => setCommandOpen(true)} aria-label="Command center">
            <Command size={19} />
          </button>
          <button className="icon-button" onClick={() => loadMailbox(activeFolder)} aria-label="Vernieuw">
            <RefreshCw size={19} />
          </button>
          <button className="icon-button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Thema">
            {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          <button className="icon-button" onClick={() => setSettingsOpen(true)} aria-label="Instellingen">
            <Settings size={19} />
          </button>
        </header>

        <section className={`overview-strip ${overviewCompact ? "compact" : ""}`} aria-label="Mailbox overzicht" aria-expanded={!overviewCompact}>
          <div className="overview-metrics">
            <Metric icon={Inbox} label="Ongelezen" value={stats.unread} />
            <Metric icon={Zap} label="Belangrijk" value={stats.important} />
            <Metric icon={Paperclip} label="Bijlagen" value={stats.attachments} />
            <Metric icon={ShieldCheck} label="Modus" value={status.mode === "demo" ? "Demo" : "Live"} />
          </div>
          <button
            className="overview-toggle"
            type="button"
            onClick={() => setOverviewExpanded((current) => !current)}
            aria-label={overviewCompact ? "Overzichtsbalk uitklappen" : "Overzichtsbalk oprollen"}
          >
            {overviewCompact ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            <span>{overviewCompact ? "Meer" : selectedId ? "Rol op" : "Overzicht"}</span>
          </button>
        </section>

        {connectionError ? (
          <section className="connection-card" aria-label="Verbindingsprobleem">
            <ShieldCheck size={19} />
            <div>
              <strong>Mailverbinding werkt nog niet</strong>
              <span>{connectionError}</span>
            </div>
            <button onClick={() => setSettingsOpen(true)}>
              <Settings size={17} />
              Controleer instellingen
            </button>
          </section>
        ) : null}

        <div className="content-grid">
          <section className="message-list" aria-label="Berichten">
            <button
              type="button"
              className="message-list-resize-handle"
              onPointerDown={startMessageListResize}
              aria-label="Middelste mailkolom verkleinen of vergroten"
              title="Sleep om de mailkolom te verkleinen of vergroten"
            />
            <div className="message-list-scroll">
              <div className="section-title">
                <div>
                  <span>{activeSmartFolderMeta ? activeSmartFolderMeta.label : activeFolder}</span>
                  <strong>{filteredMessages.length} berichten</strong>
                </div>
                <div className="mail-tabs" role="tablist" aria-label="Postvak tabs">
                  {focusTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        data-tab-id={tab.id}
                        aria-selected={tab.id === focusMode}
                        className={tab.id === focusMode ? "active" : ""}
                        onClick={() => setFocusMode(tab.id)}
                      >
                        <Icon size={14} />
                        <span>{tab.label}</span>
                        <em>{tabCounts[tab.id] || 0}</em>
                      </button>
                    );
                  })}
                </div>
              </div>

              {loading ? <p className="empty-state">Mailbox laden...</p> : null}
              {!loading && filteredMessages.length === 0 ? <p className="empty-state">Geen berichten gevonden.</p> : null}

              {filteredMessages.map((message) => {
                const rowKey = messageKey(message);
                const isDragging = draggedMessage?.id === message.id && draggedMessage?.folder === message.folder;
                const isMoving = movingMessageKey === rowKey;
                return (
                  <button
                    key={message.id}
                    draggable={!isMoving}
                    data-message-id={message.id}
                    className={`message-row ${message.id === selectedId ? "selected" : ""} ${message.read ? "read" : "unread"} ${isDragging ? "dragging" : ""} ${isMoving ? "moving" : ""}`}
                    onClick={() => setSelectedId(message.id)}
                    onDragStart={(event) => handleMessageDragStart(event, message)}
                    onDragEnd={handleMessageDragEnd}
                  >
                    <div className="message-topline">
                      <strong>{message.from}</strong>
                      <span>{formatDate(message.date)}</span>
                    </div>
                    <div className="subject-line">
                      {message.urgent ? (
                        <span className="urgent-indicator" aria-label="Rood uitroepteken">
                          !
                        </span>
                      ) : null}
                      {message.starred ? <Star className="star-indicator" size={15} fill="currentColor" /> : null}
                      <span>{message.subject}</span>
                    </div>
                    <p>{message.preview}</p>
                    <div className="label-row">
                      <em className={`priority ${message.priority.toLowerCase()}`}>{message.priority}</em>
                      {message.urgent ? (
                        <em className="urgent-label" aria-label="Rood uitroepteken">
                          <CircleAlert size={13} fill="currentColor" />
                          !
                        </em>
                      ) : null}
                      {(message.labels || []).map((label) => (
                        <em key={label}>{label}</em>
                      ))}
                      {(message.attachments || []).length ? <Paperclip size={15} /> : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <article className="reader" aria-label="Geselecteerd bericht">
            {selectedEnriched ? (
              <>
                <div className="reader-toolbar">
                  <button onClick={() => moveSelectedToSpecialFolder("archive")}>
                    <Archive size={17} />
                    Archiveer
                  </button>
                  <button className="danger-action" onClick={() => moveSelectedToSpecialFolder("trash")}>
                    <Trash2 size={17} />
                    Prullenbak
                  </button>
                  <button className={`mark-button star-mark ${selectedEnriched.starred ? "active" : ""}`} onClick={() => toggleMessageMark(selectedEnriched, "starred")}>
                    <Star size={17} fill={selectedEnriched.starred ? "currentColor" : "none"} />
                    Ster
                  </button>
                  <button className={`mark-button urgent-mark ${selectedEnriched.urgent ? "active" : ""}`} onClick={() => toggleMessageMark(selectedEnriched, "urgent")}>
                    <CircleAlert size={18} fill={selectedEnriched.urgent ? "currentColor" : "none"} />
                    !
                  </button>
                  <button className={`translate-action ${selectedTranslation ? "active" : ""}`} disabled={translationBusy} onClick={() => translateMessage(selectedEnriched)}>
                    <Languages size={17} />
                    {translationBusy ? "Vertalen..." : selectedTranslation ? "Vertaald" : "Vertaal"}
                  </button>
                </div>

                <div className="reader-header">
                  <div>
                    <span>Van {selectedEnriched.from}</span>
                    <h1>{selectedTranslation?.translatedSubject || selectedEnriched.subject}</h1>
                    {selectedTranslation?.translatedSubject && selectedTranslation.translatedSubject !== selectedEnriched.subject ? (
                      <p>Origineel: {selectedEnriched.subject}</p>
                    ) : null}
                    <p>Aan {selectedEnriched.to || status.mailbox}</p>
                  </div>
                  <button className="reply-button" onClick={() => openReply(selectedEnriched)}>
                    <PenLine size={17} />
                    Beantwoorden
                  </button>
                </div>

                <section className="assistant-panel" aria-label="Assistent">
                  <div>
                    <Sparkles size={18} />
                    <strong>Slim overzicht</strong>
                  </div>
                  <p>{smartSummary(selectedEnriched)}</p>
                  <div className="suggestion-row">
                    {assistantSuggestions.slice(0, 3).map((suggestion) => (
                      <button key={suggestion} onClick={() => fakeAction(suggestion)}>
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </section>

                <div className="reader-view-toggle" aria-label="Berichtweergave">
                  <button className={readerView === "view" ? "active" : ""} onClick={() => setReaderView("view")}>
                    <Eye size={16} />
                    Weergave
                  </button>
                  <button className={readerView === "text" ? "active" : ""} onClick={() => setReaderView("text")}>
                    <FileText size={16} />
                    Tekst
                  </button>
                  <button className={readerView === "source" ? "active" : ""} onClick={() => setReaderView("source")}>
                    <Code2 size={16} />
                    Bron
                  </button>
                </div>

                <TranslationPanel
                  translation={selectedTranslation}
                  error={translationError}
                  busy={translationBusy}
                  onRetry={() => translateMessage(selectedEnriched)}
                />
                <EmailBody message={selectedEnriched} view={readerView} translation={selectedTranslation} />
                <AttachmentList message={selectedEnriched} />
              </>
            ) : (
              <div className="reader-empty">
                <Bell size={34} />
                <h1>Kies een bericht</h1>
                <p>Je mail blijft overzichtelijk met snelle mappen, zoeken en een ruim leesvenster.</p>
              </div>
            )}
          </article>

          <aside className="right-rail" aria-label="Werkpaneel">
            <section>
              <div className="rail-heading">
                <Bot size={17} />
                <strong>Assistent</strong>
              </div>
              {assistantSuggestions.map((suggestion) => (
                <button key={suggestion} onClick={() => fakeAction(suggestion)}>
                  {suggestion}
                </button>
              ))}
            </section>

            <section>
              <div className="rail-heading">
                <CalendarDays size={17} />
                <strong>Vandaag</strong>
              </div>
              <p>09:00 DNS-check</p>
              <p>13:30 Offerte opvolgen</p>
              <p>16:00 Inbox review</p>
            </section>

            <section>
              <div className="rail-heading">
                <Layers3 size={17} />
                <strong>Automatisering</strong>
              </div>
              <p>VIP-afzenders markeren</p>
              <p>Facturen naar Administratie</p>
              <p>Spam-score boven 7 verbergen</p>
            </section>
          </aside>
        </div>
      </section>

      {composeOpen ? (
        <ComposeModal
          signature={signature}
          senderOptions={senderOptions}
          defaultFrom={senderSettings.defaultFrom || status.mailbox}
          context={composeContext}
          onClose={closeCompose}
          onToast={setToast}
        />
      ) : null}
      {settingsOpen ? (
        <SettingsModal
          status={status}
          appearance={{ theme, templateId, layoutMode, density, logoDataUrl, logoSize, logoBackdrop, logoThemeVars }}
          signature={signature}
          senderSettings={senderSettings}
          initialMailboxUser={pendingMailboxSetup}
          feedSettings={feedSettings}
          onAppearanceChange={updateAppearance}
          onSignatureChange={updateSignature}
          onSenderSettingsChange={setSenderSettings}
          onFeedSettingsChange={setFeedSettings}
          onClose={() => setSettingsOpen(false)}
          onSaved={(nextStatus) => {
            setStatus(nextStatus);
            setActiveMailbox(nextStatus.mailbox);
            setPendingMailboxSetup("");
            setConnectionError("");
            setToast("Instellingen opgeslagen in .env. Gebruik Test verbinding om IMAP/SMTP te controleren.");
          }}
        />
      ) : null}
      {commandOpen ? <CommandPalette onClose={() => setCommandOpen(false)} onAction={fakeAction} openCompose={() => openCompose()} /> : null}
      <MusicDock onToast={setToast} />
      {toast ? (
        <button className="toast" onClick={() => setToast("")}>
          <CheckCircle2 size={17} />
          {toast}
        </button>
      ) : null}
    </main>
  );
}

function GovernmentFeedTicker({ feed, settings, index, onRefresh }) {
  const items = feed.items || [];
  const marqueeItems = items.length ? [...items, ...items] : [];
  const latestTime = items.reduce((latest, item) => Math.max(latest, item.date ? new Date(item.date).getTime() : 0), 0);
  const refreshed = feed.refreshedAt ? formatFeedDate(feed.refreshedAt) : "";

  return (
    <section
      className={`government-feed ${feed.loading ? "loading" : ""}`}
      style={{ "--feed-marquee-duration": `${settings?.scrollSeconds || 144}s` }}
      aria-label="Overheidsfeed drugsbeleid"
    >
      <div className="government-feed-head">
        <ShieldCheck size={15} />
        <strong>Overheid</strong>
        <span>{items.length || 0}</span>
      </div>
      {items.length ? (
        <div className="government-feed-marquee">
          <div className="government-feed-track">
            {marqueeItems.map((item, itemIndex) => {
              const itemTime = item.date ? new Date(item.date).getTime() : 0;
              const isLatest = itemTime && itemTime === latestTime && itemIndex < items.length;
              const when = item.date ? formatFeedDate(item.date) : refreshed;
              return (
                <a
                  key={`${item.url}-${itemIndex}`}
                  className={isLatest ? "latest" : ""}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  title={item.title}
                >
                  <strong>{isLatest ? "LAATSTE " : ""}{item.title}</strong>
                  <em>
                    {item.source}
                    {when ? ` · ${when}` : ""}
                  </em>
                </a>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="government-feed-empty">
          <span>{feed.error ? "Feed niet bereikbaar" : "Geen actuele hits"}</span>
          <em>Opiumwet, drugsbeleid, coffeeshops</em>
        </div>
      )}
      <button type="button" onClick={onRefresh} aria-label="Overheidsfeed verversen">
        <RefreshCw size={15} />
      </button>
    </section>
  );
}

function MusicDock({ onToast }) {
  const [open, setOpen] = useState(() => localStorage.getItem("ketelmeel-music-open") === "true");
  const [queue, setQueue] = useState(loadMusicQueue);
  const [activeId, setActiveId] = useState(() => localStorage.getItem("ketelmeel-music-active") || "");
  const [url, setUrl] = useState("");

  const activeItem = useMemo(() => queue.find((item) => item.id === activeId) || queue[0] || null, [activeId, queue]);

  useEffect(() => {
    localStorage.setItem("ketelmeel-music-open", open ? "true" : "false");
  }, [open]);

  useEffect(() => {
    localStorage.setItem("ketelmeel-music-queue", JSON.stringify(queue));
    if (queue.length && !queue.some((item) => item.id === activeId)) setActiveId(queue[0].id);
    if (!queue.length && activeId) setActiveId("");
  }, [queue, activeId]);

  useEffect(() => {
    if (activeId) localStorage.setItem("ketelmeel-music-active", activeId);
    else localStorage.removeItem("ketelmeel-music-active");
  }, [activeId]);

  function addMusic(event) {
    event.preventDefault();
    try {
      const item = parseMusicUrl(url);
      setQueue((current) => {
        const existing = current.find((entry) => entry.embedUrl === item.embedUrl);
        if (existing) {
          setActiveId(existing.id);
          return current;
        }
        return [item, ...current].slice(0, 12);
      });
      setActiveId(item.id);
      setOpen(true);
      setUrl("");
      onToast(`${item.sourceLabel} toegevoegd aan muziek.`);
    } catch (error) {
      onToast(error.message);
    }
  }

  function removeMusic(id) {
    setQueue((current) => current.filter((item) => item.id !== id));
  }

  return (
    <section className={`music-dock ${open ? "" : "minimized"}`} aria-label="Muziekspeler">
      <button className="music-mini-button" type="button" onClick={() => setOpen(true)} aria-label="Open muziekspeler">
        <Music2 size={19} />
      </button>
      <div className="music-panel" aria-hidden={open ? undefined : "true"}>
        <div className="music-header">
          <div>
            <Music2 size={18} />
            <strong>Muziek</strong>
          </div>
          <button className="icon-button" type="button" onClick={() => setOpen(false)} aria-label="Muziekspeler inklappen">
            <Minimize2 size={17} />
          </button>
        </div>

        <form className="music-add" onSubmit={addMusic}>
          <input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="YouTube of Spotify URL" />
          <button type="submit" aria-label="Toevoegen">
            <Plus size={17} />
          </button>
        </form>

        <div className="music-player">
          {activeItem ? (
            <iframe
              key={activeItem.embedUrl}
              title={activeItem.title}
              src={activeItem.embedUrl}
              loading="lazy"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            />
          ) : (
            <div className="music-empty">
              <ListMusic size={25} />
              <span>Geen playlist gekozen</span>
            </div>
          )}
        </div>

        <div className="music-queue" aria-label="Playlist">
          {queue.map((item) => {
            const active = activeItem?.id === item.id;
            const Icon = item.provider === "youtube" ? Youtube : Music2;
            return (
              <div className={`music-row ${active ? "active" : ""}`} key={item.id}>
                <button type="button" onClick={() => setActiveId(item.id)}>
                  <Icon size={16} />
                  <span>
                    <strong>{item.title}</strong>
                    <em>{item.sourceLabel}</em>
                  </span>
                  {active ? <Play size={15} /> : null}
                </button>
                <a href={item.externalUrl} target="_blank" rel="noreferrer" aria-label={`Open ${item.sourceLabel}`}>
                  <ExternalLink size={15} />
                </a>
                <button type="button" onClick={() => removeMusic(item.id)} aria-label="Verwijder uit muziek">
                  <X size={15} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function AttachmentList({ message }) {
  const [previewId, setPreviewId] = useState("");
  const attachments = (message.attachments || []).map(normalizeAttachment);
  if (!attachments.length) return null;

  return (
    <section className="attachments" aria-label="Bijlagen">
      <div className="attachments-heading">
        <Paperclip size={17} />
        <strong>Bijlagen</strong>
        <span>{attachments.length}</span>
      </div>
      {attachments.map((attachment) => {
        const previewUrl = attachmentUrl(message, attachment, "inline");
        const showPreview = previewId === attachment.id && isImageAttachment(attachment);
        return (
        <article
          className={`attachment-card ${showPreview ? "previewing" : ""}`}
          key={`${attachment.id}-${attachment.name}`}
          onMouseEnter={() => setPreviewId(attachment.id)}
          onMouseLeave={() => setPreviewId("")}
        >
          <div className="attachment-icon" aria-hidden="true">
            <Paperclip size={18} />
          </div>
          <div className="attachment-info">
            <strong>{attachment.name}</strong>
            <span>
              {friendlyContentType(attachment.contentType)}
              {" · "}
              {formatBytes(attachment.size)}
            </span>
          </div>
          <div className="attachment-actions">
            <a href={previewUrl} target="_blank" rel="noreferrer" title={`Open ${attachment.name}`}>
              <ExternalLink size={16} />
              Openen
            </a>
            <a href={attachmentUrl(message, attachment, "attachment")} download={attachment.name} title={`Sla ${attachment.name} op`}>
              <Download size={16} />
              Opslaan
            </a>
          </div>
          {showPreview ? (
            <div className="attachment-hover-preview" aria-label={`Voorbeeld van ${attachment.name}`}>
              <img src={previewUrl} alt={attachment.name} />
            </div>
          ) : null}
        </article>
        );
      })}
    </section>
  );
}

function TranslationPanel({ translation, error, busy, onRetry }) {
  if (!translation && !error && !busy) return null;

  if (error) {
    return (
      <section className="translation-panel error" aria-label="Vertaling">
        <div className="translation-heading">
          <Languages size={18} />
          <div>
            <strong>Vertalen niet gelukt</strong>
            <span>{error}</span>
          </div>
        </div>
        <button type="button" onClick={onRetry} disabled={busy}>
          <RefreshCw size={16} />
          {busy ? "Vertalen..." : "Nog eens proberen"}
        </button>
      </section>
    );
  }

  if (busy && !translation) {
    return (
      <section className="translation-panel loading" aria-label="Vertaling">
        <div className="translation-heading">
          <Languages size={18} />
          <div>
            <strong>Vertaling naar Nederlands</strong>
            <span>Bezig met vertalen...</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="translation-panel ready" aria-label="Vertaling">
      <div className="translation-heading">
        <Languages size={18} />
        <div>
          <strong>Vertaald naar Nederlands</strong>
          <span>
            Gemarkeerde vertaling
            {translation?.sourceLanguage && translation.sourceLanguage !== "auto" ? ` vanuit ${translation.sourceLanguage}` : ""}
            {translation?.truncated ? " · ingekort" : ""}
          </span>
        </div>
      </div>
      <pre className="translated-body">{translation.translatedBody || translation.translatedText || "Geen vertaling ontvangen."}</pre>
    </section>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="metric">
      <Icon size={18} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function EmailBody({ message, view, translation }) {
  const html = message.bodyHtml || "";
  const text = message.bodyText || message.body || "";
  const source = message.bodySource || "";

  if (view === "source") {
    return (
      <div className="source-view">
        {message.sourceTruncated ? <p>Bron is ingekort omdat het bericht erg groot is.</p> : null}
        <pre>{source || "Geen bron beschikbaar."}</pre>
      </div>
    );
  }

  if (view === "text" || !html) {
    return <pre className="message-body">{translation?.translatedBody || text || "Geen tekstinhoud beschikbaar."}</pre>;
  }

  if (translation?.translatedBody) {
    return <pre className="message-body translated-reader-body">{translation.translatedBody}</pre>;
  }

  const srcDoc = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data: cid:; style-src 'unsafe-inline'; font-src data:; base-uri 'none'; form-action 'none'; object-src 'none';" />
    <base target="_blank" />
    <style>
      html, body { margin: 0; padding: 0; background: #ffffff; color: #17201d; }
      body { font: 15px/1.55 -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; word-break: break-word; }
      img { max-width: 100%; height: auto; }
      table { max-width: 100%; }
      a { color: #0d6f65; }
    </style>
  </head>
  <body>${html}</body>
</html>`;

  return (
    <div className="email-frame-wrap">
      <iframe title="E-mail weergave" sandbox="allow-popups allow-popups-to-escape-sandbox" referrerPolicy="no-referrer" srcDoc={srcDoc} />
    </div>
  );
}

function ComposeModal({ signature, senderOptions = [], defaultFrom = "", context, onClose, onToast }) {
  const replyTargetLanguage = normalizeLanguage(context?.targetLanguage || "");
  const replyTargetLabel = languageLabel(replyTargetLanguage);
  const [form, setForm] = useState(() => composeInitialForm(signature, context, defaultFrom));
  const [sending, setSending] = useState(false);
  const [replyTranslating, setReplyTranslating] = useState(false);
  const [replyTranslated, setReplyTranslated] = useState(false);
  const [replyTranslationProvider, setReplyTranslationProvider] = useState("");
  const [replyReview, setReplyReview] = useState(null);
  const [tone, setTone] = useState("Zakelijk");

  function updateForm(next) {
    setReplyTranslated(false);
    setReplyTranslationProvider("");
    setReplyReview(null);
    setForm(next);
  }

  function changeFormat(format) {
    updateForm((current) => ({
      ...current,
      format,
      body: format === "text" && !current.body ? htmlToPlainText(current.htmlBody) : current.body,
      htmlBody: format === "html" && !current.htmlBody ? plainTextToHtml(current.body) : current.htmlBody
    }));
  }

  function updateBody(value) {
    updateForm((current) => ({
      ...current,
      body: value,
      htmlBody: current.format === "text" ? plainTextToHtml(value) : current.htmlBody
    }));
  }

  function updateHtmlBody(value) {
    updateForm((current) => ({
      ...current,
      htmlBody: value,
      body: htmlToPlainText(value)
    }));
  }

  function insertSignature() {
    const textSignature = signature.text || htmlToPlainText(signature.html);
    const htmlSignature = signature.html || plainTextToHtml(signature.text);
    updateForm((current) => {
      if (current.format === "html") {
        const nextHtml = appendHtmlWithGap(current.htmlBody, htmlSignature);
        return { ...current, htmlBody: nextHtml, body: htmlToPlainText(nextHtml) };
      }
      const nextBody = appendWithGap(current.body, textSignature);
      return { ...current, body: nextBody, htmlBody: plainTextToHtml(nextBody) };
    });
  }

  function setQuickText(value) {
    updateForm((current) => ({ ...current, body: value, htmlBody: plainTextToHtml(value) }));
  }

  function addSmartFinish() {
    updateForm((current) => {
      const nextBody = appendWithGap(current.body, "Met vriendelijke groet,");
      const nextHtml = current.format === "html" ? appendHtmlWithGap(current.htmlBody, "<p>Met vriendelijke groet,</p>") : plainTextToHtml(nextBody);
      return { ...current, body: nextBody, htmlBody: nextHtml };
    });
  }

  async function translateReplyDraft(currentForm = form) {
    if (!replyTargetLanguage) return currentForm;
    const text = (currentForm.format === "html" ? currentForm.body || htmlToPlainText(currentForm.htmlBody) : currentForm.body).trim();
    if (!text) throw new Error("Schrijf eerst je Nederlandse antwoord.");
    const payload = `Onderwerp:\n${currentForm.subject || "(geen onderwerp)"}\n\nBericht:\n${text}`;

    setReplyTranslating(true);
    try {
      const result = await api("/api/translate", {
        method: "POST",
        body: JSON.stringify({ text: payload, source: "nl", target: replyTargetLanguage })
      });
      const parsed = splitTranslatedMessage(result.translatedText, currentForm.subject);
      const nextForm = {
        ...currentForm,
        subject: parsed.subject || currentForm.subject,
        body: parsed.body || result.translatedText,
        htmlBody: plainTextToHtml(parsed.body || result.translatedText)
      };
      setReplyReview(nextForm);
      setReplyTranslated(true);
      setReplyTranslationProvider(result.provider || "");
      return nextForm;
    } finally {
      setReplyTranslating(false);
    }
  }

  async function sendMessage(event) {
    event.preventDefault();
    setSending(true);
    try {
      if (replyTargetLanguage && !replyReview) {
        await translateReplyDraft(form);
        onToast("Controleer de vertaalde versie. Klik daarna nogmaals op verzenden.");
        return;
      }
      const preparedForm = replyTargetLanguage && replyReview ? replyReview : form;
      const body = preparedForm.format === "html" ? preparedForm.body || htmlToPlainText(preparedForm.htmlBody) : preparedForm.body;
      await api(
        "/api/send",
        {
          method: "POST",
          body: JSON.stringify({
            to: preparedForm.to,
            from: preparedForm.from,
            subject: preparedForm.subject,
            body,
            htmlBody: preparedForm.format === "html" ? preparedForm.htmlBody : "",
            format: preparedForm.format,
            tone
          })
        }
      );
      onToast(replyTargetLanguage ? `Antwoord vertaald naar ${replyTargetLabel} en verzonden.` : "Bericht verzonden.");
      onClose();
    } catch (error) {
      onToast(error.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="modal-layer" role="dialog" aria-modal="true">
      <form className="compose-modal" onSubmit={sendMessage}>
        <div className="modal-header">
          <strong>{context?.mode === "reply" ? "Beantwoord bericht" : "Nieuw bericht"}</strong>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Sluit">
            <X size={18} />
          </button>
        </div>
        {replyTargetLanguage ? (
          <section className="reply-translate-note">
            <Languages size={18} />
            <div>
              <strong>Schrijf in Nederlands</strong>
              <span>
                Ketel Mail vertaalt je antwoord naar {replyTargetLabel}
                {replyTranslated ? ` via ${replyTranslationProvider || "de vertaaldienst"}` : " bij verzenden"}.
              </span>
            </div>
          </section>
        ) : context?.mode === "reply" ? (
          <section className="reply-translate-note calm">
            <CheckCircle2 size={18} />
            <div>
              <strong>Nederlands antwoord</strong>
              <span>De originele mail lijkt Nederlands, dus er is geen uitgaande vertaling nodig.</span>
            </div>
          </section>
        ) : null}
        {replyReview ? (
          <section className="reply-review-panel" aria-label="Controleer vertaalde reactie">
            <div>
              <Languages size={18} />
              <strong>Controleer vertaalde versie voor verzenden</strong>
              <button type="button" onClick={() => setReplyReview(null)}>
                Pas Nederlands aan
              </button>
            </div>
            <label>
              <span>Onderwerp in {replyTargetLabel}</span>
              <input readOnly value={replyReview.subject} />
            </label>
            <pre>{replyReview.body}</pre>
          </section>
        ) : null}
        <div className="compose-grid">
          <select value={form.from} onChange={(event) => updateForm({ ...form, from: event.target.value })} aria-label="Afzender">
            {senderOptions.map((address) => (
              <option key={address} value={address}>
                Van {address}
              </option>
            ))}
            {!senderOptions.length ? <option value="">Afzender uit serverinstellingen</option> : null}
          </select>
          <input value={form.to} onChange={(event) => updateForm({ ...form, to: event.target.value })} placeholder="Ontvanger" />
          <select value={tone} onChange={(event) => setTone(event.target.value)} aria-label="Toon">
            <option>Zakelijk</option>
            <option>Kort</option>
            <option>Warm</option>
            <option>Direct</option>
          </select>
          <select value={form.format} onChange={(event) => changeFormat(event.target.value)} aria-label="Berichttype">
            <option value="text">Tekst enkel</option>
            <option value="html">HTML</option>
          </select>
        </div>
        <input value={form.subject} onChange={(event) => updateForm({ ...form, subject: event.target.value })} placeholder="Onderwerp" />
        <div className="compose-tools">
          <button type="button" onClick={addSmartFinish}>
            <Sparkles size={16} />
            Smart finish
          </button>
          <button type="button" onClick={() => setQuickText("Dank voor je bericht.\n\nIk pak dit op en kom hier vandaag op terug.")}>
            <Zap size={16} />
            Snelle reactie
          </button>
          <button type="button" onClick={insertSignature}>
            <PenLine size={16} />
            Handtekening
          </button>
          {replyTargetLanguage ? (
            <button type="button" onClick={() => translateReplyDraft()} disabled={replyTranslating}>
              <Languages size={16} />
              {replyTranslating ? "Vertalen..." : `Vertaal naar ${replyTargetLabel}`}
            </button>
          ) : null}
        </div>
        {form.format === "html" ? (
          <textarea
            className="html-compose"
            value={form.htmlBody}
            onChange={(event) => updateHtmlBody(event.target.value)}
            placeholder="<p>Schrijf je bericht</p>"
          />
        ) : (
          <textarea value={form.body} onChange={(event) => updateBody(event.target.value)} placeholder="Schrijf je bericht" />
        )}
        <button className="send-button" disabled={sending || replyTranslating}>
          <Send size={17} />
          {sending || replyTranslating
            ? "Vertalen..."
            : replyTargetLanguage && !replyReview
              ? "Controleer vertaling"
              : replyTargetLanguage
                ? "Vertaalde versie versturen"
                : "Verstuur"}
        </button>
      </form>
    </div>
  );
}

function AppearancePanel({ appearance, onChange }) {
  const [logoError, setLogoError] = useState("");

  function applyTemplate(preset) {
    onChange({
      templateId: preset.id,
      theme: preset.theme,
      layoutMode: preset.layoutMode,
      density: preset.density
    });
  }

  function uploadLogo(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    setLogoError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setLogoError("Kies een afbeelding als logo.");
      return;
    }
    if (file.size > 1.5 * 1024 * 1024) {
      setLogoError("Logo is te groot. Gebruik maximaal 1,5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const logoDataUrl = String(reader.result || "");
      try {
        const logoThemeVars = await extractLogoThemeVars(logoDataUrl);
        onChange({ logoDataUrl, logoThemeVars });
      } catch {
        onChange({ logoDataUrl, logoThemeVars: null });
      }
    };
    reader.onerror = () => setLogoError("Logo kon niet worden gelezen.");
    reader.readAsDataURL(file);
  }

  return (
    <section className="appearance-panel" aria-label="Template en layout">
      <div className="settings-section-heading">
        <Layers3 size={18} />
        <strong>Template & layout</strong>
      </div>

      <div className="logo-settings">
        <div className="logo-preview">
          <div className="brand-mark logo-preview-mark" style={{ "--brand-logo-size": `${appearance.logoSize}px` }}>
            {appearance.logoDataUrl ? <img src={appearance.logoDataUrl} alt="Ketel Mail logo voorbeeld" /> : <ImageIcon size={22} />}
          </div>
          <div>
            <strong>Eigen logo</strong>
            <span>Wordt gebruikt in elke template.</span>
          </div>
        </div>
        <div className="logo-actions">
          <label className="logo-upload-button">
            <Upload size={16} />
            Upload logo
            <input type="file" accept="image/*" onChange={uploadLogo} />
          </label>
          {appearance.logoDataUrl ? (
            <button type="button" onClick={() => onChange({ logoDataUrl: "", logoThemeVars: null })}>
              <X size={16} />
              Verwijder
            </button>
          ) : null}
        </div>
        <label className="logo-size-control">
          <span>Achtergrond</span>
          <select value={appearance.logoBackdrop || "white"} onChange={(event) => onChange({ logoBackdrop: event.target.value })}>
            <option value="white">Wit</option>
            <option value="transparent">Doorzichtig</option>
            <option value="accent">Accentkleur</option>
          </select>
          <em>{appearance.logoThemeVars ? "Kleuren actief" : "Template"}</em>
        </label>
        <label className="logo-size-control">
          <span>Logo grootte</span>
          <input
            type="range"
            min="28"
            max="86"
            value={appearance.logoSize}
            onInput={(event) => onChange({ logoSize: Number(event.currentTarget.value) })}
            onChange={(event) => onChange({ logoSize: Number(event.target.value) })}
          />
          <em>{appearance.logoSize}px</em>
        </label>
        {logoError ? <p className="logo-error">{logoError}</p> : null}
      </div>

      <div className="template-grid" aria-label="Templates">
        {templatePresets.map((preset) => {
          const active = appearance.templateId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              className={`template-card ${active ? "active" : ""} ${preset.cornerLogo ? "has-corner-logo" : ""}`}
              onClick={() => applyTemplate(preset)}
            >
              <span className="template-card-top">
                <strong>{preset.label}</strong>
                {active ? <Check size={16} /> : null}
              </span>
              <span>{preset.tone}</span>
              <span className="template-swatches" aria-hidden="true">
                {preset.swatches.map((color) => (
                  <i key={color} style={{ background: color }} />
                ))}
              </span>
              {preset.cornerLogo ? <img className="template-card-logo" src={preset.cornerLogo} alt="" aria-hidden="true" /> : null}
            </button>
          );
        })}
      </div>

      <div className="layout-grid" aria-label="Layouts">
        {layoutOptions.map((layout) => {
          const Icon = layout.icon;
          const active = appearance.layoutMode === layout.id;
          return (
            <button
              key={layout.id}
              type="button"
              className={`layout-card ${active ? "active" : ""}`}
              onClick={() => onChange({ layoutMode: layout.id })}
            >
              <Icon size={17} />
              <span>{layout.label}</span>
              {active ? <Check size={15} /> : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function FeedSettingsPanel({ feedSettings, onChange }) {
  const settings = feedSettings || loadFeedSettings();
  const feedSpeedValue = 2400 - settings.scrollSeconds;

  function update(next) {
    onChange({
      ...settings,
      ...next,
      scrollSeconds: Math.max(600, Math.min(1800, Number(next.scrollSeconds ?? settings.scrollSeconds))),
      limit: Math.max(1, Math.min(60, Number(next.limit ?? settings.limit)))
    });
  }

  return (
    <section className="feed-settings-panel" aria-label="Feedinstellingen">
      <div className="settings-section-heading">
        <ShieldCheck size={18} />
        <strong>Feedbalk</strong>
      </div>
      <div className="feed-settings-grid">
        <label>
          <span>Snelheid feedbalk</span>
          <input
            type="range"
            min="600"
            max="1800"
            step="60"
            value={feedSpeedValue}
            onChange={(event) => update({ scrollSeconds: 2400 - Number(event.target.value) })}
          />
          <em>{settings.scrollSeconds}s</em>
        </label>
        <label>
          <span>Aantal items</span>
          <input type="number" min="1" max="60" value={settings.limit} onChange={(event) => update({ limit: event.target.value })} />
        </label>
        <label>
          <span>Automatisch verversen</span>
          <select value={settings.refreshMode} onChange={(event) => update({ refreshMode: event.target.value })}>
            <option value="normal">Elke 30 minuten</option>
            <option value="fast">Snelle stand: elke 5 minuten</option>
          </select>
        </label>
        <label className="settings-toggle">
          <input type="checkbox" checked={settings.latestFirst} onChange={(event) => update({ latestFirst: event.target.checked })} />
          Nieuwste vooraan
        </label>
      </div>
      <label className="feed-source-list">
        <span>Extra feed-URL's</span>
        <textarea
          value={settings.customSources}
          onChange={(event) => update({ customSources: event.target.value })}
          placeholder={"https://voorbeeld.nl/feed.xml\nhttps://voorbeeld.nl/nieuws"}
        />
      </label>
    </section>
  );
}

function SenderPanel({ status, senderSettings, onChange }) {
  const [draft, setDraft] = useState("");
  const options = normalizeSenderOptions(senderSettings, status.mailbox);
  const defaultFrom = senderSettings.defaultFrom || status.mailbox || options[0] || "";

  function addAddress() {
    const address = draft.trim();
    if (!address || !address.includes("@")) return;
    const identities = [...new Set([...(senderSettings.identities || []), address])];
    onChange({ defaultFrom: senderSettings.defaultFrom || address, identities });
    setDraft("");
  }

  function removeAddress(address) {
    const identities = (senderSettings.identities || []).filter((item) => item !== address);
    const defaultFromNext = senderSettings.defaultFrom === address ? status.mailbox || identities[0] || "" : senderSettings.defaultFrom;
    onChange({ defaultFrom: defaultFromNext, identities });
  }

  return (
    <section className="sender-panel" aria-label="Afzenderadressen">
      <div className="settings-section-heading">
        <Mail size={18} />
        <strong>Afzenderadressen</strong>
      </div>
      <label>
        <span>Standaard afzender</span>
        <select value={defaultFrom} onChange={(event) => onChange({ ...senderSettings, defaultFrom: event.target.value })}>
          {options.map((address) => (
            <option key={address} value={address}>
              {address}
            </option>
          ))}
        </select>
      </label>
      <div className="sender-add-row">
        <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="extra@jouwdomein.nl" />
        <button type="button" onClick={addAddress}>
          <Plus size={16} />
          Voeg toe
        </button>
      </div>
      <div className="sender-list">
        {options.map((address) => (
          <span key={address}>
            {address}
            {address !== status.mailbox ? (
              <button type="button" onClick={() => removeAddress(address)} aria-label={`Verwijder ${address}`}>
                <X size={14} />
              </button>
            ) : null}
          </span>
        ))}
      </div>
    </section>
  );
}

function SignaturePanel({ signature, onChange }) {
  return (
    <section className="signature-panel" aria-label="Handtekening">
      <div className="settings-section-heading">
        <PenLine size={18} />
        <strong>Handtekening</strong>
      </div>

      <div className="signature-options">
        <label className="settings-toggle">
          <input
            type="checkbox"
            checked={signature.autoInsert}
            onChange={(event) => onChange({ autoInsert: event.target.checked })}
          />
          <span>Automatisch toevoegen aan nieuwe berichten</span>
        </label>
        <label>
          Standaard
          <select value={signature.defaultFormat} onChange={(event) => onChange({ defaultFormat: event.target.value })}>
            <option value="text">Tekst enkel</option>
            <option value="html">HTML</option>
          </select>
        </label>
      </div>

      <div className="signature-editors">
        <label>
          Tekst enkel
          <textarea value={signature.text} onChange={(event) => onChange({ text: event.target.value })} />
        </label>
        <label>
          HTML
          <textarea value={signature.html} onChange={(event) => onChange({ html: event.target.value })} />
        </label>
      </div>
    </section>
  );
}

function SettingsModal({
  status,
  appearance,
  signature,
  senderSettings,
  initialMailboxUser = "",
  feedSettings,
  onAppearanceChange,
  onSignatureChange,
  onSenderSettingsChange,
  onFeedSettingsChange,
  onClose,
  onSaved
}) {
  const [form, setForm] = useState({
    demoMode: status.mode === "demo",
    mailboxUser: "",
    mailboxPassword: "",
    imapHost: "",
    imapPort: 993,
    imapSecure: true,
    smtpHost: "",
    smtpPort: 465,
    smtpSecure: true,
    mailFrom: "",
    translateProvider: "mymemory",
    translateUrl: "http://127.0.0.1:5000",
    translateApiKey: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [diagnostics, setDiagnostics] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api("/api/settings")
      .then((settings) => {
        setForm({
          demoMode: settings.demoMode,
          mailboxUser: initialMailboxUser || settings.mailboxUser || "",
          mailboxPassword: "",
          imapHost: settings.imapHost || "",
          imapPort: settings.imapPort || 993,
          imapSecure: settings.imapSecure !== false,
          smtpHost: settings.smtpHost || "",
          smtpPort: settings.smtpPort || 465,
          smtpSecure: settings.smtpSecure !== false,
          mailFrom: settings.mailFrom || "",
          translateProvider: settings.translateProvider || "mymemory",
          translateUrl: settings.translateUrl || "http://127.0.0.1:5000",
          translateApiKey: ""
        });
        setMessage(
          initialMailboxUser && initialMailboxUser !== settings.mailboxUser
            ? `${initialMailboxUser} staat klaar. Vul het wachtwoord/app-wachtwoord en controleer IMAP/SMTP.`
            : settings.mailboxPasswordSet
              ? "Wachtwoord staat al opgeslagen. Laat leeg om te behouden."
              : ""
        );
      })
      .catch((error) => setMessage(error.message))
      .finally(() => setLoading(false));
  }, [initialMailboxUser]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function applyPreset(presetName) {
    setForm((current) => ({ ...current, ...providerPresets[presetName], demoMode: false }));
    setDiagnostics(null);
    setMessage(presetName === "zohoBusinessEu" ? "Zakelijke Zoho EU instellingen ingevuld." : "Persoonlijke Zoho EU instellingen ingevuld.");
  }

  function useFreeOnlineTranslate() {
    setForm((current) => ({ ...current, translateProvider: "mymemory" }));
    setMessage("Gratis online vertaling is actief. Voor privacygevoelige mail kun je LibreTranslate/self-hosted kiezen.");
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const result = await api("/api/settings", { method: "POST", body: JSON.stringify(form) });
      const nextStatus = await api("/api/status");
      onSaved(nextStatus, result.settings);
      setDiagnostics(null);
      setMessage("Opgeslagen. Klik op Test verbinding om deze zakelijke instellingen te controleren.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function testConnection() {
    setTesting(true);
    setDiagnostics(null);
    setMessage("");
    try {
      await api("/api/settings", { method: "POST", body: JSON.stringify(form) });
      const nextStatus = await api("/api/status");
      onSaved(nextStatus);
      const result = await api("/api/diagnostics");
      setDiagnostics(result);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="modal-layer" role="dialog" aria-modal="true">
      <form className="settings-modal" onSubmit={save}>
        <div className="modal-header">
          <strong>Serverinstellingen</strong>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Sluit">
            <X size={18} />
          </button>
        </div>
        <div className="settings-scroll">
          {loading ? (
            <p>Instellingen laden...</p>
          ) : (
            <>
              <AppearancePanel appearance={appearance} onChange={onAppearanceChange} />
              <FeedSettingsPanel feedSettings={feedSettings} onChange={onFeedSettingsChange} />
              <SenderPanel status={status} senderSettings={senderSettings} onChange={onSenderSettingsChange} />
              <SignaturePanel signature={signature} onChange={onSignatureChange} />

              <label className="settings-toggle">
                <input type="checkbox" checked={form.demoMode} onChange={(event) => updateField("demoMode", event.target.checked)} />
                <span>Demo-modus gebruiken</span>
              </label>

              <div className="preset-row" aria-label="Mailprovider presets">
                <button type="button" onClick={() => applyPreset("zohoBusinessEu")}>
                  Zoho Zakelijk EU
                </button>
                <button type="button" onClick={() => applyPreset("zohoPersonalEu")}>
                  Zoho Persoonlijk EU
                </button>
              </div>

              <div className="settings-grid">
                <label>
                  Mailbox
                  <input value={form.mailboxUser} onChange={(event) => updateField("mailboxUser", event.target.value)} placeholder="jij@jouwdomein.nl" />
                </label>
                <label>
                  Wachtwoord
                  <input
                    type="password"
                    value={form.mailboxPassword}
                    onChange={(event) => updateField("mailboxPassword", event.target.value)}
                    placeholder="Leeg laten om bestaand wachtwoord te houden"
                  />
                </label>
                <label>
                  IMAP server
                  <input value={form.imapHost} onChange={(event) => updateField("imapHost", event.target.value)} placeholder="mail.jouwdomein.nl" />
                </label>
                <label>
                  IMAP poort
                  <input type="number" value={form.imapPort} onChange={(event) => updateField("imapPort", Number(event.target.value))} />
                </label>
                <label>
                  SMTP server
                  <input value={form.smtpHost} onChange={(event) => updateField("smtpHost", event.target.value)} placeholder="mail.jouwdomein.nl" />
                </label>
                <label>
                  SMTP poort
                  <input type="number" value={form.smtpPort} onChange={(event) => updateField("smtpPort", Number(event.target.value))} />
                </label>
                <label className="wide">
                  Afzendernaam
                  <input value={form.mailFrom} onChange={(event) => updateField("mailFrom", event.target.value)} placeholder="Jouw Naam <jij@jouwdomein.nl>" />
                </label>
                <label>
                  Vertaalservice
                  <select value={form.translateProvider} onChange={(event) => updateField("translateProvider", event.target.value)}>
                    <option value="mymemory">Gratis online MyMemory</option>
                    <option value="libretranslate">LibreTranslate / eigen server</option>
                  </select>
                </label>
                <label>
                  Online vertalen
                  <button className="secondary-button" type="button" onClick={useFreeOnlineTranslate}>
                    <Languages size={16} />
                    Gebruik gratis online
                  </button>
                </label>
                <label className="wide">
                  LibreTranslate server
                  <input value={form.translateUrl} onChange={(event) => updateField("translateUrl", event.target.value)} placeholder="http://127.0.0.1:5000" />
                </label>
                <label className="wide">
                  LibreTranslate API key
                  <input
                    type="password"
                    value={form.translateApiKey}
                    onChange={(event) => updateField("translateApiKey", event.target.value)}
                    placeholder="Leeg laten als je vertaalserver geen key gebruikt"
                  />
                </label>
              </div>

              <div className="settings-checks">
                <label>
                  <input type="checkbox" checked={form.imapSecure} onChange={(event) => updateField("imapSecure", event.target.checked)} />
                  IMAP via SSL/TLS
                </label>
                <label>
                  <input type="checkbox" checked={form.smtpSecure} onChange={(event) => updateField("smtpSecure", event.target.checked)} />
                  SMTP via SSL/TLS
                </label>
              </div>

              <div className="security-summary">
                <div>
                  <ShieldCheck size={18} />
                  <strong>Beveiliging actief</strong>
                </div>
                <span>HTML-mail draait afgezonderd, links openen zonder referrer, bijlagen krijgen veilige headers en API-antwoorden worden niet opgeslagen in de browsercache.</span>
              </div>

              <div className="settings-summary">
                <strong>{form.translateProvider === "mymemory" ? "Gratis online vertaling" : "LibreTranslate vertaling"}</strong>
                <span>
                  {form.translateProvider === "mymemory"
                    ? "Gebruikt MyMemory online zonder API-key. Korte stukken tekst worden naar een externe gratis vertaaldienst gestuurd."
                    : "Gebruikt je eigen LibreTranslate URL of een compatible server. Beter voor privacy en grotere teksten."}
                </span>
              </div>

              <div className="settings-summary">
                <strong>Wordt opgeslagen in `.env`</strong>
                <span>Na opslaan gebruikt Ketel Mail deze instellingen meteen voor IMAP en SMTP.</span>
              </div>

              {(form.imapHost.includes("zoho") || form.smtpHost.includes("zoho")) && (
                <div className="provider-hint">
                  <strong>Zoho controle</strong>
                  <span>Zet IMAP aan in Zoho Mail bij Settings, Mail Accounts, je primaire adres, IMAP Access. Gebruik bij 2FA een app-wachtwoord.</span>
                  <div className="provider-links">
                    {zohoLinks.map((link) => (
                      <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {message ? <p className="settings-message">{message}</p> : null}

              {diagnostics ? <DiagnosticsPanel diagnostics={diagnostics} /> : null}

              <div className="settings-actions">
                <button className="secondary-button" type="button" disabled={testing} onClick={testConnection}>
                  <ShieldCheck size={17} />
                  {testing ? "Testen..." : "Test verbinding"}
                </button>
                <button className="send-button" disabled={saving}>
                  <Settings size={17} />
                  {saving ? "Opslaan..." : "Opslaan"}
                </button>
              </div>
            </>
          )}
        </div>
      </form>
    </div>
  );
}

function DiagnosticsPanel({ diagnostics }) {
  const rows = [
    ["IMAP poort", diagnostics.imapTcp],
    ["IMAP login", diagnostics.imapLogin],
    ["SMTP poort", diagnostics.smtpTcp],
    ["SMTP login", diagnostics.smtpLogin]
  ];

  return (
    <section className="diagnostics-panel" aria-label="Diagnose">
      <strong>Verbindingstest</strong>
      {rows.map(([label, result]) => (
        <div key={label} className={result?.ok ? "ok" : "bad"}>
          <span>{label}</span>
          <em>{result?.ok ? "OK" : result?.error || "Mislukt"}</em>
        </div>
      ))}
    </section>
  );
}

function CommandPalette({ onClose, onAction, openCompose }) {
  const actions = [
    { label: "Nieuw bericht", icon: PenLine, run: openCompose },
    { label: "Archiveer huidig bericht", icon: Archive, run: () => onAction("Archiveren") },
    { label: "Maak regel van afzender", icon: Layers3, run: () => onAction("Regel") },
    { label: "Plan opvolging", icon: CalendarDays, run: () => onAction("Opvolging") },
    { label: "Markeer als afgehandeld", icon: Check, run: () => onAction("Afgehandeld") }
  ];

  return (
    <div className="modal-layer command-layer" role="dialog" aria-modal="true">
      <section className="command-modal">
        <div className="command-input">
          <Command size={18} />
          <span>Command center</span>
          <button className="icon-button" onClick={onClose} aria-label="Sluit">
            <X size={18} />
          </button>
        </div>
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={() => {
                action.run();
                onClose();
              }}
            >
              <Icon size={18} />
              {action.label}
            </button>
          );
        })}
      </section>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);

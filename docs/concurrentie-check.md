# Concurrentie-check

Deze check gebruikt betaalde en bekende maildiensten als lat, maar Ketel Mail blijft bewust zelf-hostbaar en gratis.

## Vergeleken met Proton Mail

Proton Mail legt de nadruk op zero-access en end-to-end encryptie. Ketel Mail doet dat nog niet. Wat nu wel is aangescherpt: HTML-mail draait gesandboxed, scripts en formulieren in mail worden geblokkeerd, en API-antwoorden worden niet in de browsercache bewaard.

## Vergeleken met Zoho Mail

Zoho Mail richt zich op zakelijke mail met TLS, beheerdersinstellingen en provider-side beveiliging. Ketel Mail heeft nu duidelijkere zakelijke serverinstellingen, SSL/TLS-schakelaars, Zoho-presets en zichtbare waarschuwingen rond wachtwoorden en app-wachtwoorden.

## Vergeleken met Fastmail

Fastmail zet sterk in op accountbeveiliging zoals 2FA en app-wachtwoorden. Ketel Mail kan 2FA niet voor je mailprovider afdwingen, maar stuurt in de instellingen wel naar het veilige patroon: app-wachtwoord gebruiken, IMAP/SMTP via TLS en geheimen lokaal in `.env`.

## Verbeteringen uit deze ronde

- App-brede Content Security Policy.
- Geen Express-identificatieheader.
- Extra browserbeveiliging: `nosniff`, `frame-ancestors 'none'`, `X-Frame-Options`, referrerbeleid en permissiebeperking.
- API-cache uitgeschakeld.
- Mail-HTML strenger gesanitized: data- en cid-URL's alleen voor afbeeldingen.
- Mailviewer met eigen iframe-CSP.
- Instellingenpaneel toont een duidelijke beveiligingsstatus.

## Volgende grote stap

De grootste resterende concurrentiestap is echte end-to-end encryptie of PGP/S/MIME-integratie per mailbox. Dat vraagt een aparte sleutelbeheer-flow, back-upherstel en duidelijke UX voor versleuteld verzenden.

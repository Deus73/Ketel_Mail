# Security Policy

Ketel Mail is bedoeld als zelf-hostbare webmail-laag. De app leest en verstuurt mail via jouw IMAP- en SMTP-server; hij is niet zelf de volledige mailserver.

## Aanbevolen productie-instellingen

- Draai Ketel Mail achter HTTPS, bijvoorbeeld via Caddy, Nginx of Traefik.
- Gebruik `DEMO_MODE=false` zodra je live mail gebruikt.
- Gebruik IMAP/SMTP met SSL/TLS.
- Gebruik voor providers met 2FA een app-wachtwoord.
- Bewaar `.env` alleen op je eigen server en commit dit bestand nooit.
- Beperk netwerktoegang tot het beheerpaneel wanneer je Ketel Mail publiek bereikbaar maakt.

## Ingebouwde bescherming

- Content Security Policy voor de app-shell.
- API-antwoorden krijgen `Cache-Control: no-store`.
- Express fingerprinting staat uit.
- HTML-mail wordt server-side gesanitized.
- HTML-mail wordt client-side in een sandboxed iframe getoond.
- Bijlagen krijgen `X-Content-Type-Options: nosniff` en een sandbox-CSP.
- Links uit mail openen zonder referrer en met `noopener noreferrer nofollow`.

## Grenzen

Ketel Mail claimt op dit moment geen Proton-achtige zero-access of end-to-end encryptie. Als je volledige end-to-end encryptie nodig hebt, moet dat apart op mail- of berichtniveau worden toegevoegd.

## Melden

Open geen echte wachtwoorden of `.env`-inhoud in issues. Meld een beveiligingsprobleem via een private GitHub security advisory of via een tijdelijk privécontactkanaal van de repository-eigenaar.

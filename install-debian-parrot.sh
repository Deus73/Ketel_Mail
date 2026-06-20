#!/usr/bin/env sh
set -eu

APP_NAME="Ketel Mail"
APP_ID="ketel-mail"
APP_DIR="${HOME}/.local/share/ketel-mail"
BIN_DIR="${HOME}/.local/bin"
DESKTOP_DIR="${HOME}/.local/share/applications"
AUTOSTART_DIR="${HOME}/.config/autostart"
SOURCE_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"

need_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "$1 ontbreekt."
    return 1
  fi
}

echo "Ketel Mail compacte Debian/ParrotOS installer"

if ! need_command node || ! need_command npm; then
  echo ""
  echo "Installeer eerst Node.js 20 of nieuwer en npm:"
  echo "  sudo apt update && sudo apt install -y nodejs npm"
  exit 1
fi

NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
if [ "$NODE_MAJOR" -lt 20 ]; then
  echo "Node.js is te oud: $(node -v). Gebruik Node.js 20 of nieuwer."
  exit 1
fi

echo "Appbestanden plaatsen in ${APP_DIR}..."
mkdir -p "$APP_DIR" "$BIN_DIR" "$DESKTOP_DIR" "$AUTOSTART_DIR"

tar \
  --exclude=".git" \
  --exclude="node_modules" \
  --exclude="release" \
  --exclude="*.zip" \
  --exclude="*.exe" \
  --exclude="install.html" \
  -C "$SOURCE_DIR" \
  -cf - . | tar -C "$APP_DIR" -xf -

cd "$APP_DIR"

if [ ! -f .env ]; then
  cp .env.example .env
fi

echo "Dependencies installeren voor eigen appvenster..."
npm ci

echo "Productiebestanden controleren..."
if [ ! -d dist ]; then
  echo "dist ontbreekt, build wordt gemaakt..."
  npm run build
fi

cat > "${BIN_DIR}/ketel-mail" <<'LAUNCHER'
#!/usr/bin/env sh
set -eu
APP_DIR="${HOME}/.local/share/ketel-mail"
cd "$APP_DIR"
if [ -x "./node_modules/.bin/electron" ]; then
  npm run desktop:fast
else
  npm start
fi
LAUNCHER
chmod +x "${BIN_DIR}/ketel-mail"

ICON_PATH="${APP_DIR}/public/icons/ketel-mail-icon.png"
cat > "${DESKTOP_DIR}/ketel-mail.desktop" <<DESKTOP
[Desktop Entry]
Type=Application
Name=${APP_NAME}
Comment=Zelf-hostbare lokale webmail
Exec=${BIN_DIR}/ketel-mail
Icon=${ICON_PATH}
Terminal=false
Categories=Network;Email;
StartupNotify=true
DESKTOP
chmod +x "${DESKTOP_DIR}/ketel-mail.desktop"

cp "${DESKTOP_DIR}/ketel-mail.desktop" "${AUTOSTART_DIR}/ketel-mail.desktop"

if command -v update-desktop-database >/dev/null 2>&1; then
  update-desktop-database "$DESKTOP_DIR" >/dev/null 2>&1 || true
fi

echo ""
echo "Klaar. Ketel Mail is lokaal geinstalleerd."
echo "Starten kan via het menu of met:"
echo "  ketel-mail"
echo "Ketel Mail start ook automatisch mee bij het inloggen."

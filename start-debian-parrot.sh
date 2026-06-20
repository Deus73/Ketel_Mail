#!/usr/bin/env sh
set -eu

INSTALLED_APP="${HOME}/.local/share/ketel-mail"
if [ -d "$INSTALLED_APP" ]; then
  cd "$INSTALLED_APP"
else
  cd "$(dirname "$0")"
fi

if [ ! -d node_modules ]; then
  echo "Ketel Mail is nog niet geinstalleerd. Start eerst:"
  echo "  ./install-debian-parrot.sh"
  exit 1
fi

if [ ! -d dist ]; then
  echo "Productiebuild ontbreekt, build wordt gemaakt..."
  npm run build
fi

echo "Ketel Mail starten in eigen venster..."
if npm run desktop:fast; then
  exit 0
fi

echo ""
echo "Eigen venster lukte niet. Browser/server-stand wordt gestart op http://localhost:8080"
echo "Als Electron systeemlibs mist op Debian/ParrotOS, installeer:"
echo "  sudo apt install -y libgtk-3-0 libnss3 libxss1 libasound2 libatk-bridge2.0-0 libdrm2 libgbm1"
npm start

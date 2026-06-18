#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js ontbreekt. Installeer Node.js 20 of nieuwer:"
  echo "  sudo apt update && sudo apt install -y nodejs npm"
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm ontbreekt. Installeer npm:"
  echo "  sudo apt update && sudo apt install -y npm"
  exit 1
fi

echo "Ketel Mail dependencies installeren..."
npm install

if [ ! -f .env ]; then
  cp .env.example .env
  echo ".env aangemaakt uit .env.example"
fi

echo "Ketel Mail productiebuild maken..."
npm run build

echo ""
echo "Klaar. Start Ketel Mail met:"
echo "  ./start-debian-parrot.sh"

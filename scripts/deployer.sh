#!/usr/bin/env bash
# Met en ligne (ou à jour) le site sur le VPS.
# À lancer depuis le dossier du projet : ./scripts/deployer.sh
# Prérequis : un fichier .env de production à la racine du projet (voir .env.example),
# avec NODE_ENV=production et DB_FILE pointant hors du dossier build/.
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "Il manque le fichier .env à la racine du projet." >&2
  exit 1
fi

echo "▶ Récupération des dernières modifications"
git pull --ff-only

echo "▶ Installation des dépendances"
pnpm install --frozen-lockfile

echo "▶ Build"
node ace build

echo "▶ Dépendances de production"
cp .env build/.env
cd build
pnpm install --prod --frozen-lockfile

echo "▶ Base de données"
node ace migration:run --force

echo "▶ (Re)démarrage"
if pm2 describe aniki > /dev/null 2>&1; then
  pm2 restart aniki --update-env
else
  pm2 start bin/server.js --name aniki
  pm2 save
fi

echo "✔ En ligne"

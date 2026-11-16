#!/bin/bash

# Avbryt direkt vid fel
set -e

# Hämta aktuell projektmapp
PROJECT_DIR="$(pwd)"
PROJECT_NAME=$(basename "$PROJECT_DIR")

# Rätt sökväg direkt i hemkatalogen
BACKUP_PARENT="$HOME/Predikoappen - backuper bilder mm"

# Skapa filnamn med formatet: min-prediko-app-backup-ÅÅÅÅ-MM-DD
DATE_STR=$(date +"%Y-%m-%d")
BACKUP_NAME="min-prediko-app-backup-${DATE_STR}.tar.gz"
BACKUP_PATH="$BACKUP_PARENT/$BACKUP_NAME"

echo "--------------------------------------------------"
echo " Skapar säkerhetskopia: $BACKUP_NAME"
echo "--------------------------------------------------"

# Skapa målmappen om den inte finns
mkdir -p "$BACKUP_PARENT"

# Komprimera projektet och uteslut tunga/genererade mappar
tar --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    --exclude='dist' \
    --exclude='build' \
    -czf "$BACKUP_PATH" -C "$(dirname "$PROJECT_DIR")" "$PROJECT_NAME"

echo "✔ Backup klar!"
echo "Sparad på: $BACKUP_PATH"
echo "--------------------------------------------------"
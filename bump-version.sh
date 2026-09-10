#!/bin/sh
# Sube la versión de la app: ?v= en los scripts, <meta app-version> y version.txt.
# Uso: ./bump-version.sh 20260911a
V="$1"; [ -z "$V" ] && { echo "uso: $0 VERSION"; exit 1; }
cd "$(dirname "$0")"
for f in index.html muro.html admin.html area.html reporte.html manual.html; do
  sed -i '' -e "s#\.js?v=[0-9a-z]*\"#.js?v=$V\"#g" -e "s#<meta name=\"app-version\" content=\"[^\"]*\">#<meta name=\"app-version\" content=\"$V\">#" "$f"
done
echo "$V" > version.txt
echo "versión $V aplicada"

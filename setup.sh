#!/bin/bash

# 🚀 QUICK START GUIDE - OdebraćTelefon Backend

echo "=========================================="
echo "  OdebraćTelefon Backend - Quick Start"
echo "=========================================="
echo ""

# Sprawdzenie Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js nie jest zainstalowany!"
    echo "📥 Pobierz z: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js: $(node -v)"
echo "✅ npm: $(npm -v)"
echo ""

# Instalacja zależności
echo "📦 Instalowanie zależności..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Zależności zainstalowane"
else
    echo "❌ Błąd podczas instalacji"
    exit 1
fi

echo ""
echo "=========================================="
echo "  🎉 Setup Ukończony!"
echo "=========================================="
echo ""
echo "📝 Dostępne polecenia:"
echo ""
echo "  npm start         - Uruchomienie serwera produkcyjnego"
echo "  npm run dev       - Uruchomienie serwera w trybie development (z auto-reload)"
echo ""
echo "🧪 Testowanie:"
echo ""
echo "  node client-example.js    - Uruchomienie zintegrowanych testów"
echo "  bash test-api.sh          - Testy curl (wymaga curl i jq)"
echo ""
echo "📖 Dokumentacja:"
echo ""
echo "  cat README.md             - Pełna dokumentacja API"
echo ""
echo "=========================================="
echo ""
echo "Aby uruchomić serwer, wpisz:"
echo ""
echo "  npm start"
echo ""
echo "Serwer będzie dostępny na: http://localhost:3000"
echo ""
#!/bin/bash

# Script do testowania API - OdebraćTelefon Backend

echo "🧪 Testowanie API OdebraćTelefon Backend"
echo "=========================================="
echo ""

BASE_URL="http://localhost:3000"
PHONE_NUMBER="506965234"

# Kolory dla output'u
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Health Check
echo -e "${YELLOW}1. Sprawdzanie statusu serwera...${NC}"
curl -s "${BASE_URL}/api/health" | jq '.'
echo ""

# 2. Analiza numeru telefonu
echo -e "${YELLOW}2. Analiza numeru telefonu (${PHONE_NUMBER})...${NC}"
curl -s -X POST "${BASE_URL}/api/analyze-phone" \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\": \"${PHONE_NUMBER}\"}" | jq '.'
echo ""

# 3. Pobieranie komentarzy - wszystkie
echo -e "${YELLOW}3. Pobieranie wszystkich komentarzy...${NC}"
curl -s -X POST "${BASE_URL}/api/get-comments" \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\": \"${PHONE_NUMBER}\"}" | jq '.'
echo ""

# 4. Pobieranie komentarzy - tylko negatywne z tekstem
echo -e "${YELLOW}4. Pobieranie tylko negatywnych komentarzy z tekstem...${NC}"
curl -s -X POST "${BASE_URL}/api/get-comments" \
  -H "Content-Type: application/json" \
  -d "{
    \"phoneNumber\": \"${PHONE_NUMBER}\",
    \"filter\": {
      \"rating\": 1,
      \"hasComment\": true
    }
  }" | jq '.'
echo ""

# 5. Pobieranie komentarzy - filtr po kategorii
echo -e "${YELLOW}5. Pobieranie komentarzy - filtr po kategorii...${NC}"
curl -s -X POST "${BASE_URL}/api/get-comments" \
  -H "Content-Type: application/json" \
  -d "{
    \"phoneNumber\": \"${PHONE_NUMBER}\",
    \"filter\": {
      \"category\": \"Telemarketer\"
    }
  }" | jq '.'
echo ""

# 6. Pobieranie statystyk
echo -e "${YELLOW}6. Pobieranie statystyk numeru...${NC}"
curl -s -X POST "${BASE_URL}/api/get-statistics" \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\": \"${PHONE_NUMBER}\"}" | jq '.'
echo ""

# 7. Test z innym numerem
OTHER_PHONE="585123456"
echo -e "${YELLOW}7. Test z innym numerem (${OTHER_PHONE})...${NC}"
curl -s -X POST "${BASE_URL}/api/analyze-phone" \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\": \"${OTHER_PHONE}\"}" | jq '.spamAnalysis'
echo ""

echo -e "${GREEN}✅ Testowanie ukończone!${NC}"
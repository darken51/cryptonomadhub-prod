#!/bin/bash

# SEO Verification Script for CryptoNomadHub
# Usage: ./scripts/verify-seo.sh

BASE_URL="https://cryptonomadhub.io"
COLORS=true

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   CryptoNomadHub SEO Verification${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Test 1: Check /countries page for country data in HTML
echo -e "${YELLOW}[1/6]${NC} Checking /countries SSR..."
COUNTRIES_HTML=$(curl -s "$BASE_URL/countries")
COUNTRY_COUNT=$(echo "$COUNTRIES_HTML" | grep -o "United Arab Emirates\|Portugal\|Singapore\|Germany\|Switzerland" | wc -l)

if [ "$COUNTRY_COUNT" -ge 5 ]; then
    echo -e "  ${GREEN}✓${NC} Found $COUNTRY_COUNT country names in HTML (SSR working)"
else
    echo -e "  ${RED}✗${NC} Only found $COUNTRY_COUNT countries - SSR may be failing"
fi

# Test 2: Check for "0 countries" issue
ZERO_COUNTRIES=$(echo "$COUNTRIES_HTML" | grep -o "0+ countries\|0 countries")
if [ -z "$ZERO_COUNTRIES" ]; then
    echo -e "  ${GREEN}✓${NC} No '0 countries' found in HTML"
else
    echo -e "  ${RED}✗${NC} Warning: Found '$ZERO_COUNTRIES' in HTML"
fi

# Test 3: Check for "*Conditions apply" badges
echo ""
echo -e "${YELLOW}[2/6]${NC} Checking '*Conditions apply' badges..."
CONDITIONS_COUNT=$(echo "$COUNTRIES_HTML" | grep -o "\*Conditions apply" | wc -l)
if [ "$CONDITIONS_COUNT" -ge 1 ]; then
    echo -e "  ${GREEN}✓${NC} Found $CONDITIONS_COUNT '*Conditions apply' badges"
else
    echo -e "  ${RED}✗${NC} No '*Conditions apply' badges found"
fi

# Test 4: Check JSON-LD ItemList
echo ""
echo -e "${YELLOW}[3/6]${NC} Checking JSON-LD structured data..."
ITEMLIST=$(echo "$COUNTRIES_HTML" | grep -o '"@type":"ItemList"')
DATASET=$(echo "$COUNTRIES_HTML" | grep -o '"@type":"Dataset"')

if [ -n "$ITEMLIST" ]; then
    echo -e "  ${GREEN}✓${NC} ItemList JSON-LD found (top 15 countries)"
else
    echo -e "  ${RED}✗${NC} ItemList JSON-LD missing"
fi

if [ -n "$DATASET" ]; then
    echo -e "  ${GREEN}✓${NC} Dataset JSON-LD found"
else
    echo -e "  ${RED}✗${NC} Dataset JSON-LD missing"
fi

# Test 5: Check sitemap.xml
echo ""
echo -e "${YELLOW}[4/6]${NC} Checking sitemap.xml..."
SITEMAP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/sitemap.xml")

if [ "$SITEMAP_STATUS" = "200" ]; then
    echo -e "  ${GREEN}✓${NC} sitemap.xml returns 200 OK"

    # Count URLs in sitemap
    SITEMAP_CONTENT=$(curl -s "$BASE_URL/sitemap.xml")
    URL_COUNT=$(echo "$SITEMAP_CONTENT" | grep -o "<loc>" | wc -l)
    echo -e "  ${GREEN}✓${NC} Sitemap contains $URL_COUNT URLs"

    # Check if it contains country pages
    COUNTRY_URLS=$(echo "$SITEMAP_CONTENT" | grep -o "/countries/[a-z][a-z]" | wc -l)
    if [ "$COUNTRY_URLS" -ge 10 ]; then
        echo -e "  ${GREEN}✓${NC} Sitemap includes $COUNTRY_URLS country pages"
    else
        echo -e "  ${YELLOW}⚠${NC}  Only $COUNTRY_URLS country pages in sitemap"
    fi
else
    echo -e "  ${RED}✗${NC} sitemap.xml returns $SITEMAP_STATUS (expected 200)"
fi

# Test 6: Check meta tags
echo ""
echo -e "${YELLOW}[5/6]${NC} Checking SEO meta tags..."
TITLE=$(echo "$COUNTRIES_HTML" | grep -o '<title>.*</title>' | sed 's/<[^>]*>//g')
META_DESC=$(echo "$COUNTRIES_HTML" | grep 'name="description"' | sed 's/.*content="\([^"]*\)".*/\1/')

if echo "$TITLE" | grep -q "0% Tax Guide"; then
    echo -e "  ${GREEN}✓${NC} Title contains '0% Tax Guide'"
    echo -e "      Title: $TITLE"
else
    echo -e "  ${RED}✗${NC} Title missing '0% Tax Guide'"
fi

if echo "$META_DESC" | grep -q "staking\|mining\|reporting"; then
    echo -e "  ${GREEN}✓${NC} Meta description includes crypto keywords"
else
    echo -e "  ${YELLOW}⚠${NC}  Meta description could be improved"
fi

# Test 7: Check canonical URL
echo ""
echo -e "${YELLOW}[6/6]${NC} Checking canonical URL..."
CANONICAL=$(echo "$COUNTRIES_HTML" | grep 'rel="canonical"' | sed 's/.*href="\([^"]*\)".*/\1/')

if echo "$CANONICAL" | grep -q "cryptonomadhub.io"; then
    echo -e "  ${GREEN}✓${NC} Canonical URL uses .io domain: $CANONICAL"
else
    echo -e "  ${RED}✗${NC} Canonical URL issue: $CANONICAL"
fi

# Summary
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Base URL: $BASE_URL"
echo "Countries in HTML: $COUNTRY_COUNT"
echo "Sitemap URLs: $URL_COUNT"
echo "Sitemap Status: $SITEMAP_STATUS"
echo ""

if [ "$COUNTRY_COUNT" -ge 5 ] && [ "$SITEMAP_STATUS" = "200" ] && [ -n "$ITEMLIST" ]; then
    echo -e "${GREEN}✓ SEO looks good! Googlebot should see populated content.${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠ Some SEO issues detected. Check the details above.${NC}"
    exit 1
fi

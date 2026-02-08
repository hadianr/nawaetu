#!/bin/bash
# Test Prayer Notification Endpoint
# Usage: ./scripts/test-notification.sh [environment]
# Example: ./scripts/test-notification.sh local
#          ./scripts/test-notification.sh production

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Default environment
ENV=${1:-local}

# Set API URL based on environment
if [ "$ENV" = "production" ]; then
    API_URL="https://nawaetu.com"
    echo -e "${YELLOW}Testing PRODUCTION environment${NC}"
elif [ "$ENV" = "local" ]; then
    API_URL="http://localhost:3000"
    echo -e "${YELLOW}Testing LOCAL environment${NC}"
else
    API_URL="$ENV"
    echo -e "${YELLOW}Testing custom URL: $ENV${NC}"
fi

# Get CRON_SECRET from environment or use default for local
if [ "$ENV" = "local" ]; then
    CRON_SECRET=${CRON_SECRET:-"test-secret"}
else
    if [ -z "$CRON_SECRET" ]; then
        echo -e "${RED}Error: CRON_SECRET environment variable not set${NC}"
        echo "For production testing, set CRON_SECRET first:"
        echo "  export CRON_SECRET=your-secret-key"
        exit 1
    fi
fi

echo ""
echo "=== Testing Prayer Notification Endpoint ==="
echo "URL: $API_URL/api/notifications/prayer-alert"
echo "Time: $(date)"
echo ""

# Make the request
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/notifications/prayer-alert" \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json")

# Extract HTTP status code (last line)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

# Extract response body (everything except last line)
BODY=$(echo "$RESPONSE" | sed '$d')

# Print results
echo "HTTP Status: $HTTP_CODE"
echo ""
echo "Response:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

# Check status
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Success!${NC}"
    
    # Parse and display results if available
    SENT=$(echo "$BODY" | jq -r '.results.sent // 0' 2>/dev/null)
    FAILED=$(echo "$BODY" | jq -r '.results.failed // 0' 2>/dev/null)
    SKIPPED=$(echo "$BODY" | jq -r '.results.skipped // 0' 2>/dev/null)
    PRAYER=$(echo "$BODY" | jq -r '.prayer // "none"' 2>/dev/null)
    
    if [ "$PRAYER" != "none" ] && [ "$PRAYER" != "null" ]; then
        echo ""
        echo "Prayer Time: $PRAYER"
        echo "Sent: $SENT"
        echo "Failed: $FAILED"
        echo "Skipped: $SKIPPED"
    fi
elif [ "$HTTP_CODE" = "401" ]; then
    echo -e "${RED}❌ Unauthorized - Check CRON_SECRET${NC}"
    exit 1
else
    echo -e "${RED}❌ Failed with status $HTTP_CODE${NC}"
    exit 1
fi

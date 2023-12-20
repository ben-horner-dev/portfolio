#!/bin/bash

# Ensure the DIGITALOCEAN_TOKEN environment variable is set
if [ -z "$DIGITALOCEAN_TOKEN" ]; then
  echo "DIGITALOCEAN_TOKEN is not set. Please set the environment variable."
  exit 1
fi

# Make a GET request to DigitalOcean API
response=$(curl -s -X GET \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DIGITALOCEAN_TOKEN" \
  "https://api.digitalocean.com/v2/regions")

# Extract and display region slugs using jq
filtered_data=$(echo "$response" | jq '.regions[].slug')
echo "$filtered_data"

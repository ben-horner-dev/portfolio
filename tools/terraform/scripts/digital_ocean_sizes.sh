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
  "https://api.digitalocean.com/v2/sizes")

# Extract and format desired data using jq
filtered_data=$(echo "$response" | jq '.sizes[] | {name: .slug, price: .price_monthly}')

# Display the formatted data
echo "$filtered_data"
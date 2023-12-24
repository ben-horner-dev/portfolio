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
  "https://api.digitalocean.com/v2/images?page=1&per_page=180")

# Extract and display image slugs with 'ubuntu' using jq and grep
filtered_data=$(echo "$response" | jq -r '.images[].slug' | grep 'ubuntu')
echo "$filtered_data"

#!/bin/bash
set -euo pipefail

source .env

# Start building the deploy command array.
deploy=(fly deploy)

# Iterate over the secret names output from 'fly secrets list'.
while IFS= read -r secret; do
  # Append each secret as a build-secret parameter.
  deploy+=(--build-secret "${secret}=${!secret}")
done < <(fly secrets list --json | jq -r '.[].Name')

# Optionally print the full command array.
echo "${deploy[@]}"

# To actually execute the command, uncomment the following line:
"${deploy[@]}"

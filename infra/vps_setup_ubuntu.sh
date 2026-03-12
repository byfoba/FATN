#!/usr/bin/env bash
set -euo pipefail

sudo apt-get update
sudo apt-get install -y nodejs npm ufw
sudo ufw allow OpenSSH
sudo ufw allow 9464/tcp
sudo ufw enable

echo "Install/configure NinjaTrader data feed connector on the VPS, then run bridge with systemd."

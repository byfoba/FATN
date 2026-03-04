#!/usr/bin/env bash
set -euo pipefail

sudo apt-get update
sudo apt-get install -y nodejs npm ufw
sudo ufw allow OpenSSH
sudo ufw allow 9464/tcp
sudo ufw enable

echo "Install IB Gateway manually or via container, then run bridge with systemd."

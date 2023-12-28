#!/bin/bash

username=$1
DIGITAL_OCEAN_TOKEN=$2
DOMAIN_NAME=$3
EMAIL=$4
SSH_PUB_KEY=$5

# Install deps
echo "Installing deps"
apt-get update -y
systemctl stop packagekit
echo 'deps installed'

# Install doctl
echo 'installing doctl'
curl -L https://github.com/digitalocean/doctl/releases/download/v1.64.0/doctl-1.64.0-linux-amd64.tar.gz | tar xvz
mv doctl /usr/local/bin
echo 'doctl installed'

# Install firewall
echo 'installing firewall'
apt-get install -y ufw
ufw allow ssh
ufw allow http
ufw allow 443/tcp
ufw --force enable
echo 'firewall installed'

# Setup user
echo 'setting up user'
adduser --gecos "" $username --disabled-password
passwd -d $username
usermod -aG sudo $username
echo 'user setup'

# Install certbot
echo 'installing certbot'
echo "dns_digitalocean_token = $DIGITAL_OCEAN_TOKEN" >> ~/certbot-creds.ini
apt install python3-certbot-dns-digitalocean -y
certbot certonly   --dns-digitalocean   --dns-digitalocean-credentials ~/certbot-creds.ini   -d $DOMAIN_NAME -d *.$DOMAIN_NAME --agree-tos -n --expand -v -m $EMAIL
echo 'certbot installed'

# Setup ssh
echo 'setting up ssh'
sed -i 's/^PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/^PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
mkdir /home/$username/.ssh

echo $SSH_PUB_KEY >> /home/$username/.ssh/authorized_keys
chmod 600 /home/$username/.ssh/authorized_keys
chown -R $username:$username /home/$username/.ssh/authorized_keys
service ssh restart
echo 'ssh setup'

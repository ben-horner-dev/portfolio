variable "SSH_PUB_KEY_PATH" {}
variable "USER_DATA_SCRIPT_PATH" {}
variable "DOMAIN_NAME" {}

terraform {
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
}

provider "digitalocean" {}

resource "digitalocean_ssh_key" "portfolio" {
  name       = "portfolio shh key"
  public_key = file(var.SSH_PUB_KEY_PATH)
}

resource "digitalocean_droplet" "portfolio" {
  image  = "ubuntu-23-10-x64"
  name   = "portfolio"
  region = "lon1"
  size   = "s-1vcpu-1gb"
  ssh_keys = [
    digitalocean_ssh_key.portfolio.id,
  ]
  tags      = ["latest"]
  user_data = file("${path.module}${var.USER_DATA_SCRIPT_PATH}")
}

resource "digitalocean_record" "main" {
  domain = var.DOMAIN_NAME
  type   = "A"
  name   = "@"
  value  = digitalocean_droplet.portfolio.ipv4_address
}

resource "digitalocean_record" "www" {
  domain = var.DOMAIN_NAME
  type   = "A"
  name   = "www"
  value  = digitalocean_droplet.portfolio.ipv4_address
}

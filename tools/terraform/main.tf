variable "SSH_PUB_KEY_PATH" {}
variable "SSH_PRIV_KEY_PATH" {}
variable "STARTUP_SCRIPT_PATH" {}
variable "DOMAIN_NAME" {}
variable "EMAIL" {}
variable "DIGITAL_OCEAN_TOKEN" {}
variable "USERNAME" {}


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
  tags = ["latest"]


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
  ttl    = 3600
  value  = digitalocean_droplet.portfolio.ipv4_address

  provisioner "file" {
    source      = "${path.module}${var.STARTUP_SCRIPT_PATH}"
    destination = "/tmp/script.sh"

    connection {
      type        = "ssh"
      user        = "root"
      private_key = file(var.SSH_PRIV_KEY_PATH)
      host        = digitalocean_droplet.portfolio.ipv4_address
    }


  }
  provisioner "remote-exec" {
    inline = [
      "chmod +x /tmp/script.sh",
      "/tmp/script.sh ${var.USERNAME} ${var.DIGITAL_OCEAN_TOKEN} ${var.DOMAIN_NAME} ${var.EMAIL} '${file(var.SSH_PUB_KEY_PATH)}'",

    ]


    connection {
      type        = "ssh"
      user        = "root"
      private_key = file(var.SSH_PRIV_KEY_PATH)
      host        = digitalocean_droplet.portfolio.ipv4_address
    }
  }



}

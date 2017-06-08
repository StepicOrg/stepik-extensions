#!/bin/bash
apt-key adv --recv-keys --keyserver keyserver.ubuntu.com 0xcbcb082a1bb943db
echo "deb [arch=amd64,i386] http://lon1.mirrors.digitalocean.com/mariadb/repo/10.1/debian jessie main" >> /etc/apt/sources.list
echo "deb-src http://lon1.mirrors.digitalocean.com/mariadb/repo/10.1/debian jessie main" >> /etc/apt/sources.list

apt-get update
apt-get install mariadb-server

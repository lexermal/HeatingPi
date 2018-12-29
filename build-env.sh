#!/bin/bash

if [ "$EUID" -ne 0 ]
  then echo "Please run as root"
  exit
fi

apt-get purge openjdk-8-jre-headless -y
apt-get install openjdk-8-jre-headless openjdk-8-jre git-core -y
git clone git://git.drogon.net/wiringPi
cd wiringPi
./build
curl -s get.pi4j.com | sudo bash
cd /opt/pi4j/examples
./build
java GpioOutputExample




#https://funprojects.blog/2018/03/18/control-raspberry-pi-gpio-with-java/






#!/bin/bash

if [ "$EUID" -ne 0 ]
  then echo "Please run as root"
  exit
fi

echo "#####################Remove old/Install new Software#########################"
apt-get purge openjdk-8-jre-headless -y
apt-get install openjdk-8-jre-headless openjdk-8-jre git-core -y

echo "#####################Install WiringPi#########################"
git clone git://git.drogon.net/wiringPi
cd wiringPi
./build
curl -s get.pi4j.com | sudo bash
cd /opt/pi4j/examples
./build
java GpioOutputExample


#https://funprojects.blog/2018/03/18/control-raspberry-pi-gpio-with-java/


echo "#####################Configure Raspberry#########################"

#add user pi to the gpio group
sudo usermod -a -G gpio pi
sudo chmod 777 /var/log
sudo touch /var/log/HeizungsPi.log
sudo chmod 777 /var/log/HeizungsPi.log





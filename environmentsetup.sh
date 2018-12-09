#!/usr/bin/env bash
sudo su
sudo apt-get purge openjdk-8-jre-headless -y&& sudo apt-get install openjdk-8-jre-headless -y&& sudo apt-get install openjdk-8-jre -y
sudo apt-get install git-core && git clone git://git.drogon.net/wiringPi &&  cd wiringPi  && ./build
curl -s get.pi4j.com | sudo bash
cd /opt/pi4j/examples && ./build 
java GpioOutputExample




#https://funprojects.blog/2018/03/18/control-raspberry-pi-gpio-with-java/






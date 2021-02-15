#!/bin/bash

if [ "$EUID" -ne 0 ]; then
  echo "Please run this script as root."
  exit
fi

apt-get update

if ! apt-get -qq install snapd; then

  echo "####################Activating sensor############################"
  echo "" >>/boot/config.txt
  echo "dtoverlay=w1-gpio" >>/boot/config.txt

  echo "######################Installing snap#############################"
  apt-get install snapd -y
  echo "Successfully installed snap deamon."
  echo "The system needs to restart. Afterwards run the script again."

  read -n1 -p "Should the system restart now?[y/n]" doit
  case $doit in
  y | Y) reboot ;;
  n | N) echo "Ok, the script will exit now." ;;
  *) echo "Invalid character" ;;
  esac

else
  echo "#####################Install new software#########################"

  snap install core
  snap install node --classic
  npm install --global yarn

  echo "#####################Install HeatingPi#########################"
  mkdir /home/pi/heatingpi
  chmod 777 /home/pi/heatingpi

  cd /home/pi/heatingpi || (echo "Cound not enter home/pi/heatingpi" && exit)
  tar -xzvf home/pi/heatingpi.tar.gz

  echo "#####################Configure raspberry#########################"

  chmod 777 /var/log
  touch /var/log/HeatingPi.log
  chmod 777 /var/log/HeatingPi.log

  echo "######################Configure cronjob##################"

  #write out current crontab
  crontab -l >mycron
  #echo new cron into cron file
  echo "@reboot cd /home/pi/heatingpi yarn prod >> /var/log/HeatingPi.log 2>&1" >>mycron
  #install new cron file
  crontab mycron
  rm mycron

fi

echo "Everything was installed successfully."
echo "Reboot to start the heatingpi at port 9000."

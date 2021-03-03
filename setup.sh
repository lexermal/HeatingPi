#!/bin/bash

if [ "$EUID" -ne 0 ]; then
  echo "Please run this script as root."
  exit
fi

apt-get update

if ! which node; then

  echo "####################Activating the temperature sensor############################"
  echo "" >>/boot/config.txt
  echo "dtoverlay=w1-gpio" >>/boot/config.txt

  echo "######################Installing node v15.8#############################"

  wget https://unofficial-builds.nodejs.org/download/release/v15.8.0/node-v15.8.0-linux-armv6l.tar.gz

  tar -xf node-v15.8.0-linux-armv6l.tar.gz
  mv node-v15.8.0-linux-armv6l /usr/local/node

  cd /usr/bin || (echo "Could not enter /usr/bin" && exit)
  ln -s /usr/local/node/bin/node node
  ln -s /usr/local/node/bin/npm npm

  echo "Verifying if installation worked."
  node -v # Verifying that the Node.js install worked
  npm -v  # Verifying that the npm install worked

fi

  echo "#####################Install yarn#########################"
  npm install --global yarn

  echo "#####################Install HeatingPi#########################"
  mkdir /home/pi/heatingpi
  chmod 777 /home/pi/heatingpi

  cd /home/pi/heatingpi || (echo "Could not enter /home/pi/heatingpi" && exit)
  tar -xzvf /home/pi/heatingpi.tar.gz

  echo "#####################Configure raspberry#########################"

  touch /var/log/HeatingPi.log
  chmod 777 /var/log/HeatingPi.log

  echo "######################Configure cronjob##################"

  #write out current crontab
  crontab -l >mycron
  #echo new cron into cron file
  echo "@reboot cd /home/pi/heatingpi &&  /usr/bin/yarn prod >> /var/log/HeatingPi.log 2>&1" >>mycron

  #install new cron file
  crontab mycron
  rm mycron

  echo "###################### Install deps of HeatingPi ##################"
  yarn prepare

echo "############################# Finished #############################"
echo "Everything was installed successfully."
echo "Reboot to start HeatingPi at port 9000."

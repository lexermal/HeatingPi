# HeatingPi V2
This software lets you control a heating via Raspberry Pi over a website or app.
The pins are physically mapped.

## Features
* Active schemas: Activate one or multiple schemas that will be used if the temperature range matches.

## Requirements
* Yarn
* Node > v11

## Pin mapping Raspberry Pi 1B
P1:
3V3    (1) (2)  5V    
GPIO2  (3) (4)  5V    
GPIO3  (5) (6)  GND   
GPIO4  (7) (8)  GPIO14  
GND    (9) (10) GPIO15   
GPIO17 (11) (12) GPIO18  
GPIO27 (13) (14) GND     
GPIO22 (15) (16) GPIO23  
3V3    (17) (18) GPIO24  
GPIO10 (19) (20) GND   
GPIO9  (21) (22) GPIO25  
GPIO11 (23) (24) GPIO8  
GND    (25) (26) GPIO7

## Setup on Raspberry Pi
1. Install hardware.
2. Copy heatingpi.tar.gz to /home/pi.
3. Run "setup-env.sh"


## Build the server
Run build.sh

## Access Server
https://{ip-of-pi}:9000

## Todo
* Write Cypress unit tests

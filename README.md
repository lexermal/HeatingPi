# HeatingPi V2
This software lets you control a heating via Raspberry Pi over a website or app.
The pins are physically mapped.

# Einschränkungen
* Sobald etwas gelöscht wird liefern die Unterelemente null/[] weil die Daten fürs Abtrufen gelöscht sind. Eg Schema->pins: schema{id:"222",...., pins:[]}

# Beschreibung
Schema Active: dieses Schema kann beim matchen des Temperaturbereichs aktiviert werden
Schema running: temperaturbereich matcht und das schema wird ausgeführt(pins sind geschalten)
Unter Schema setzt man die Schemas aktiv und wenn der Temperaturbereich matcht werden die Pins geschaltet
Statische files können über public ordner ausgeliefert werden
routine funkionen mit startup und cron mit sekunden und handler mit context und db
validator beschreiben

## Todo Rueto
* IV fixen mit DB eintrag des iv hinter datum als <daten>.<iv> Daten im Filter müssen dann alle in Applikation umgesetzt werden weiß nicht ob sich das rendiert bei rießen datensatz

## Todo HeizungsPI
GPIOs sind möglicherweise noch verdreht, also Pin 1= Relai 8 oder so. Checken und fixen.

## Vorgehensweise
2. Winston lokales logging und kompression fixen https://github.com/winstonjs/winston/blob/master/docs/transports.md#file-transport
3. noFilterOnNoID ersetzen durch: todo maybe filter method where this(look at schemahandler.schema.filter) gets created automatically and it only needs the args ids eg createArgsFilter(["id","active"])
   // const filter={
   //     args?:["id","active"],
   //     source?:["..."],
   //     required?:true
   // }
4. Config mit .env ersetzen https://medium.com/faun/handling-environment-variables-in-nodejs-9b976cb79bcb
5. unit tests schreiben
6. Hidden Infopage that displays the raw Logs(protected with a password)
7. Write Cypress unit tests
8. Readme anpassen


## Requirements
* Yarn
* Node > v11

## PinMapping
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

## Setup
1. Install hardware.
2. Copy heatingpi.tar.gz to /home/pi.
3. Run "setup-env.sh"


## Build the server
Run build-project.sh

## Access Server
https://{ip-of-pi}:9000

# To solve
pin 1 ist relai 8 ka warum

/settings oder /temperature,.... liefern fehler, dass kein file hinterlegt ist

pin active status wird nicht geupdatet wenn sich schema aktiviert oder es deaktiviert wird


# Temp switschen nur wenn es nicht bereits aktiv ist

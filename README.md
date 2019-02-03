#HeizungsPi
This software lets you controll a heating over a website or App.


##Simulationsmodus
Dieser ermöglicht es die Software ohne RaspberryPi zu benutzen. Hierbei werden die Pins simuliert und nicht wirklich angesteuert. 



##Build Server
Run build-project.sh

##Setup Raspberry Pi environment
1. Run "setup-env-sh"
2. Cancel script after it enters the example script
3. Run "crontab -e"
4. Copy HeizungsPi-1.0-SNAPSHOT.jar to /home/pi
5. Add "@reboot java -jar /home/pi/HeizungsPi-1.0-SNAPSHOT.jar >> /var/log/HeizungsPi.log 2>&1" to the end.
6. Reboot to finish

##Access Server
https://{pi}:9000

(https https://drissamri.be/blog/java/enable-https-in-spring-boot/)

##Todo
* testen des shutdown states
* junit tests schreiben
* Spring security dep installieren?
* Jest unit tests schreiben
* status page bei teilweise definierten schemen spinnt noch


##Future Features

###Backend
* Logs in db
* Infoseite wo logs angezeigt werden
* Log wie lange gerät online ist: eingeschaltet und ob internet down ist

###Frontend
* Dashboard:Temperaturkurve, Diagramm: wie lange es offline war, select mit schema auswählen und aktiv setzen
* Tests: Hier kann man Tests erstellen uns ausführen: Pins durchtesten, Standard test wird schon autom angelegt, einfach alle pins im sekundentakt ein und dann wieder aus
* Redux einbauen und Graphql querys darüber absetzen


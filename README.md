##Build
Mittels build-project.sh

##Access
https://localhost:9000

(https https://drissamri.be/blog/java/enable-https-in-spring-boot/)

##Todo
* testen des shutdown states
* junit tests schreiben
* Spring security dep installieren?
* Die jar muss noch mit sudo Rechten ausgeführt werden, weil pin 8 es nicht anders erlaubt.
* Jest unit tests schreiben
* status page bei teilweise definierten schemen spinnt noch


##Zukunftsmusik


###Backend
* Logs in db
* Infoseite wo logs angezeigt werden
* Log wie lange gerät online ist: eingeschaltet und ob internet down ist


###Frontend
* Dashboard:Temperaturkurve, Diagramm: wie lange es offline war, select mit schema auswählen und aktiv setzen
* Tests: Hier kann man Tests erstellen uns ausführen: Pins durchtesten, Standard test wird schon autom angelegt, einfach alle pins im sekundentakt ein und dann wieder aus
* Redux einbauen und Graphql querys darüber absetzen


##Simulationsmodus
Dieser ermöglicht es die Software ohne RaspberryPi zu benutzen. Hierbei werden die Pins simuliert und nicht wirklich angesteuert. 


##Setup
https://askubuntu.com/questions/99232/how-to-make-a-jar-file-run-on-startup-and-when-you-log-out

Und mittels build-env.sh script
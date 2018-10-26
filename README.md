Die Jar wird mit 
./gradlew build
gebaut.


https://askubuntu.com/questions/99232/how-to-make-a-jar-file-run-on-startup-and-when-you-log-out

#Wichtig
 * Die Datenbank ist ein pfusch. Es gibt Pins, PinsStats und Schemas. 
  * Pinstate soll eine normale Tabelle sein, und nicht die versteckte wie jetzt
  * Auch im graphql schema so umsetzen


##Nächste Schritte
* Jetzt gehört ein Frontend gebaut.
* Gradle task das react vorm bauen der jar ausgeführt wird
* implementieren des default states
* unittests schreiben
* schauen was die pi4j Lib noch alles kann (./resources/java)
* Löschen von unnätiger Dateien (auch im resource Ordner)
* Graphql login
* Spring https https://drissamri.be/blog/java/enable-https-in-spring-boot/
* Spring security dep installieren?

Graphql error handling  
https://picodotdev.github.io/blog-bitix/2017/11/devolver-mensajes-de-error-descriptivos-en-graphql/
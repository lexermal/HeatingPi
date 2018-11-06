#Build
Mittels build-project.sh

#Wichtig
 * Die Datenbank ist ein pfusch. Es gibt Pins, PinsStats und Schemas. 
  * Pinstate soll eine normale Tabelle sein, und nicht die versteckte wie jetzt
  * Auch im graphql schema so umsetzen


##Frontend todo
* Schemas
  * name save graphql
  * aktiv setzen eines schemas
  * delete graphql
  * edit save graphql
    
* Pins
  * name save graphql
  * default save graphql
  
* landing page
  * tbd
  * zeigen was aktiv ist vlt letzten login, wie lange es offline war,....
  * ... temperatur, letzte änderung, .... ka einfach ein paar statistiken und vlt notfalls button alaa alles ausschalten
  
* activ
  * löschen dieses routing points. inhalte sind alle auf landing page
    
  

##Backend todo
* implementieren des default states
* unittests schreiben
* schauen was die pi4j Lib noch alles kann (./resources/java)
* Löschen von unnätiger Dateien (auch im resource Ordner)
* Graphql login
* Spring https https://drissamri.be/blog/java/enable-https-in-spring-boot/
* Spring security dep installieren?

Graphql error handling  
https://picodotdev.github.io/blog-bitix/2017/11/devolver-mensajes-de-error-descriptivos-en-graphql/

https://askubuntu.com/questions/99232/how-to-make-a-jar-file-run-on-startup-and-when-you-log-out

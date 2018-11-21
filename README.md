##Build
Mittels build-project.sh

##Frontend todo
* Schemas
  * name save graphql
  * aktiv setzen eines schemas
  * delete graphql
  * edit save graphql
  * aktiv setzen eines schemas
  
* landing page - Dashboard
  * anzeigen des aktiven schemas
  * Navbar element in link element umbauen
  * zeigen was aktiv ist vlt letzten login, wie lange es offline war,....
  * ... temperatur, letzte änderung, .... ka einfach ein paar statistiken und vlt notfalls button als alles ausschalten
  
  

##Backend todo
* implementieren des default states
* unittests schreiben
* Graphql login
* Spring https https://drissamri.be/blog/java/enable-https-in-spring-boot/
* Spring security dep installieren?
* Umbau für simulation der Lib, also trotzdem alle features, nur soll der zugriff auf die lib simulierbar sein

###Umbau des States
 * Die Datenbank ist ein pfusch. Es gibt Pins, PinsStats und Schemas. 
  * Pinstate soll eine normale Tabelle sein, und nicht die versteckte wie jetzt
  * Auch im graphql schema so umsetzen
Graphql error handling  
https://picodotdev.github.io/blog-bitix/2017/11/devolver-mensajes-de-error-descriptivos-en-graphql/

https://askubuntu.com/questions/99232/how-to-make-a-jar-file-run-on-startup-and-when-you-log-out

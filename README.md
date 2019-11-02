# HeatingPi
This software lets you control a heating via Raspberry Pi over a website or App.


## Simulationmode
Let's run the software without a Raspberry Pi. It does not really access the GPIO Sockets. 

Limitations: The pin state is always on.


## Build the server
Run build-project.sh

## Setup the Raspberry Pi environment
1. Copy HeizungsPi-1.0-SNAPSHOT.jar to /home/pi
2. Run "setup-env.sh"
3. Reboot to finish

## Access Server
https://{pi}:9000


# Interation 1 bugfixes and improvements
* Bug: Man wird raus gehaut wenn man sich einloggt, beim 2. Login funkts dann
* junit tests schreiben


# Interation 2 - Security & GInputs

## Backend
* Write raw Logs into files(one file per application run)
* Write raw Logs info database
* Remove access token from logs when valid
* Implement userlogs(Logs that the user can see) with categories(sessions, schema activations, ...)
* Check and log Software uptime and Internet accessibility 
* Graphql enable cors
* Protect graphql from brute force
* Protect logs from brute force
* New username and password because old is not secure anymore
* GInputs(see below)

## Frontend
* Hidden Infopage that displays the raw Logs(protected with a password)
* On Dashboard show device and internet uptime chart
* Implement Redux and make Graphql querys over it
* Write Jest unit tests
* Logout button with on/off Symbol and circle border around.
The circle border gets shorter with every minute.
At 75% the border is till 9 o clock full. 
At 45% the border is till 5 o clock full. 
Resets to 100% every time the api call was successful.
Auto logout at 0%
* Pin page comes into settings
* Flag set last schema after restart in settings

## GInputs
Adds the functionalitiy to handle GPIO Inputs

### Backend
* Auto add all inputs info the database
* Input attributes: id, name, state(not included in the db)

### Frontend
* Show Inputs with the current signal and rename them


# Interation 3 - Logs & Automatisation

## Backend
* Make application stateless
* Delete oldest logfiles if max configured storage in folder is reached
* Manage users in db
* Manage sessions in db 
* force name of device on login
* If login with same name although already logged in, kill other session 
* Log schema activations
* Log Logins
* Implement Events(see below)
* Expand userlogs with events

## Frontend
* Show schema activations from user
* Show logged in devices
* Show last login
* Check accessibility from outside and fire event if not
* Build log page with filter from category(all, sessions, schemas, events)


## Events
Consists of simple IF and THEN block. Not sure how to handle combined IFs or more THENs


### Backend
* Email shipment for events
* Check for detected event on eg schema change and check if a schema is there


### Frontend
* Configure events that do something eg Email shipment on specific schema activation
or activate schema on gpio input is on, changed, off or 
send push on raspy rebooted or
if schema activated and pin is not active send email 
* Settingspage for email settings with full imap and smtp config
* quick schema setting with select on dashboard
* Replace the typescript plugin with the create-react-app native typescript 

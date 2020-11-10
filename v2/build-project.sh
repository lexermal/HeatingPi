#!/bin/sh
echo "starting building project"
cd src/main/frontend/ || exit
yarn build
cd ../../../
rm -Rf src/main/resources/static/
cp src/main/frontend/build/ src/main/resources/static -r
./gradlew build
# java -jar build/libs/HeizungsPi-1.0-SNAPSHOT.jar

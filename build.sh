#!/bin/bash

echo "################ Build the frontend ##############"
cd frontend || (echo "Could not enter ./frontend" && exit)
yarn build
cd ..

echo "################ Build the backend ##############"
cd backend || (echo "Could not enter ./backend" && exit)
yarn build
yarn copy-files
yarn minimize
cd ..

echo "################ Copy files ######################"
cp frontend/out/. backend/dist/public -r


echo "################ Create archive ##################"
cd backend/dist/ || (echo "Could not enter ./backend/dist" && exit)
tar -czvf ../../heatingpi.tar.gz *

echo "################ Clean up ########################"
rm -Rf frontend/out
rm -Rf backend/dist


echo "The package was successfully build."
echo "It can be found in the current directory as 'heatingpi.tar.gz'."




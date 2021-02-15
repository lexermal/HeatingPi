#!/bin/bash

echo "################ Build the frontend ##############"
cd frontend || (echo "Cound not enter ./frontend" && exit)
yarn build
cd ..

echo "################ Build the backend ##############"
cd backend || (echo "Cound not enter ./backend" && exit)
yarn build
yarn copy-files
yarn minimize
cd ..

echo "################ Copy files ######################"
cp frontend/out/. backend/dist/customized/public -r


echo "################ Create archive ##################"
cd backend/dist/ || (echo "Cound not enter ./backend/dist" && exit)
tar -czvf ../../heatingpi.tar.gz *

echo "################ Clean up ########################"
rm -Rf frontend/out
rm -Rf backend/dist


echo "The package was sucessfully build."
echo "It can be found in the current directory as 'heatingpi.tar.gz'."




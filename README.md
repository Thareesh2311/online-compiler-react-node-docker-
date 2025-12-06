# online-compiler-react-node-docker-

step-1 create a folder

run these commands

-->mkdir online-compiler
-->cd online-compiler

step-2 inside online-compiler 
1. create node backend
   mkdir backend
   cd backend
   npm init -y
   npm install express body-parser uuid

2. create react frontend
   cd ..
   npx create-react-app frontend

step-3 run them 
1. to run backend
   node server.js
2. to run frontend
   npm start


step-4 intsall docker 
https://www.docker.com/products/docker-desktop/

Pull all language runtime images:

docker pull gcc
docker pull openjdk:20-slim
docker pull python:3.11-slim
docker pull node:18-slim


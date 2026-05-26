@echo off
echo Installing and starting Backend...
cd server
call npm install
call npx prisma db push
start cmd /k "npm run dev"

cd ..
echo Installing and starting Frontend...
call npm install
start cmd /k "npm run dev"

#!/bin/bash
echo "Starting backend..."
cd backend
source venv/bin/activate
FLASK_APP=run.py flask run -p 5001 > backend.log 2>&1 &
BACKEND_PID=$!
cd ..

echo "Starting frontend..."
cd frontend
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo "Waiting for servers to start..."
sleep 5

echo "Taking screenshots..."
node take_screenshots.js

echo "Killing servers..."
kill $BACKEND_PID
kill $FRONTEND_PID
echo "Done!"

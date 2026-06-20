#!/bin/bash

# Start backend
echo "Starting backend..."
cd backend
source venv/bin/activate
python run.py &
BACKEND_PID=$!
cd ..

# Start frontend
echo "Starting frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "Waiting for servers to start (10 seconds)..."
sleep 10

echo "Running playwright script..."
node screenshot.mjs

echo "Killing backend ($BACKEND_PID) and frontend ($FRONTEND_PID)..."
kill $BACKEND_PID
kill $FRONTEND_PID

echo "All done."

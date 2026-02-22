#!/bin/bash

SESSION_NAME="frontend_app"

# Check if session already exists
if screen -list | grep -q "$SESSION_NAME"; then
    echo "Frontend is already running."
    exit 1
fi

echo "Starting frontend in current directory..."
screen -dmS "$SESSION_NAME" npm run dev

echo "Frontend started in session '$SESSION_NAME'."
echo "View logs: screen -r $SESSION_NAME"

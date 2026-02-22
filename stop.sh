#!/bin/bash

SESSION_NAME="frontend_app"

echo "Stopping frontend..."
screen -X -S "$SESSION_NAME" quit

echo "Frontend stopped."






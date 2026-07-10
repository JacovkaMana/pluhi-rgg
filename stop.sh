#!/bin/bash

SESSION_NAME_FRONTEND="frontend_app"
SESSION_NAME_SERVER="server_app"

stop_session() {
    local session_name="$1"
    local display_name="$2"

    # Safely check for the exact session name
    if screen -list "$session_name" > /dev/null 2>&1; then
        screen -X -S "$session_name" quit
        echo "$display_name stopped."
    else
        echo "$display_name is not running."
    fi
}

echo "Stopping services..."
stop_session "$SESSION_NAME_FRONTEND" "Frontend"
stop_session "$SESSION_NAME_SERVER" "Server"

echo "All services stopped."
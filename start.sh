#!/bin/bash

SESSION_NAME_FRONTEND="frontend_app"
SESSION_NAME_SERVER="server_app"

start_session() {
    local session_name="$1"
    local command="$2"
    local display_name="$3"

    if screen -list | grep -q "$session_name"; then
        echo "$display_name is already running."
        return 1
    fi

    screen -dmS "$session_name" $command
    echo "$display_name started in session '$session_name'."
}

start_session "$SESSION_NAME_FRONTEND" "npm run dev" "Frontend"
start_session "$SESSION_NAME_SERVER" "npm run server" "Server"

echo "All services started."
echo "View frontend logs: screen -r $SESSION_NAME_FRONTEND"
echo "View server logs: screen -r $SESSION_NAME_SERVER"

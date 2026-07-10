#!/bin/bash

SESSION_NAME_FRONTEND="frontend_app"
SESSION_NAME_SERVER="server_app"

start_session() {
    local session_name="$1"
    local command="$2"
    local display_name="$3"

    # Better way to check if a screen session exists (avoids false positives)
    if screen -list "$session_name" > /dev/null 2>&1; then
        echo "$display_name is already running in '$session_name'."
        return 1
    fi

    # 1. Use bash -c to safely execute the command
    # 2. Source .bashrc (or .zshrc) so npm/nvm is found
    # 3. Add 'exec bash' at the end so the screen session stays open if the app crashes
    screen -dmS "$session_name" bash -c "source ~/.bashrc; $command; exec bash"
    
    echo "$display_name started in session '$session_name'."
}

start_session "$SESSION_NAME_FRONTEND" "npm run dev" "Frontend"
start_session "$SESSION_NAME_SERVER" "npm run server" "Server"

echo "All services started."
echo "View frontend logs: screen -r $SESSION_NAME_FRONTEND"
echo "View server logs: screen -r $SESSION_NAME_SERVER"
#!/bin/bash
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi
echo "Starting development server..."
npm run dev > dev.log 2>&1 &
echo "Waiting for server to start..."
URL=""
for i in {1..6}; do
  sleep 5
  URL=$(grep -o '"'"'http://localhost:[0-9][0-9]*'"'"' dev.log | head -1)
  if [ -n "$URL" ]; then
    break
  fi
done
if [ -n "$URL" ]; then
  echo "Server is running at: $URL"
  echo "You can stop the server by killing the background process or closing the terminal."
else
  echo "Failed to detect server URL after 30 seconds. Check dev.log for details."
fi
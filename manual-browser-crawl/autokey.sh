#!/bin/bash 
 
xdotool key alt+Tab
sleep 1
for i in {1..38} 
do
  xdotool key ctrl+v 
  sleep 1 
  xdotool key Return
  sleep 2 
done

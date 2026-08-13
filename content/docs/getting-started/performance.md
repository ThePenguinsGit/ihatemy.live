---
title: 'Performance'
description: 'How to check server TPS with /spark and use Observable to find and fix lag caused by your base on our modded Minecraft servers.'
position: 0.3
howto:
  name: 'How to check server TPS and find what is lagging the server'
  steps:
    - 'Run `/spark tps` in chat to check the server. A TPS of 20 means the server is generally running well.'
    - 'If TPS is below 20, set an Observable keybind: open your controls, search for "Profiler", and pick a key with no conflicts. Observable is available from Level 10.'
    - 'Press the keybind to open Observable, then click "Profile TPS" to scan for 30 seconds.'
    - 'Read the overlay: Observable colours blocks by how much they cost, marking the laggiest ones red with a value on top.'
    - 'Open the profile link Observable posts in chat to see every tile entity on the server, collapsing the dimensions you do not play in.'
    - 'If the TPS is low and your base chunk coordinates show up in the top 10, clean your base up.'
---

## How do I check if the server is lagging?

Just run `/spark tps` in chat! A TPS of 20 means the server is running fine, anything
lower means something is dragging it down. If it's low you can use Observable
(unlocked at Level 10) to see which blocks are costing the most, and then go clean up
whatever shows up at the top.

<img style="float: right;" src="/img/docs/performance/tps-view.png" alt="The output of /spark tps, showing the server's current TPS">

To make sure our servers run well, every player needs to do their part too!  
This page here will tell you how you can check if the server is lagging and what's causing it.  
To see if the server is lagging, simply do `/spark tps`  
Now usually a TPS of 20 means that the server is generally running well!  
But if it's lower than that...  you can use Observable to see what's causing it!

## Observable (Level 10+)
Observable is used to see what's specifically lagging the server. To start using Observable you need to set a keybind!  
![Observable GUI](/img/docs/performance/observable-keybind.png "Fancy")
As you can see, you just need to search for "Profiler" and it will show up! (Be sure to select a keybind that has no conflicts!)  
After pressing that keybind you'll see this screen:

<div style="text-align: center;">
<img style="display: inline-block;" src="/img/docs/performance/observable-gui.png" alt="The Observable profiler window with the Profile TPS button">
</div>

## Using Observable
To start scanning, just click that "Profile TPS" button. After 30 seconds Observable will report back in 2 ways:  
Observable will overlay colors and values over certain blocks. The higher the number, the "laggier" it is! (Oversimplification) It will mark the "laggy" blocks as red.  
Here's an example of a "laggy" block  
![Observable Overlay](/img/docs/performance/observable-overlay.png "Its not that bad")
In chat, Observable will tell you that it uploaded a profile, after that it shows you a link you can click!  
Once you've followed the link it will give you information about all tile entities on the server. Dimensions are sorted into categories, so if you dont live in the overworld, you should collapse the overworld category.  
Now if the TPS is low, and you see your bases' chunk coordinates in the top 10, you better start cleaning up! We w̶̠̔̎i̴̫͛͛l̸̻̕l̴͈̃̒ f̶̨̲͔͔͇͆́i̶̘͕̤͗̓̋͐͘͝n̸̡͙͕͌̊̒́͜ḑ̵͙̘̭̃̋̃ y̵̛̼͇̖̮̾̔͛̂͌̌͒̽͠ő̴̡̧͉̤̼̝̰u̸͈̭̟̯͉̖̗̺̟̍̆͗̓͒̇̊!  

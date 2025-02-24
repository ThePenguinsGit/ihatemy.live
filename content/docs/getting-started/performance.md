---
title: 'Performance'
position: 1
---

::card
## Performance Guide

<img style="float: right;" src="/img/docs/performance/tps-view.png">

To make sure our servers run well, every player needs to do their part too!  
This page here will tell you how you can check if the server is lagging and what's causing it.  
To see if the server is lagging, simply do `/spark tps`.  
Now usually a TPS of 20 means that the server is generally running well!  
But if it's lower than that...  you can use Observable to see what's causing it!
::



::card
## Observable
Observable is used to see what's specifically lagging the server. To start using Observable you need to set a keybind!  
![Observable GUI](/img/docs/performance/observable-keybind.png "Fancy")
As you can see, you just need to search for "Profiler" and it will show up! (Be sure to select a keybind that has no conflicts!)  
After pressing that keybind you'll see this screen.

<div style="text-align: center;">
<img style="display: inline-block;" src="/img/docs/performance/observable-gui.png">
</div>
::

::card
## Using Observable
To start scanning, just click that "Profile TPS" button. After 30 seconds Observable will report back in 2 ways:  
Observable will overlay colors and values over certain blocks. The higher the number, the "laggier" it is! (Oversimplification) It will mark the "laggy" blocks as red.  
Here's an example of a "laggy" block  
![Observable Overlay](/img/docs/performance/observable-overlay.png "Its not that bad")
In chat, Observable will tell you that it uploaded a profile, after that it shows you a link you can click!  
Once you've followed the link it will give you information about all tile entities on the server. Dimensions are sorted into categories, so if you dont live in the overworld, you should collapse the overworld category.  
Now if the TPS is low, and you see your bases' chunk coordinates in the top 10, you better start cleaning up! We w̶̠̔̎i̴̫͛͛l̸̻̕l̴͈̃̒ f̶̨̲͔͔͇͆́i̶̘͕̤͗̓̋͐͘͝n̸̡͙͕͌̊̒́͜ḑ̵͙̘̭̃̋̃ y̵̛̼͇̖̮̾̔͛̂͌̌͒̽͠ő̴̡̧͉̤̼̝̰u̸͈̭̟̯͉̖̗̺̟̍̆͗̓͒̇̊!  
::



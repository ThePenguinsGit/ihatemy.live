---
title: 'Lag Hunting'
position: 8
---

::card
## Using Observable right
The same principles to [lag hunting](/docs/getting-started/performance) apply here too, but with the added benefit of being able to teleport to every listed entity/chunk shown in the web version of the Observable profiler.  

Simply click on "visit" to copy the command you can run ingame to visit the selected potential lag source
## Spark in depth
Spark is a mod we use to detect server lag on a large scale.  
They have a pretty extensive documentation for it, which you can find [here](https://spark.lucko.me/docs/)

If you use spark correctly **you will find the reason for lag**, so check out the docs!
## Crash Utilities
Doesn't really do anything to help with crashes, also doesn't crash the server (weird, right?)
What it does do is very handy though. It has a ton of utility commands for lag hunting & entity finding/removal. Refer to the [admin commands page](commands) for the commands.

After pressing ctrl + u in-game a UI will open, listing all loaded chunks and entities. Simply click the remove button to the right of the listed entities to remove them.
::
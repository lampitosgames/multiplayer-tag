Round 2 electric boogaloo

This meets most of the requirements under the Prototype 2 submission.  The only one not in here is the "Game Over" state.  I have more than 3 states (Loading, Tutorial, Main Screen, 
Connecting, Playing, Paused), but I don't have the logic for the end of the game fully implemented.

BUUUUT

Since last time I've done a lot
- Made a level editor importer from a program called Tiled.  It lets me have an external GUI for placing tiles/platforms and making objects.  I export the tileset metadata (width/height of tiles,
tile count, etc) from there along with the map metadata.  Then I have a module that is server/client agnostic that loads the level into both the client and server side physics engines.
- New jumping physics.  Complete recode of the entire way physics works.  Now better than ever!
- Tilesets drawing to make the world.
- Multi-tileset compatibility
- Client-side prediction to reduce the horrendous lag prototype 1 had
- Accounting for latency in the delta time
- Completely new input detection module that only sends updates to the server after an input has occurred.  Otherwise the server just simulates location
- Redone jumping code
- Split the server update loop into a game update loop and a networking update loop.  The networking one loops and sends out player locations, but only does so at 30fps so it doesn't overload the network
- Added a scoring module to keep track of the game state.  Added the "tagging" mechanic so that one player is an attacker trying to tag all other players.
- Added to keys.js so that you can bind a function to multiple keys at once
- Created an entire game view system that follows objects.  It supports parallax and render culling (things outside of it aren't drawn to save on performance)
- Added a font and game states.
- Created a tutorial screen with temp artwork.
- Created a loading state that waits for all asynchronous file loading to resolve.  Each file that resolves fills the loading progress bar
- Created a temporary title screen
- Created a connecting state.  The player doesn't connect to the game until this state is reached
- Added pause functionality to onblur and onfocus.
- Created drop platforms.  These are non-solid and you can fall through them.
- Made a final(ish) level for the game.

Probably a lot of other things.  I've spent 50 hours on this game this week.  I might be doing too much.  Might be losing my mind....
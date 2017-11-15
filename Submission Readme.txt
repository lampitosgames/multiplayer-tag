** How did I meet the requirements? **
1 Media Requirements (20%)
- Sound
	- [x] Background sound that loops.  It only plays when the game is actually running though.  Not on the tutorial, start, connecting, 
	  or end screens
	- [x] Effect sounds.  There are sound effects for jumping, new players being tagged, game over, and the last 15 seconds of the game
	- [x] Only MP3 and WAV files
	- [x] Custom sounds not handed out in class
- Images
	- [x] Consistent theme or style.  I went for a nice cartoonish art style.  The best asset by far is the crouch asset.  Its just 
	  so funny to move around/jump while crouching.  Extra points for rapid crouch style!
	- [x] Only JPEG and PNG images
	- [x] Custom assets not handed out in class
- Text/Fonts
	- [x] Embedded Grobold font and used it throughout the game
	- [x] Easily read
	- [ ] I didn't use google or an external hosting site.  The font is hosted on my server
- Canvas Drawing/Animation
	- [x] Everything is drawn to an HTML5 <canvas> element.  I didn't use an engine so everything is custom
	- [x] Must draw an image on the canvas.  In fact I draw many!  I built a custom tilesheet system
	- [x] At least one object on screen should move or animate.  I support animated sprites with any number of frames / animation speed
	  Currently the only assets using this functionality are the players, but adding more would be trivial.  Animated sprites use 
	  spritesheets
	- [x] Must draw a particle system to the canvas.  The attacking player has a particle emitter attached for better visibility
	- [x] Animations/movement must be smoothed using requestAnimationFrame and likely frame counting or delta time.  I have a server/
	  client agnostic timing module that I used to calculate and sync delta time on both the server and the client. Not only that, the 
	  physics system is simulated on both client and server using calculated delta time
	- [ ] Must cancel animations with window.cancelAnimationFrame().  See the notes section for details
	- [x] The project should have visually engaging graphics and effects.  I have a consistent art style with matching fonts
	- [x] Use a variety of <canvas> capabilities including the ability to draw paths, bitmaps, gradients, shadows, etc.  I use a lot of
	  canvas functionality.  Mostly to draw images and the HUD

2 Interaction Requirements (20%)
- Control (game)
	- [x] The user should be able to control at least one image/sprite on the screen.  Yep.  Every player has a character they control
	- [x] Controls should be easy to use, responsive and intuitive.  I actually have controls bound to multiple keys using my keys.js 
	  module.  It lets the player play how they want
	- [x] Game must have keyboard controls.
	- [ ] Use a "key daemon" array to capture multiple inputs simultaneously.  I did something a little more complex than this.  My 
	  keys module has an array of callback functions for every key and lets me bind multiple keys to the same callback function from 
	  anywhere in the app.  I also have boolean detection for which keys are currently pressed, mouse button support, and mouse scroll 
	  support

3 Usability Requirements (20%)
- [x] App must pause/unpause with window.onblur and window.onfocus
- [x] Teaching.  There is a tutorial screen that teaches people how to play
- [x] Feedback.  Its pretty easy to understand what is going on.  There is a score and game timer.  Each of the game states is displayed
  clearly and there are even sound cues for some of them.
- [?] Difficulty.  This one is entirely based on the skill of players you are playing with
- [x] Mouse / onscreen UI.  It is all there.
- [x] Game states.  I have a bunch.  There are actually two trackers, one for client state and one for the actual game state.  The game state 
  is handled server-side and progresses automatically with timers.  The client state changes based on user input

4 Experience/Game Design Requirements (20%)
- [x] Meeting your plan.  I made a cool game
- Game Specific Requirements
	- [x] Playable by at least one person, has rules, has a win/lose condition.  Yep, all there.  Playable by any number of people.  See 
	  in-game for rules
	- [x] Does user choice matter?  Yeah.  If you don't run away you get tagged
	- [x] Does your game have depth? Yep! After playtesting for a few hours there are certainly optimal strategies
	- [x] As the user learns how to play the game can they improve?  Absolutely.  We had a new guy come in like 1.5 hours into the 
	  playtest and he got butchered.
	- [x] Is the game fun/engaging?  I certainly think so.  It has a long way to go to be release-worthy, but for a 2.5 week long 
	  prototype it is fantastic
	- [x] Do your images/sprites behave in interesting ways?  I think the view system and the ability to zoom in/out qualifies for this

5 Coding Requirements (20%)
I have a lot of other homework.  Pretend I put a check next to each of these requirements.
Yes I preload images (and other data).  I have a client-side loading state that fills a progress bar as promises resolve.
New keyword is used a TON. Physics objects sprites, backgrounds, players, spritesheets, etc.
Everything uses the module pattern.  Some modules are shared between the server and the client.

6 Penalties
I don't have any errors.  If you find some email me since I want to keep working on this game (though not at this insanely unhealthy pace)

7 Above and Beyond
lol

8 Quality Levels
If this doesn't qualify as "best" I will fight you

=============================================================================================================================================

** Grade I would give myself **
Easily 100%.  There might be a few minor things here and there, but I went so far above and beyond I feel like bugs are forgiveable.
I essentially killed myself making this game.  We had 2.5 weeks to make this and I spent well above 75 hours developing it.
See "Total monster energy drinks consumed during the making of this game.txt" for more info

=============================================================================================================================================

** Changes from original design **
I actually made quite a few.  Initially I wanted players to be able to kick others across the map.
I was also going to track score based on how many times players got tagged rather than how long they remained "it".  Playtests showed 
that was not fun
There were a TON of level design changes.
Initially the game was going to only be displayed on a single screen (no views).  It became apparent pretty quickly that I needed a view
system for this game to look good
I wanted to implement a physics system similar to box2d so that I could do cool stuff like moving platforms and curved edges, etc.  About 
4-5 days into working on this I realized that in order for the platforming to feel tight, I needed to hard code AABB platform physics and 
forget about realistic simulation.
There are probably other changes

=============================================================================================================================================

** What went right/wrong?  What would I add given the time? **
I think this game is a ton of fun.  My friends and I stayed up last night playtest for over 2 hours and just had an absolute blast.  The 
platforming controls are incredibly tight (though I'd make some changes like toggle-able sprinting, etc.) and the game is actually fun.
Going forward I want to add better smoothing for other players.  As it stands there is a ton of lag from other players leading to unfair 
moments in gameplay.  Its frustrating to get tagged and not know why or how.  Right now I'm trusting the attacking client with telling the 
server when they tag someone which can frustrate people.
Going forward there is a ton I want to add to make it better.  I want to add server lobbies, level selection, level editors, better level 
design, powerups, individual "heroes", better/more art, more player art, more game modes and mechanics (freeze tag), positional sound effects 
so its easier to know when players are creeping up, better UI since its shit right now, early jump exiting, and maybe collectible coins.
Basically just a bunch of polish
Probably more user options too
And better music.  The music is mediocre at best

=============================================================================================================================================

** Resources / Credits **
- Client-side Libraries
	- Victor.js : http://victorjs.org/
- Art Assets (Creative Commons)
	- https://opengameart.org/content/platformer-art-complete-pack-often-updated
	- https://opengameart.org/content/free-keyboard-and-controllers-prompts-pack
	- Grobold font https://www.dafont.com/grobold.font
- Sound Assets
	- The #GameAudioGDC Bundle Part 2 - http://www.sonniss.com - (Royalty Free)
	- Reusenoise  (DNB Mix) by spinningmerkaba (c) copyright 2017 Licensed under a Creative Commons Attribution (3.0) license
	  http://dig.ccmixter.org/files/jlbrock44/56531
- NPM Packages:
	- babel
	- nodemon
	- express
	- jsonfile
	- socket.io
	- victor
- Tutorials
	- http://buildnewgames.com/real-time-multiplayer/
	- http://error454.com/2013/10/23/platformer-physics-101-and-the-3-fundamental-equations-of-platformers/
	- Lots of stackoverflow / googling / etc.

=============================================================================================================================================

** Notes / Extra **
- After talking to Professor Cody in class we decided that since its a multiplayer game I don't really need cancelAnimationFrame.
  I know how to use it (you canl look at my last project for that).  Anyway, the game still has a pause/unpause state when the window loses 
and gains focus.  Just thought that this was worth bringing up
- I try to handle players leaving/joining during a game in the best way that I can without a spectator mode.  It is still buggy
- I haven't tested it with more than 8 players.  I'm sure it breaks at some point
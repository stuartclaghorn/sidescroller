var SideScroller = SideScroller || {};

SideScroller.Boot = function(){};
 
//setting game configuration and loading the assets for the loading screen
SideScroller.Boot.prototype = {
  preload: function() {
    //assets we'll use in the loading screen
    this.load.image('preloadbar', 'assets/images/preloader-bar.png');
  },
 
  create: function() {
    //loading screen will have a white background
    this.game.stage.backgroundColor = '#fff';
    //scaling options
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
 
    //have the game centered horizontally and vertically
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;
 
    //screen size will be set automatically
    this.scale.setScreenSize(true);
 
    //physics system - 3 possible physics - using ARCADE
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.state.start('Preload');
  }
 
};

//loading the game assets
SideScroller.Preload = function(){};
SideScroller.Preload.prototype = {
  preload: function() {
 
    //show loading screen
    this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'preloadbar');
    this.preloadBar.anchor.setTo(0.5);
    this.preloadBar.scale.setTo(3);
    this.load.setPreloadSprite(this.preloadBar);
 
    //load game assets
    this.load.tilemap('level1', 'assets/tilemaps/level1.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.image('gameTiles', 'assets/images/tiles_spritesheet.png');
    this.load.image('player', 'assets/images/player.png');
    this.load.image('playerDuck', 'assets/images/player_duck.png');
    this.load.image('playerDead', 'assets/images/player_dead.png');
    this.load.image('goldCoin', 'assets/images/goldCoin.png');
    this.load.audio('coin', 'assets/audio/coin.wav');
  },
 
  create: function() {
    this.state.start('Game');
  }
};
  
SideScroller.Game = function(){};
SideScroller.Game.prototype = {
  preload: function() {
      this.game.time.advancedTiming = true;
  },
 
  create: function() {
	this.map = this.game.add.tilemap('level1');

	// the first parameter is the tileset name as specified in Tiled
	this.map.addTilesetImage('tiles_spritesheet', 'gameTiles');

	// create layers
	this.backgroundLayer = this.map.createLayer('backgroundLayer');
	this.blockedLayer = this.map.createLayer('blockedLayer');

	// collision on blockedLayer
	this.map.setCollisionBetween(1, 100000, true, 'blockedLayer');

	// resizes the game world to match the layer dimensions
	this.backgroundLayer.resizeWorld();

    //create player
    this.player = this.game.add.sprite(100, 300, 'player');

	// enable physics on the player
	this.game.physics.arcade.enable(this.player);

	// player gravity
	this.player.body.gravity.y = 1000;

	// properties when the player is ducked and standing so we can use in update()
	var playerDuckImg = this.game.cache.getImage('playerDuck');
	this.player.duckedDimensions = {width: playerDuckImg.width, height: playerDuckImg.height};
	this.player.standDimensions = {width: this.player.width, height: this.player.height};
	this.player.anchor.setTo(0.5,1);

	// the camera will follow the player in the world
	this.game.camera.follow(this.player);

	//move player with cursor keys
	this.cursors = this.game.input.keyboard.createCursorKeys();
  }, 
 
  update: function() {
	  // collision
	  this.game.physics.arcade.collide(this.player, this.blockedLayer, this.playerHit,null, this);

	  // Give player a velocity (possible since physics engine is enabled)
	  this.player.body.velocity.x = 300; 
 
	  if(this.cursors.up.isDown) {
		  this.playerJump();
	  } else if {
		  this.playerDuck();
	  }
	  if (!this.cursors.down.isDown && this.player.isDucked) {
		  // change image and update the body size for the physics engine
		  this.player.loadTexture('player');
		  this.player.body.setSize(this.player.standDimensions.width, this.player.standDimensions.height);
		  this.player.isDucked = false;
	  }
	  if (this.player.x >= this.game.world.width) {
		  this.game.state.start('Game');
	  }
  },
 
  render: function() {
    this.game.debug.text(this.game.time.fps || '--', 20, 70, "#00ff00", "40px Courier");  
  }

  playerHit: function(player, blockedLayer) {
     //if hits on the right side, die
    if(player.body.blocked.right) {
      //set to dead (this doesn't affect rendering)
      this.player.alive = false;
 
      //stop moving to the right
      this.player.body.velocity.x = 0;
 
      //change sprite image
      this.player.loadTexture('playerDead');
 
      //go to gameover after a few miliseconds
      this.game.time.events.add(1500, this.gameOver, this);
    }
  
  
  }

  playerJump: function() {
	  // Is player touching ground, then jump (-y is going -up-)
	  if (this.player.body.blocked.down) {
		  this.player.body.velocity.y -= 700;
	  }
  }
  
  playerDuck: function() {
	  // change image and update the body size for the physics engine
	  this.player.loadTexture('playerDuck');
	  this.player.body.setSize(this.player.duckedDimensions.width, this.player.duckedDimensions.height);
	  this.player.isDucked = true;
};

SideScroller.game = new Phaser.Game(746, 420, Phaser.AUTO, '');
SideScroller.game.state.add('Boot', SideScroller.Boot);
SideScroller.game.state.add('Preload', SideScroller.Preload);
SideScroller.game.state.add('Game', SideScroller.Game);
SideScroller.game.state.start('Boot');

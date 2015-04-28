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

	// the camera will follow the player in the world
	this.game.camera.follow(this.player);
	
  }, 
 
  update: function() {
	  // collision
	  this.game.physics.arcade.collide(this.player, this.blockedLayer, this.playerHit,null, this);
  },
 
  render: function() {
    this.game.debug.text(this.game.time.fps || '--', 20, 70, "#00ff00", "40px Courier");  
  }

  playerHit: function(player, blockedLayer) {}
};

SideScroller.game = new Phaser.Game(746, 420, Phaser.AUTO, '');
SideScroller.game.state.add('Boot', SideScroller.Boot);
SideScroller.game.state.add('Preload', SideScroller.Preload);
SideScroller.game.state.add('Game', SideScroller.Game);
SideScroller.game.state.start('Boot');

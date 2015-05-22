
var SideScroller = SideScroller || {};

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

	// create all the coins in the game
	this.createCoins;

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

	// sounds
	this.coinSound = this.game.add.audio('coin');

  }, 
 
  update: function() {
	  // collision
	  this.game.physics.arcade.collide(this.player, this.blockedLayer, this.playerHit,null, this);

	  // overlap
	  this.game.physics.arcade.overlap(this.player, this.coins, this.collect, null, this);

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
  },

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
  
  },

  playerJump: function() {
	  // Is player touching ground, then jump (-y is going -up-)
	  if (this.player.body.blocked.down) {
		  this.player.body.velocity.y -= 700;
	  }
  },
  
  playerDuck: function() {
	  // change image and update the body size for the physics engine
	  this.player.loadTexture('playerDuck');
	  this.player.body.setSize(this.player.duckedDimensions.width, this.player.duckedDimensions.height);
	  this.player.isDucked = true;
  },

  // find objects in a Tiled layer that contain a property called 'type' equal
  //  equal to a certain value
  findObjectsByType: function(type, map, layerName) {
	var result = new Array();
	map.objects[layerName].forEach(function(element) {
		if (element.properties.type === type) {
			// Phaser uses top left, Tiled bottom left so we have to adjust
			// Also keep in mind that some images could be of different size as
			//  as the tile size so they might not be placed in the exact
			//  position as in Tiled
			element.y -= map.tileHeight;
			result.push(element);
		}
	});
	return result;
  },

  // Create Coins
  createCoins: function() {
	  this.coins = this.game.add.group();
	  this.coins.enableBody = true;

	  var result = this.findObjectsByType('coin', this.map, 'objectsLayer');
	  result.forEach(function(element) {
		  this.createFromTiledObject(element, this.coins);
	  }, this);
  },

  collect: function(player, collectable) {
	  // play audio
	  this.coinSound.play();

	  // remove sprite
	  collectable.destroy();
  }
};


/**
 * Main entry point to game. Called in html.
 */
Crafty.scene("testMap", function() {
	var map = Crafty.e("2D, DOM, TiledMap, Persistent")
		// Temporary level loading using 1, 2, 3, etc.
		.bind('KeyDown', function(e) {
			if(e.key == Crafty.keys["1"]) {
				this.loadMap("test");
			} else if(e.key == Crafty.keys["2"]) {
				this.loadMap("test2");
			} else if(e.key == Crafty.keys["3"]) {
				this.loadMap("palace");
			} else if(e.key == Crafty.keys["0"]) {
				Crafty.trigger("SpawnPlayer");
			}
		})
		.loadMap("palace", function() {
			Crafty.trigger("SpawnPlayer");
		});

	var bg = Crafty.e("2D, DOM, Image, Parallax, Persistent")
		.image("http://www.mlahanas.de/Greeks/images/Parallax.jpg")
		.scrollFactor(0.2);

	Crafty.sprite("assets/sprites/player.png",
		{ player: [0,0,32,32] }
	);

	var scroller = Crafty.e("Scroller, Persistent");

	// Create the physics ticker.
	// This triggers physics ticks, which are used to more precisely control
	// when entities are updated.
	var ticker = Crafty.e("PhysicsTicker, Persistent");

});


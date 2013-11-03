
/**
 * Main entry point to game. Called in html.
 */
Crafty.scene("testMap", function() {
	var map = Crafty.e("2D, DOM, TiledMap")
		.loadMap("test2");

	var bg = Crafty.e("2D, DOM, Image, Parallax")
		.image("http://www.mlahanas.de/Greeks/images/Parallax.jpg")
		.scrollFactor(0.2);

	Crafty.sprite("assets/sprites/player.png",
		{ player: [0,0,32,32] }
	);

	var scroller = Crafty.e("Scroller");

	// Create the physics ticker.
	// This triggers physics ticks, which are used to more precisely control
	// when entities are updated.
	var ticker = Crafty.e("PhysicsTicker");
});


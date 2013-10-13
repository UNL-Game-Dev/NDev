
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

	for(var i = 0; i < 11; ++i) {
		var player = Crafty.e("2D, DOM, player, Physical, Collision");
		player.setPhysPos(i*40 + 15 , 0);
	}

	var ticker = Crafty.e("PhysicsTicker");
});


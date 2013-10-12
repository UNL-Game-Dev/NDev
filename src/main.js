
/**
 * Main entry point to game. Called in html.
 */
Crafty.scene("testMap", function() {
	var map = Crafty.e("2D, DOM, TiledMap")
		.loadMap("test");

	var bg = Crafty.e("2D, DOM, Image, Parallax")
		.image("http://www.mlahanas.de/Greeks/images/Parallax.jpg")
		.scrollFactor(0.2);

	var player = Crafty.e("2D, DOM, Image, Physical")
		.image("https://cdn4.iconfinder.com/data/icons/soda_pop_caps/PNG/Sprite_128.png");

	var ticker = Crafty.e("PhysicsTicker");
});


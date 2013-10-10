
/**
 * Main entry point to game. Called in html.
 */
Crafty.scene("testMap", function() {
	var map = Crafty.e("2D, DOM, TiledMap")
		.loadMap("test");

	Crafty.background("url(http://www.mlahanas.de/Greeks/images/Parallax.jpg)");
});


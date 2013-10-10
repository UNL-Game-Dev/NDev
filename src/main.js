
var tiledMapBuilder;

/**
 * Main entry point to game. Called in html.
 */
function startGame() {
	// Create the entity that will hold the tile map.
	tiledMapBuilder = Crafty.e("2D, DOM, TiledMapBuilder");

	// Load the test map
	$.getJSON("assets/maps/test.json", onTiledMapLoaded);
}

function onTiledMapLoaded(json) {
	tiledMapBuilder.setMapDataSource(json); 
	tiledMapBuilder.createWorld( function( map ) {
		console.log("Done creating world.");
	}); 
}

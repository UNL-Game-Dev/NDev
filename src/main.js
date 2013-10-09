
var tiledMapBuilder = Crafty.e("2D, DOM, TiledMapBuilder")
	.setMapDataSource(m); 
// map is set from map.json. This is an alternative to loading it, since loading
// json dynamically doesn't work locally.

tiledMapBuilder.createWorld( function( map ){
	console.log("Done creating world.");
}); 


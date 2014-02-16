/**
 * Component that displays image
 */
Crafty.c("TileImage", {
	init:
	function() {
		this.requires("2D");
	},
	
	tile:
	function(gid) {
		// If the object has a gid property, then display its image
		if(gid) {
			this.gid = gid;
			this._sprite = "Tile" + gid;
			this
				.requires("Canvas")
				.requires(this._sprite);
		}
		return this;
	}
});
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
		// When moving object, correct for the fact that Tiled has origin at the
		// bottom-left while Crafty has origin at the top-left.
		this.unbind("UpdateDraw");
		this.bind("UpdateDraw", function() {
			if(this.has("Physical")) {
				this.x = Math.round(this._phPX);
				this.y = Math.round(this._phPY) - this.h;
			}
		});
		return this;
	}
});

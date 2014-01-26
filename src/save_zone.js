var dialogHTML = '<div class="save-dialog">Click to save!</div>';

/**
 * A zone that, when entered, allows the player to save the game.
 */
Crafty.c("SaveZone", {
	init:
	function() {
		this.requires("Collision");

		this.requires("ZoneEnterTrigger")
			.setOnZoneEnter(this.promptSave);
	},

	promptSave:
	function() {
		if(!this._promptActive) {
			var saveZone = this;

			console.log("Prompting save.");

			var dialog = Crafty.e("HTML, Mouse")
				.attr({ x: this.x, y: this.y, w: 150, h:100 })
				.replace(dialogHTML)
				.one("Click", function(e) {
					// Save, so that the player will respawn at this zone.
					saveGame(saveZone);
					// Destroy the dialog, not the zone!
					this.destroy();
				});

			this._promptActive = true;
		}
	},
});

function saveGame(saveZone) {
	// Save current map and position to respawn, then save.
	var gs = Crafty("GameState");

	gs.data.lastSavedLocation = {
		x: saveZone.x,
		y: saveZone.y,
		map: Crafty("TiledMap").mapName
	};

	gs.save();

	saveZone._promptActive = false;
}
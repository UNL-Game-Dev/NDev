/**
 * A door. Created by map_objects, and used to move between maps.
 */
Crafty.c("Door", {
	init:
	function() {
		this.requires("Collision");

		this.requires("ZoneEnterTrigger")
			.setOnZoneEnter(this.moveToTarget);
	},

	/**
	 * Execute the door transition.
	 */
	moveToTarget:
	function() {
		var targetDoor = this._targetDoor;

		// Get the black "fade out" overlay.
		var overlay = getOverlay();

		var door = this;

		var goThrough = function() {
			Crafty("TiledMap").loadMap(door._targetMap, function() {
				// When the map loads, add the player to the target door.
				// (The old player will have been deleted.)
				var player = Crafty.e("Player");
				// Put the player on the target door.
				Crafty("MapDoor").each(function(e) {
					if(this._name == targetDoor) {
						player.setPhysPos(this.x, this.y);
						// Make sure the player doesn't go right back through.
						this.setCollidingLast(true);
					}
				});

				// Undo the fade to black.
				$(overlay).fadeTo(600, 0.0, function() {
					// Enable physics.
					Crafty("PhysicsTicker").enabled = true;
				});

			});
		};

		// Load the next map after the fade to black completes.
		$(overlay).fadeTo(600, 1.0, goThrough);

		// Disable physics until the other side.
		Crafty("PhysicsTicker").enabled = false;
	},
});

var screenOverlay = null;

/**
 * Gets (and maybe creates) a screen overlay.
 */
function getOverlay() {
	if(screenOverlay == null) {
		$(".screen-overlay").append(
			'<div id="door-overlay" style="' +
			'background-color: #000; opacity: 0.0;'+
			'width: 800px; height: 600px;' +
			'z-index: 50; position: absolute;' +
			'" >&nbsp;</div>'
		);
		screenOverlay = $("#door-overlay")[0];
	}
	return screenOverlay;
}
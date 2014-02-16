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
		Crafty("TiledMap").loadMap(this._targetMap, function() {
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
		});
	},
});
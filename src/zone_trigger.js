/**
 * A zone that responds to the player entering it.
 */
Crafty.c("ZoneEnterTrigger", {
	init:
	function() {
		this.onHit("PlatformControls", function(hit) {
			// Only activate if the player wasn't colliding last frame.
			if(!this._triggerCollidingLast) {
				// A change in state to "inside" indicates entered.
				// Trigger the handler if it exists.
				if(this.onZoneEnterTrigger) {
					this.onZoneEnterTrigger();
				}
				this._triggerCollidingLast = true;
			}
		}, function() {
			this._triggerCollidingLast = false;
		});
	},

	setCollidingLast:
	function(collidingLast) {
		this._triggerCollidingLast = collidingLast;
	},

	setOnZoneEnter:
	function(callback) {
		this.onZoneEnterTrigger = callback;
	}
});

/**
 * A zone that continuously responds to the player's presence.
 */
 Crafty.c("ZoneInsideTrigger", {
 	// TODO: Implement when needed.
 });
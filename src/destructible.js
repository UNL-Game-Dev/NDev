/**
 * Object that can be destroyed by something destructive, such as an explosion.
 */

Crafty.c("Destructible", {
	init:
	function() {
		this._onDestruct = null;
		this._destructDelay = 0;
		this._destructed = false;
		this.requires("Collision").onHit("Destructive", this._destruct);
	},

	/**
	 * Execute a given function before destruction, waiting for a delay before
	 * destroying the entity (delay defaults to 0).
	 */
	onDestruct:
	function(destructCallback, delay) {
		this._onDestruct = destructCallback;
		this._destructDelay = delay || 0;
	},

	/**
	 * Destroy the entity, after executing any other given behavior.
	 */
	_destruct:
	function() {
		// Don't re-destruct after already destructing.
		if(this._destructed) {
			return;
		}

		this._destructed = true;
		if(this._onDestruct) {
			this._onDestruct.call(this);
		}
		this.timeout(this.destroy, this._destructDelay);
	}
});

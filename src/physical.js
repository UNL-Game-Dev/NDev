
/**
 * Crafty component that carries out physics ticks in order.
 */
Crafty.c("PhysicsTicker", {

	init:
	function() {
		this.bind("EnterFrame", function() {
			Crafty.trigger("EvaluateAccel");
			Crafty.trigger("ResolveConstraint");
			Crafty.trigger("EvaluateInertia");
			Crafty.trigger("UpdateDraw");
		});
	}

});

/**
 * Crafty component for being affected by basic tile collision response.
 */
Crafty.c("Physical", {

	init: 
	function() {
		this._phX = this._x;
		this._phY = this._y;
		this._phPX = this._phX;
		this._phPY = this._phY;
		this._phAX = 0.0;
		this._phAY = 0.0;

		this.bind("EvaluateAccel", function() {
			// Debug gravity.
			// TODO: Move this into its own component.
			this._phAY += 9.8;
			// Seconds per frame.
			var sPerF = 1.0 / Crafty.timer.getFPS();
			// Apply acceleration to velocity. Since velocity is stored as the
			// difference between the prev frame and the next, apply as
			// p += a * t^2
			this._phX += this._phAX * sPerF * sPerF;
			this._phY += this._phAY * sPerF * sPerF;
			this._phAX = 0.0;
			this._phAY = 0.0;
		}).bind("ResolveConstraint", function() {
			var map = Crafty("TiledMap");
			var colResponse = map.resolvePos(this._phX, this._phY);
			for(var i = colResponse.length - 1; i >= 0; --i) {
				var response = colResponse[i];
				this._phX += response[0];
				this._phY += response[1];
			}
		}).bind("EvaluateInertia", function() {
			var px = this._phPX;
			var py = this._phPY;
			this._phPX = this._phX;
			this._phPY = this._phY;
			this._phX += this._phX - px;
			this._phY += this._phY - py;
		}).bind("UpdateDraw", function() {
			this.x = this._phX * 32;
			this.y = this._phY * 32;
		});
	}

});


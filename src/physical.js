
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
			this._phAX += 0.5;
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
			var colResponse = map.resolvePos(this._phX+0.5, this._phY+1.0);
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
			this.x = this._phPX * 32;
			this.y = this._phPY * 32;
		});
	},

	setPhysPos:
	function(x, y) {
		this._phX = x;
		this._phY = y;
		this._phPX = x;
		this._phPY = y;
	}

});

//---------------------------
// Common physics vector math.
// Assumes vectors in form [x,y]

// Returns the dot product of v1 and v2.
function dot(v1, v2) {
	return v1[0]*v2[0] + v1[1]*v2[1];
}

// Returns the "right" (+rotation in this orientation) normal.
function rNormal(v) {
	return [-v[1], v[0]];
}

// Returns the normalized version of the given vector.
function norm(v) {
	var x = v[0];
	var y = v[1];
	var d = Math.sqrt(x*x + y*y);
	return [x/d, y/d];
}

function dist2(v) {
	var x = v[0];
	var y = v[1];
	return x*x + y*y;
}

// Returns v1 + v2
function add(v1, v2) {
	return [v1[0] + v2[0], v1[1] + v2[1]];
}

// Returns v1 - v2
function sub(v1, v2) {
	return [v1[0] - v2[0], v1[1] - v2[1]];
}

// Returns v * scalar
function scale(v, scalar) {
	return [v[0]*scalar, v[1]*scalar];
}


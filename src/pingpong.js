/**
 * An object that moves until it hits a wall, then reverses.
 */
Crafty.c("PingPong", {
	_defaultSpeed: 50,
	
	init:
	function() {
		this.requires("2D, Collision, Physical, FakeInertia, DefaultPhysicsDraw")
		.attr({
			speed: this._defaultSpeed,
			_dir: [1, 0]
		})
		.bind("PrePhysicsTick", function() {
			//var fps = Crafty.timer.FPS();
			//this._phX += this._dir[0] * this.speed / fps;
			//this._phY += this._dir[1] * this.speed / fps;
		});
	},
	
	direction:
	function(angle) {
		this._dir = [Math.cos(angle*pi/180), Math.sin(angle*pi/180)];
	}
});
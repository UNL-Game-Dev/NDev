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
			_dir: [1, 0],
			_reversed: false
		})
		.bind("PrePhysicsTick", function() {
			var fps = Crafty.timer.FPS();
			
			// Reverse when hitting a wall.
			if(this.hit("Tile")) {
				this._reversed = !this._reversed;
			}
			
			var backForth = this._reversed ? -1 : 1;
			this._phX += backForth * this._dir[0] * this.speed / fps;
			this._phY += backForth * this._dir[1] * this.speed / fps;
		});
	},
	
	direction:
	function(angle) {
		this._dir = [Math.cos(angle*Math.pi/180), Math.sin(angle*Math.pi/180)];
	}
});
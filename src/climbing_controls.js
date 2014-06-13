/**
 * Controls for climbing vertically, such as on a ladder.
 */
Crafty.c("ClimbingControls", {
	
	init:
	function() {
		
		this.requires("Sensor, Tween");
		
		// Bind event handlers.
		this.requires("StateMachine").state("Climb", {
			
			PrePhysicsTick:
			function() {
				
				// Check if not on ladder anymore, and if so, switch to platform
				// state.
				if(!this.sense("ClimbableRight", this._phX - 5, this._phY, -4)
				&& !this.sense("ClimbableLeft", this._phX + 5, this._phY, -4)) {
					this.setState("Platform");
					return;
				}
				
				// Check if reaching top of ladder leading to level surface, and
				// if so, climb up onto it.
				if(!this.sense("Tile", this._phX + (this.direction === "left" ? -16 : +16), this._phY - 16) && !this._ledgeClimb) {
					this._ledgeClimb = true;
					this.tween({
						_phY: this._phY - 16
					}, 200).timeout(function() {
						console.log("over");
						this.tween({
							_phX: this._phX + (this.direction === "left" ? -160 : +160)
						}, 200).timeout(function() {
							this._ledgeClimb = false;
						}, 200);
					}, 200);
					return;
				}
				
				if(Crafty.keydown[Crafty.keys.LEFT_ARROW]) {
					this._phX -= 1;
				} else if(Crafty.keydown[Crafty.keys.RIGHT_ARROW]) {
					this._phX += 1;
				}
				
				if(Crafty.keydown[Crafty.keys.UP_ARROW]) {
					this._phY -= 1;
				} else if(Crafty.keydown[Crafty.keys.DOWN_ARROW]) {
					this._phY += 1;
				}
			},
			
			EvaluateInertia:
			function() {
				this._phPY = this._phY;
				this._phPX = this._phX;
			}
		});
	}
});

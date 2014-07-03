/**
 * Controls for climbing vertically, such as on a ladder.
 */
Crafty.c("ClimbingControls", {
	
	init:
	function() {
		
		this.requires("Sensor, Tween");
		
		// Bind event handlers.
		this.requires("StateMachine").state("Climb", {
			
			EnterState:
			function() {
				this._ladderSide = this.dx;
			},
			
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
				if(!this.sense("Tile", this._phX + this._ladderSide * 16, this._phY - 24) && !this._ledgeClimb) {
					this._ledgeClimb = true;
					this.tween({
						_phY: this._phY - 24,
						_phPY: this._phPY - 24
					}, 200).timeout(function() {
						this.tween({
							_phX: this._phX + this._ladderSide * 16,
							_phPX: this._phPX + this._ladderSide * 16
						}, 200).timeout(function() {
							this._ledgeClimb = false;
						}, 200);
					}, 200);
					return;
				}
				
				if(this._ladderSide == +1
				&& Crafty.keydown[Crafty.keys.LEFT_ARROW]) {
					this.setState("Platform");
				} else if(this._ladderSide == -1
				&& Crafty.keydown[Crafty.keys.RIGHT_ARROW]) {
					this.setState("Platform");
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

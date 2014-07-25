/**
 * Controls for climbing vertically, such as on a ladder.
 */
Crafty.c("ClimbingControls", {
	
	init:
	function() {
		
		this.requires("Sensor, Tween, Controls");
		
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
				if(!this.sense("ClimbableRight", this._phX - 5, this._phY, 4)
				&& !this.sense("ClimbableLeft", this._phX + 5, this._phY, 4)) {
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
				
				// See if we are turning away from the ladder.
				if(this._ladderSide * this.getControl("Horizontal") < 0) {
					this.setState("Platform");
				}
				
				// Move vertically on the ladder.
				this._phY += this.getControl("Vertical");
			},
			
			EvaluateInertia:
			function() {
				this._phPY = this._phY;
				this._phPX = this._phX;
			}
		});
	}
});

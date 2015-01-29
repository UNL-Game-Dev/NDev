/**
 * State for climbing vertically, such as on a ladder.
 */
Crafty.c("ClimbingState", {
	
	init:
	function() {
		
		this.requires("Sensor, Tween, Controls");
		
		// Bind event handlers.
		this.requires("StateMachine").state("Climb", {
			
			EnterState:
			function() {
				this._ladderSide = this.dx;
                var side = this.dxSelect('Left', 'Right');
                if (this.keyDown('down') && !this.keyDown('up')) {
                    this.animate('PlayerClimbDown' + side, -1);
                } else if (this.keyDown('up') && !this.keyDown('down')) {
                    this.animate('PlayerClimbUp' + side, -1);
                } else {
                    this.animate('PlayerLadder' + this.dxSelect('Left', 'Right'), -1);
                }
			},

			ControlPressed:
			function(data) {
                var side = this.dxSelect('Left', 'Right');
				if ((data.control === 'up' && this.keyDown('down'))
				|| (data.control === 'down' && this.keyDown('up'))) {
					this.animate('PlayerLadder' + side, -1);
				} else if (data.control === 'up') {
                    this.animate('PlayerClimbUp' + side, -1);
                } else if (data.control === 'down') {
					this.animate('PlayerClimbDown' + side, -1);
				}
			},

			ControlReleased:
			function(data) {
                var side = this.dxSelect('Left', 'Right');
				if ((data.control === 'up' && !this.keyDown('down'))
				|| (data.control === 'down' && !this.keyDown('up'))) {
					this.animate('PlayerLadder' + side, -1);
				} else if (data.control === 'up') {
                    this.animate('PlayerClimbDown' + side, -1);
                } else if (data.control === 'down') {
					this.animate('PlayerClimbUp' + side, -1);
				}
			},
			
			PrePhysicsTick:
			function() {
				
				// Check if not on ladder anymore, and if so, switch to platform
				// state.
				if(!this.sense("ClimbableRight", -5, 0, 4)
				&& !this.sense("ClimbableLeft", 5, 0, 4)) {
					this.setState("Platform");
					return;
				}
				
				// Check if reaching top of ladder leading to level surface, and
				// if so, climb up onto it.
				if(!this.sense("Tile", this._ladderSide * 16, -24) && !this._ledgeClimb) {
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
							this.setState("Platform");
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

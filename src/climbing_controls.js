/**
 * Controls for climbing vertically, such as on a ladder.
 */
Crafty.c("ClimbingControls", {
	
	init:
	function() {
		
		// Bind event handlers.
		this.requires("StateMachine").state("Climb", {
			
			EnterState:
			function() {
				this._ladderX = this._phX;
			},
			
			PrePhysicsTick:
			function() {
				
				if(Crafty.keydown[Crafty.keys.LEFT_ARROW]) {
					this._phX -= 1;
				} else if(Crafty.keydown[Crafty.keys.RIGHT_ARROW]) {
					this._phX += 1;
				}
				
				if(!approx(this._phX, this._ladderX, 1.0)) {
					this.setState("Platform");
					return;
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

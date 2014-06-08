/**
 * Controls for climbing vertically, such as on a ladder.
 */
Crafty.c("ClimbingControls", {
	
	init:
	function() {
		
		// Bind event handlers.
		this.requires("StateMachine").state("ClimbingControls", {
			
			PrePhysicsTick:
			function() {
				if((this.direction === "left"
				&& Crafty.keydown[Crafty.keys.RIGHT_ARROW])
				|| (this.direction === "right"
				&& Crafty.keydown[Crafty.keys.LEFT_ARROW])) {
					this.setState("PlatformControls");
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

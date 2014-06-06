/**
 * Controls for climbing vertically, such as on a ladder.
 */
Crafty.c("ClimbingControls", {
	
	init:
	function() {
		
		// Bind event handlers.
		this.requires("StateMachine").initState("ClimbingControls", {
			PrePhysicsTick:
			function() {
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

/**
 * Light beam.
 * A thin beam of light emanating from one object and activating other objects.
 */

Crafty.c("LightBeam", {
	init:
	function() {
		this.requires("2D, DOM, lightBeam")
		    .origin(this.w / 2, 0);
		//this.h = 128;
		this.rotation = 150;
		this.visible = false;
	}
});
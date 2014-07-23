Crafty.c("Meter", {
	init:
	function() {
		this.maxMeter = 1.0;
		this.meter = 1.0;
	},
	
	changeMeter:
	function(amt) {
		var oldMeter = this.meter;
		this.meter = Math.max(Math.min(this.meter + amt, this.maxMeter), 0.0);
		amt = this.meter - oldMeter;
		this.trigger("MeterChange", {
			meter: this.meter,
			delta: amt
		});
		
		if(this.meter === 0.0) {
			this.trigger("MeterEmpty");
		} else if(this.meter === this.maxMeter) {
			this.trigger("MeterFull");
		}
	}
});

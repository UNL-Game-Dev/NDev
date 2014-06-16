/**
 * Component for loading sprite data from an XML file.
 */

Crafty.c("SpriteLoader", {
	init:
	function() {},
	
	load:
	function(filename) {
		$.ajax({
			type: "GET",
			url: filename,
			success: function (data) {
				data = $(data).children("spritesData");
				
				var baseUrl = data.children("baseUrl").text().trim();
				var fileExtension = data.children("fileExtension").text()
					.trim();
				
				data.children("spriteSheet").each(function(index, spriteSheet) {
					spriteSheet = $(spriteSheet);
					var src = spriteSheet.attr("src");
					var tileSize = spriteSheet.children("tileSize").text()
						.trim();
					var tilePadding = spriteSheet.children("tilePadding").text()
						.trim();
					var paddingAroundBorder = spriteSheet
						.children("paddingAroundBorder").text().trim();
					
					if(!src) {
						throw "Sprite sheet src attribute missing";
					}
					
					// Get tile dimensions.
					var tileWidth = 1, tileHeight = 1;
					if(tileSize) {
						var tileSize = tileSize.split(" ");
						if(tileSize.length === 1) {
							tileWidth = tileHeight = parseInt(tileSize[0]);
						} else if(tileSize.length === 2) {
							tileWidth = parseInt(tileSize[0]);
							tileHeight = parseInt(tileSize[1]);
						}
					}
					
					// Get tile padding.
					var paddingX = 0, paddingY = 0;
					if(tilePadding) {
						tilePadding = tilePadding.split(" ");
						if(tilePadding.length === 1) {
							paddingX = paddingY = parseInt(tilePadding[0]);
						} else if(tilePadding.length === 2) {
							paddingX = parseInt(tilePadding[0]);
							paddingY = parseInt(tilePadding[1]);
						}
					}
					paddingAroundBorder = paddingAroundBorder === "true"
										  ? true
										  : false;
					
					// Get the sprites.
					var spriteDict = {};
					spriteSheet.children("sprite").each(function(index, sprite) {
						sprite = $(sprite);
						var name = sprite.attr("name");
						var location = sprite.children("location").text()
							.trim();
						var dimensions = sprite.children("dimensions").text()
							.trim();
						
						if(!name) {
							throw "Sprite name attribute missing";
						}
						
						// Get the sprite location and dimensions.
						var spriteX = 0, spriteY = 0, spriteW = 1, spriteH = 1;
						if(location) {
							location = location.split(" ");
							if(location.length === 2) {
								spriteX = parseInt(location[0]);
								spriteY = parseInt(location[1]);
							}
						}
						if(dimensions) {
							dimensions = dimensions.split(" ");
							if(dimensions.length === 1) {
								spriteW = spriteH = parseInt(dimensions[0]);
							} else if(dimensions.length === 2) {
								spriteW = parseInt(dimensions[0]);
								spriteH = parseInt(dimensions[1]);
							}
						}
						
						// Create the sprite dict entry.
						spriteDict[name] = [
							spriteX,
							spriteY,
							spriteW,
							spriteH
						];
					});
					
					var currLoc = getDirectory(filename);
					var url = src;
					if(baseUrl) {
						url = baseUrl + "/" + url;
					}
					if(fileExtension) {
						url += "." + fileExtension;
					}
					if(currLoc) {
						url = currLoc + "/" + url;
					}
					
					Crafty.sprite(tileWidth, tileHeight, url, spriteDict,
								 paddingX, paddingY, paddingAroundBorder);
				});
			}
		});
	}
});

function getDirectory(filename) {
	var tokens = filename.split("/");
	tokens.splice(-1);
	return tokens.join("/");
}

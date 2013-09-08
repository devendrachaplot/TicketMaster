var flagcaptcha = true;
function captcha(){
	if(flagcaptcha){
		document.getElementsByTagName('body')[0].insertAdjacentHTML('beforeend','<canvas id="myCanvas" width="85px" height="18px"></canvas>');
		var canvas = document.getElementById('myCanvas');
		var ctx=canvas.getContext("2d"); 
		ctx.rotate(-0.075);
		ctx.transform(1, 0, -0.4, 1, 0, 0);
		flagcaptcha = false;
	}
	var canvas = document.getElementById('myCanvas');
	var ctx=canvas.getContext("2d"); 
	var img=document.getElementById("divImagePath"); 
	ctx.drawImage(img,-23,-13,130,50);

	// Read in pixel data
	var image = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);

	// Convert to grayscale
	for (var x = 0; x < image.width; x++){
		for (var y = 0; y < image.height; y++){
			var i = x*4+y*4*image.width;
			var luma = Math.floor(
				image.data[i] * 299/1000 +
				image.data[i+1] * 587/1000 +
				image.data[i+2] * 114/1000
				//(image.data[i]+image.data[i+1]+image.data[i+2])/3
			);
			image.data[i] = luma;
			image.data[i+1] = luma;
			image.data[i+2] = luma;
			image.data[i+3] = 255;
		}
	}
	// Cut into blocks
	var blocks = new Array();
	var block_start = 0;
	var block_end = 0;
	var before_white = true;
	for (var x = 0; x < image.width; x++) {
		var white = true;
		var limit = 1;
		for (var y = 0; y < image.height; y++) {
			var i = x*4 + y*4*image.width
			var c = image.data[i];
			if (c < 140) {
				limit--;
				if(limit < 0){
					white = false;
					break;
				}
			}
		}
		if (before_white == true && white == false) {
			block_start = x;
		}
		if (before_white == false && white == true) {
			block_end = x - 1;
			var block = {start: block_start, end: block_end, image: {}, canvas: {}};
			blocks.push(block);
		}
		before_white = white;
	}

	// Clone each block
	for (var w = 0; w < blocks.length; w++) {
		blocks[w].image.width = image.width;
		blocks[w].image.height = image.height;
		blocks[w].image.data = new Uint8ClampedArray(image.data.length);
		for (var i = 0; i < image.data.length; i++) {
			blocks[w].image.data[i] = image.data[i];
		}
	}
	 
	// Whiteout all other characters from each block
	for (var w = 0; w < blocks.length; w++) {
		for (var x = 0; x < image.width; x++) {
			if (x < blocks[w].start || x > blocks[w].end) {
				for (var y = 0; y < image.height; y++) {
					var i = x*4 + y*4*image.width
					blocks[w].image.data[i] = 255;
					blocks[w].image.data[i+1] = 255;
					blocks[w].image.data[i+2] = 255;
				}
			}
		}
	}
	// Crop each block, pad with whitespace to appropriate ratio, and resize to 60 x 50
	for (var w = 0; w < blocks.length; w++) {
		// We already have the x-boundaries, just need to find y-boundaries
		var y_min = 0;
		findmin:
		for (var y = 0; y < blocks[w].image.height; y++) {
			for (var x = 0; x < blocks[w].image.width; x++) {
				var i = x*4 + y*4*image.width
				if (blocks[w].image.data[i] < 200) {
					y_min = y;
					break findmin;
				}
			}
		}
		var y_max = 0;
		findmax:
		for (var y = blocks[w].image.height; y >= 0; y--) {
			for (var x = 0; x < blocks[w].image.width; x++) {
				var i = x*4 + y*4*image.width
				if (blocks[w].image.data[i] < 200) {
					y_max = y;
					break findmax;
				}
			}
		}
	 
		// Pad and resize
		var cwidth = blocks[w].end - blocks[w].start + 1;
		var cheight = y_max - y_min + 1;
		var cratio = cwidth / cheight;
	 
		var sx = blocks[w].start;
		var sy = y_min;
		var sw = blocks[w].end - blocks[w].start + 1;
		var sh = y_max - y_min + 1;
	 
		var dimx = 15;
		var dimy = 18;
		var dimr = dimx / dimy;
		if ((cwidth / cheight) < dimr) {
			var dh = dimy;
			var dw = Math.round(cwidth * dimy / cheight);
			var dy = 0;
			var dx = Math.round((dimx - dw) / 2);
		}
		else if ((cwidth / cheight) > dimr) {
			var dw = dimx;
			var dh = Math.round(cheight * dimx / cwidth);
			var dx = 0;
			var dy = Math.round((dimy - dh) / 2);
		}
		else {
			var dh = dimy;
			var dw = dimx;
			var dy = 0;
			var dx = 0;
		}
		blocks[w].canvas = document.createElement('canvas');
		blocks[w].canvas.width = dimx;
		blocks[w].canvas.height = dimy;
		blocks[w].canvas.style.margin = "0 1px 0 0";
		blocks[w].canvas.getContext('2d').fillStyle="#ffffff";
		blocks[w].canvas.getContext('2d').fillRect(0,0,dimx,dimy);
		blocks[w].canvas.getContext('2d').drawImage(canvas, sx, sy, sw, sh, dx, dy, dw, dh);
		/*document.getElementsByTagName('body')[0].appendChild(blocks[w].canvas);
		var data1 = blocks[w].canvas.getContext('2d').getImageData(0,0,blocks[w].canvas.width,blocks[w].canvas.height);
		var tempstr = "";
		for(var z = 0;z < blocks[w].canvas.width*blocks[w].canvas.height*4;z += 4){
			tempstr += data1.data[z]+",";
		}
		console.log(tempstr);*/
		//console.log(blocks[w].canvas.getContext('2d').getImageData(0,0,blocks[w].canvas.width,blocks[w].canvas.height));
		
	}

	// Create an image with all letters and numbers - "ABCDEFGHIJKLMNOPQRSTUVWXYZ-1234567890"
	// Feed that image to the previous code thus far to get blocks of each character

	var code = "";
	for (var w = 0; w < blocks.length; w++){
		var minerror = 9876543210;
		var minchar = '?';
		for (var k in characters){
			var data1 = blocks[w].canvas.getContext('2d').getImageData(0,0,blocks[w].canvas.width,blocks[w].canvas.height);
			var temp = compare(data1.data, characters[k]);
			if(temp<minerror){
				minerror = temp;
				minchar = k;
				//console.log(w+":"+k+":"+temp);
			}
		}
		code += minchar;
	}
	return code;
}

function compare(data1,data2){
	var error = 0;
	for(var i = 0;i < data1.length/4;i += 1){
		error += (data1[i*4] - data2[i])*(data1[i*4] - data2[i]);
	}
	return error;
}
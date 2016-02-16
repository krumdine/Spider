var sizeFloat = 4 ;
var defaultHeaderSize = 256 ;

"use strict" ;

//the callback take two parameters
//the first one is the file values (an array of pixel in 2 or 3 dimensions) 
//the second one is the file type ('image' or 'stack').
function readSpiderFile(file, type, callback) {
	var reader = new FileReader();

	reader.onload = function(e) {
		var contents = e.target.result;
		var imagePix = getContents(contents, type) ;
		callback(imagePix, type)
	};

	reader.readAsArrayBuffer(file);
}

function getContents(contents, type) {
	var pos = 0 ;
	var header = new DataView(contents, pos, defaultHeaderSize * sizeFloat) ;
	pos = defaultHeaderSize * sizeFloat;
	var fNsam = header.getFloat32(11 * sizeFloat) ;
	var fLabrec = header.getFloat32(12 * sizeFloat) ;
	var headerSize = fNsam * fLabrec;

	//calculate the true header size
	if(headerSize != defaultHeaderSize) {
		pos = 0 ;
		header = new DataView(contents, pos, headerSize * sizeFloat) ;
		pos = headerSize * sizeFloat ;
	}

	var ncol = header.getFloat32(11 * sizeFloat) ; //number of pixels per row
	var nrow = header.getFloat32(1 * sizeFloat) ;  //number of rows

	if(type === 'image') {
		image = new DataView(contents, pos, nrow * ncol * sizeFloat) ;

		var res = new Array(nrow) ;
		pos = 0 ;

		for(var i = 0 ; i < nrow ; i++) {
			res[i] = new Array(ncol) ;
			for(var j = 0 ; j < ncol ; j++) {
				res[i][j] = image.getFloat32(pos * sizeFloat ) ;
				pos++ ;
			}
		}
		return  res ;
	}
	else if(type === 'stack') {
		var nslice = header.getFloat32(0 * sizeFloat) ;

		stack = new DataView(contents, pos, nslice * nrow * ncol * sizeFloat) ;

		var res = new Array(nslice) ;
		var pos = 0 ;

		for(var k = 0 ; k < nslice ; k++) {
			res[k] = new Array(nrow) ;
			for(var i = 0 ; i < nrow ; i++) {
				res[k][i] = new Array(ncol) ;
				for(var j = 0 ; j < ncol ; j++) {
					res[k][i][j] = stack.getFloat32(pos * sizeFloat ) ;
					pos++ ;
				}
			}
		}
		return res ;
	}
	else {
		console.log("unknown file type") ;
		fileContents = undefined ;
	}
}		
					
function displayImage(imagePix, canvas) {
	var ncolonne = imagePix.length ;
	var nligne = imagePix[0].length ;

	canvas.width = ncolonne;
	canvas.height = nligne;

	var ctx = canvas.getContext('2d');

	for(var i = 0 ; i < ncolonne ; i++) {
		for (var j = 0; j < nligne; j++ ){
			var pixel = Math.round(imagePix[j][i]*255);
			if (pixel < 16){
				hexString = "0" + pixel.toString(16);
			}
			else {
				hexString = pixel.toString(16);
			}
			var hexadec = "#"+hexString+hexString+hexString ;
					  	
			ctx.fillStyle = hexadec;
			ctx.fillRect(i,j,1,1);
		}
	}
}
// plotter.js
// define manipulate plot object

// global constants
var XMLNS = "http://www.w3.org/2000/svg";
var p;
//helper functions
function isIncreasing(array) {
	return array.every((_,i,arr)=> (arr[i]>arr[i-1])||i==0);
}

function empty(element) {
	while (element.lastChild) {element.removeChild(element.lastChild);}
}

// Plot class def
class Plot {
	constructor(svgElement) {
		this.svg = svgElement;
		var plotarea = this.svg.getElementById("plotarea");
		this.plotBox = [
			parseFloat(plotarea.getAttribute("x")),
			parseFloat(plotarea.getAttribute("y")),
			parseFloat(plotarea.getAttribute("width")),
			parseFloat(plotarea.getAttribute("height"))
		];
		var xaxline = this.svg.getElementById("xaxisline");
		var yaxline = this.svg.getElementById("yaxisline");
		this.axisBox = [
			Math.min(parseFloat(xaxline.getAttribute("x1")), parseFloat(xaxline.getAttribute("x2"))),
			Math.min(parseFloat(yaxline.getAttribute("y1")), parseFloat(yaxline.getAttribute("y2"))),
			Math.abs(parseFloat(xaxline.getAttribute("x2")) - parseFloat(xaxline.getAttribute("x1"))),
			Math.abs(parseFloat(yaxline.getAttribute("y2")) - parseFloat(yaxline.getAttribute("y1")))
		];
		this.xlim = [0, 1];
		this.ylim = [0, 1];

		this.xticks = [...Array(11).keys()];
		this.yticks = [...Array(11).keys()];

		this.xticklabels = "auto";
		this.yticklabels = "auto";

		this.xgrid = true;
		this.ygrid = true;

		this.axisboxoutline = false;

	}

	set xlabel(newlabeltext) {
		var xlabeltext = this.svg.getElementById("xlabel");
		xlabeltext.textContent = newlabeltext;
	}

	get xlabel() {
		var xlabeltext = this.svg.getElementById("xlabel");
		if (xlabeltext==null) {
			return undefined;
		}
		else {
			return xlabeltext.textContent;
		}

	}

	set ylabel(newlabeltext) {
		var ylabeltext = this.svg.getElementById("ylabel");
		ylabeltext.textContent = newlabeltext;
	}

	get ylabel() {
		var ylabeltext = this.svg.getElementById("ylabel");
		if (ylabeltext==null) {
			return undefined;
		}
		else {
			return xlabeltext.textContent;
		}

	}

	x2svg(xvalue) {
		// give function x value, return svg % coordinate
		var frac = (xvalue - this.xlim[0])/(this.xlim[1] - this.xlim[0]);
		return this.axisBox[0] + frac*this.axisBox[2];
	}

	svg2x(svgx) {
		// get function x value from svg % coordinate
		var frac = (svgx - this.axisBox[0]) / this.axisBox[2];
		return this.xlim[0] + frac * (this.xlim[1] - this.xlim[0]);
	}

	y2svg(yvalue) {
		// give function y value, return svg % coordinate
		var frac = (yvalue - this.ylim[0])/(this.ylim[1] - this.ylim[0]);
		return this.axisBox[1] + (1-frac)*this.axisBox[3];
	}

	svg2y(svgy) {
		// get function y value from svg % coordinate
		var frac = (this.axisBox[1] + this.axisBox[3] - svgy) / this.axisBox[3];
		return this.ylim[0] + frac * (this.ylim[1] - this.ylim[0]);
	}

	set xticks(tickarray) {
		if (isIncreasing(tickarray)) {
			// call set xlim function and use it
			this.xlim = [tickarray[0], tickarray[tickarray.length-1]];
			this.xtickvalues = tickarray;

			var xvals = tickarray.map(d => this.x2svg(d));
			var grp = this.svg.getElementById("xtickcontainer");
			empty(grp);
			var tick, gridline;
			for (var i = 0; i < tickarray.length; i++) {
				if ((this.xgridvalue) && (i != 0)) {
					gridline = document.createElementNS(XMLNS, "line");
					gridline.setAttribute("x1", xvals[i] + "%");
					gridline.setAttribute("x2", xvals[i] + "%");
					gridline.setAttribute("y1", (this.axisBox[1]) + "%");
					gridline.setAttribute("y2", (this.axisBox[1]+this.axisBox[3]) + "%");
					gridline.setAttribute("class", "gridline");
					grp.appendChild(gridline);
				}

				tick = document.createElementNS(XMLNS, "line");
				tick.setAttribute("x1", xvals[i] + "%");
				tick.setAttribute("x2", xvals[i] + "%");
				tick.setAttribute("y1", (this.axisBox[1]+this.axisBox[3]) + "%");
				tick.setAttribute("y2", (this.axisBox[1]+this.axisBox[3]+1) + "%");
				tick.setAttribute("class", "tick");
				grp.appendChild(tick);
			}			

		}
		else {
			console.error("Specified tick array is not monotonic.")
		}
	}

	get xticks() {
		return this.xtickvalues;
	}

	set xticklabels(argin) {
		var labelarray;
		if (argin == "auto") {
			labelarray = this.xtickvalues.map(d => d.toString());
		}
		else {
			labelarray = argin;
		}

		this.xticklabelvalues = labelarray;

		var xvals = this.xtickvalues.map(d => this.x2svg(d));
		var grp = this.svg.getElementById("xticklabelcontainer");
		empty(grp);

		var label;
		for (var i = 0; i < labelarray.length; i++) {
			label = document.createElementNS(XMLNS, "text");
			label.setAttribute("x", xvals[i] + "%");
			label.setAttribute("y", (this.axisBox[1]+this.axisBox[3]+3) + "%");
			label.textContent = labelarray[i];
			grp.appendChild(label);
		}
	}

	get xticklabels() {
		return this.xticklabelvalues;
	}

	set xgrid(state) {
		this.xgridvalue = state;
		this.xticks = this.xtickvalues; // refresh axes
	}

	get xgrid () {
		return this.xgridvalue;
	}

	set yticks(tickarray) {
		if (isIncreasing(tickarray)) {
			// call set xlim function and use it
			this.ylim = [tickarray[0], tickarray[tickarray.length-1]];
			this.ytickvalues = tickarray;

			var yvals = tickarray.map(d => this.y2svg(d));
			var grp = this.svg.getElementById("ytickcontainer");
			empty(grp);
			var tick, gridline;
			for (var i = 0; i < tickarray.length; i++) {
				if ((this.ygridvalue) && (i != 0)) {
					gridline = document.createElementNS(XMLNS, "line");
					gridline.setAttribute("x1", (this.axisBox[0]) + "%");
					gridline.setAttribute("x2", (this.axisBox[0]+this.axisBox[2]) + "%");
					gridline.setAttribute("y1", yvals[i] + "%");
					gridline.setAttribute("y2", yvals[i] + "%");
					gridline.setAttribute("class", "gridline");
					grp.appendChild(gridline);
				}

				tick = document.createElementNS(XMLNS, "line");
				tick.setAttribute("x1", (this.axisBox[0]-1) + "%");
				tick.setAttribute("x2", this.axisBox[0] + "%");
				tick.setAttribute("y1", yvals[i] + "%");
				tick.setAttribute("y2", yvals[i] + "%");
				tick.setAttribute("class", "tick");
				grp.appendChild(tick);
			}			

		}
		else {
			console.error("Specified tick array is not monotonic.")
		}
	}

	get yticks() {
		return this.ytickvalues;
	}

	set yticklabels(argin) {
		var labelarray;
		if (argin == "auto") {
			labelarray = this.ytickvalues.map(d => d.toString());
		}
		else {
			labelarray = argin;
		}

		this.yticklabelvalues = labelarray;

		var yvals = this.ytickvalues.map(d => this.y2svg(d));
		var grp = this.svg.getElementById("yticklabelcontainer");
		empty(grp);
		var label;
		for (var i = 0; i < labelarray.length; i++) {
			label = document.createElementNS(XMLNS, "text");
			label.setAttribute("x", (this.axisBox[0]-2.5) + "%");
			label.setAttribute("y", yvals[i] + "%");
			label.textContent = labelarray[i];
			grp.appendChild(label);
		}
	}

	get yticklabels() {
		return this.yticklabelvalues;
	}

	set ygrid(state) {
		this.ygridvalue = state;
		this.yticks = this.ytickvalues; // refresh axes
	}

	get ygrid () {
		return this.ygridvalue;
	}

	set axisboxoutline(state) {
		var box = this.svg.getElementById("axisboxoutline");
		if (state) {
			box.setAttribute("visibility", "visible");
		}
		else {
			box.setAttribute("visibility", "hidden");
		}
	}

	get axisboxoutline() {
		var box = this.svg.getElementById("axisboxoutline");

	}

	listplot() {
		var nargin = arguments.length;
		var xdata, ydata, npts;
		var container = this.svg.getElementById("datacontainer");
		empty(container);

		switch (nargin) {
			case 0:
				console.error("Plot function requires input.")
				return;
			case 1:
				ydata = arguments[0];
				xdata = [...Array(arguments[0].length).keys()];
				npts = ydata.length;
				break;
			default:
				if (arguments[0].length != arguments[1].length) {
					console.error("X and Y data arrays must be same size.")
					return;
				}
				else {
					xdata = arguments[0];
					ydata = arguments[1];
					npts = ydata.length;
				}
		}

		// initialize defaults
		var mkrsize = 2;

		// parse name value pairs
		if (arguments.length > 2) {
			var kwargs = Array.prototype.slice.call(arguments, 2);

			if (kwargs.length % 2 == 0) {
				var name, value;
				for (var i = 0; i < kwargs.length; i+=2) {
					name = kwargs[i];
					value = kwargs[i+1];

					switch (name) {
						case "MarkerSize":
							mkrsize = value;
					}
				}
			}
			else {
				console.error("Additional arguments beyond 2 must be given in name-value pairs.");
				return;
			}

		}

		var pt;
		for (var i = 0; i < npts; i++) {
			pt = document.createElementNS(XMLNS, "circle");
			pt.setAttribute("cx", this.x2svg(xdata[i]) + "%");
			pt.setAttribute("cy", this.y2svg(ydata[i]) + "%");
			pt.setAttribute("r", mkrsize + "px");
			pt.setAttribute("class", "datapoint");
			container.appendChild(pt);
		}

		// then autoscale axes
	}

	functionplot(fcnstr) {
		var widthpixels = parseFloat(this.svg.getAttribute("width"));
		var heightpixels = parseFloat(this.svg.getAttribute("height"));

		var viewpixels = widthpixels * this.axisBox[2]/100;
		var viewleftpixel = widthpixels * this.axisBox[0]/100;

		var xfracs = [...Array(viewpixels+1).keys()].map(d => d/viewpixels);

		var xvals = xfracs.map(d => this.xlim[0] + d * (this.xlim[1] - this.xlim[0]));
		var xvalpixels = xfracs.map((_,i) => viewleftpixel + i);

		var yvals = xvals.map(x => eval(fcnstr));
		var yvalpixels = yvals.map(y => this.y2svg(y) / 100 * heightpixels);

		// console.log(xfracs.slice(0,1));
		// console.log(xvals.slice(0,1));
		// console.log(xvalpixels.slice(0,1));
		// console.log(yvals.slice(0,1));
		// console.log(yvalpixels.slice(0,1));

		this.polylineplot(xvalpixels, yvalpixels);

	}

	polylineplot(xpts, ypts) {

		var container = this.svg.getElementById("datacontainer");
		empty(container);

		var line = document.createElementNS(XMLNS, "polyline");
		var pointstr = "";
		for (var i = 0; i < xpts.length; i++) {
			if ((isFinite(xpts[i])) && (isFinite(ypts[i]))) {
				pointstr += xpts[i] + "," + ypts[i] + " ";
			}
		}
		line.setAttribute("points", pointstr);
		line.setAttribute("fill", "none");
		line.setAttribute("stroke", "black");
		line.setAttribute("stroke-width", "2px");
		container.appendChild(line);

	}
}



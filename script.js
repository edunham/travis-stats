function renderBuildCounts(container, data) {
	var valueLabelWidth = 40; // space reserved for value labels (right)
	var barHeight = 20; // height of one bar
	var barLabelWidth = 130; // space reserved for bar labels
	var barLabelPadding = 5; // padding between bar and bar labels (left)
	var gridLabelHeight = 18; // space reserved for gridline labels
	var gridChartOffset = 3; // space between start of grid and first bar
	var maxBarWidth = 420; // width of the bar with the max value

	// accessor functions
	var barValue = function(d) { return d.value; };

	// scales
	var yScale = d3.scale.ordinal().domain(d3.range(0, data.length)).rangeBands([0, data.length * barHeight]);
	var y = function(d, i) { return yScale(i); };
	var yText = function(d, i) { return y(d, i) + yScale.rangeBand() / 2; };
	var x = d3.scale.linear().domain([0, d3.max(data, barValue)]).range([0, maxBarWidth]);

	// svg container element
	var chart = d3.select(container).html('').append("svg")
		.attr('width', maxBarWidth + barLabelWidth + valueLabelWidth)
		.attr('height', gridLabelHeight + gridChartOffset + data.length * barHeight);

	// grid line labels
	var gridContainer = chart.append('g')
		.attr('transform', 'translate(' + barLabelWidth + ',' + gridLabelHeight + ')');
	gridContainer.selectAll("text").data(x.ticks(10)).enter().append("text")
		.attr("x", x)
		.attr("dy", -3)
		.attr("text-anchor", "middle")
		.text(String);

	// vertical grid lines
	gridContainer.selectAll("line").data(x.ticks(10)).enter().append("line")
		.attr("x1", x)
		.attr("x2", x)
		.attr("y1", 0)
		.attr("y2", yScale.rangeExtent()[1] + gridChartOffset)
		.style("stroke", "#ccc");

	// bar labels
	var labelsContainer = chart.append('g')
		.attr('transform', 'translate(' + (barLabelWidth - barLabelPadding) + ',' + (gridLabelHeight + gridChartOffset) + ')');
		labelsContainer.selectAll('text').data(data).enter().append('text')
		.attr('y', yText)
		.attr("dy", ".35em") // vertical-align: middle
		.attr('text-anchor', 'end')
		.text(function(d) { return d.key; });

	// bars
	var barsContainer = chart.append('g')
		.attr('transform', 'translate(' + barLabelWidth + ',' + (gridLabelHeight + gridChartOffset) + ')');
	barsContainer.selectAll("rect").data(data).enter().append("rect")
		.attr('y', y)
		.attr('height', yScale.rangeBand())
		.attr('width', function(d) { return x(barValue(d)); })
		.attr('stroke', 'white')
		.attr('fill', 'steelblue');

	// bar value labels
	barsContainer.selectAll("text").data(data).enter().append("text")
		.attr("x", function(d) { return x(barValue(d)); })
		.attr("y", yText)
		.attr("dx", 3) // padding-left
		.attr("dy", ".35em") // vertical-align: middle
		.attr("text-anchor", "start") // text-align: right
		.attr("fill", "black")
		.attr("stroke", "none")
		.text(function(d) { return d3.round(barValue(d), 2); });

	// start line
	barsContainer.append("line")
		.attr("y1", -gridChartOffset)
		.attr("y2", yScale.rangeExtent()[1] + gridChartOffset)
		.style("stroke", "#000");
}

function renderBuildTimes(container, barValue, data, baseUrl) {
	var paddingLeft = 5; // space to the left of the bars
	var paddingRight = 10; // space to the right of the bars
	var barHeight = 5; // height of one bar
	var barPaddingV = 1; // vertical padding between bars
	var gridLabelHeight = 18; // space reserved for gridline labels
	var gridChartOffset = 3; // space between start of grid and first bar
	var maxBarWidth = 450; // width of the bar with the max value

	// scales
	var yScale = d3.scale.ordinal()
		.domain(d3.range(0, data.length))
		.rangeBands([0, data.length * (barHeight+barPaddingV)]);
	var y = function(d, i) { return yScale(i) + barPaddingV*i; };
	var yText = function(d, i) { return y(d, i) + yScale.rangeBand() / 2; };
	var x = d3.scale.linear()
		.domain([0, d3.max(data, barValue)])
		.range([0, maxBarWidth]);

	// svg container element
	var chart = d3.select(container).html('').append("svg")
		.attr('width', maxBarWidth + paddingLeft + paddingRight)
		.attr('height', gridLabelHeight + gridChartOffset + data.length * (barHeight+barPaddingV*2));

	// grid line labels
	var gridContainer = chart.append('g')
		.attr('transform', 'translate(' + paddingLeft + ',' + gridLabelHeight + ')');
	gridContainer.selectAll("text").data(x.ticks(10)).enter().append("text")
		.attr("x", x)
		.attr("dy", -3)
		.attr("text-anchor", "middle")
		.text(String);

	// vertical grid lines
	gridContainer.selectAll("line").data(x.ticks(10)).enter().append("line")
		.attr("x1", x)
		.attr("x2", x)
		.attr("y1", 0)
		.attr("y2", yScale.rangeExtent()[1] + gridChartOffset + barPaddingV*data.length)
		.style("stroke", "#ccc");

	// bars
	var barsContainer = chart.append('g')
		.attr('transform', 'translate(' + paddingLeft + ',' + (gridLabelHeight + gridChartOffset) + ')');
	barsContainer.selectAll("rect").data(data).enter().append("rect")
		.attr('y', y)
		.attr('height', yScale.rangeBand())
		.attr('width', function(d) { return x(barValue(d)); })
		.attr('stroke', 'white')
		.attr('class', 'build-time-bar')
		.attr('fill', function(d) {
			return d.result === 0 ? '#038035' : '#CC0000';
		})
		.on('click', function(d) {
			window.open(baseUrl + d.id);
		});
}

function getBuildDate(build) {
	var dt = new Date(Date.parse(build.started_at));
	return dt.toDateString();
}


// from https://gist.github.com/niallo/3109252#gistcomment-1474669
function parse_link_header(header) {
    if (header.length === 0) {
        throw new Error("input must not be of zero length");
    }

    // Split parts by comma
    var parts = header.split(',');
    var links = {};
    // Parse each part into a named link
    for(var i=0; i<parts.length; i++) {
        var section = parts[i].split(';');
        if (section.length == 2) {
            var url = section[0].replace(/<(.*)>/, '$1').trim();
            var name = section[1].replace(/rel="(.*)"/, '$1').trim();
            links[name] = url;
        }
    }
    //links.next is a string. Eww.
    return links.next.split("\n")[2].split(" ")[1];
}

function handleRepoList() {
    var data = JSON.parse(this.responseText);
    console.log(data);
    var repos = [];
    if (data.message){
        if (data.message.match(/Not Found/)){
            alert("Invalid user. Please try with a valid GitHub username.");
        }
        else if (data.message.match(/API rate limit/i)){
            alert("Rate Limit Exceeded. Try a token, or wait awhile.");
        }
        // TODO, handle 'Bad credentials' more gracefully
    }
    else{
        data.forEach(doGraphThings);
    }
    var url = parse_link_header(this.getAllResponseHeaders())

    //TODO: Bail out if there was no 'next' URL
    var token = document.getElementById('ghtoken').value;
    var oReq = new XMLHttpRequest();
    oReq.onload = handleRepoList;
    oReq.open("get", url, true);
    if(token.length > 0) {
        oReq.setRequestHeader("Authorization", "token " + token);
    }
    oReq.send();
}

function makeLabeledDivs(place, label){
    var where = document.getElementById(place);
    var box = document.createElement("div");
    box.appendChild(document.createElement("h2").appendChild(document.createTextNode(label)));
    var localdiv = document.createElement('div');
    localdiv.id = place + "-" + label;
    box.appendChild(localdiv);
    where.appendChild(box);
}

function doGraphThings(repoObj){
	var repoName = repoObj.owner.login + "/" + repoObj.name;
    makeLabeledDivs("build-times-duration", repoObj.name);
    makeLabeledDivs("build-times", repoObj.name);
    makeLabeledDivs("build-counts", repoObj.name);

	var baseUrl = 'https://travis-ci.org/' + repoName + '/builds/';
	var buildsUrl = 'https://api.travis-ci.org/repos/' + repoName + '/builds?event_type=push';

	var builds = [];

	var oldestBuild = Infinity;
	var i=0, n=20;

	var buildCounts = {};

	function updateCount(build) {
		var buildDate = getBuildDate(build);

		if (!buildCounts[buildDate]) {
			buildCounts[buildDate] = 1;
		} else {
			buildCounts[buildDate] += 1;
		}
	}

	function filterBuilds(rawBuilds) {
		if (typeof rawBuilds.length === 'undefined') {
			alert('invalid repository: ' + repoName);
			return;
		}

		var curOldestBuild = oldestBuild;

		rawBuilds.forEach(function(build) {
			var buildNr = Number(build.number);
			if (buildNr < curOldestBuild) {
				curOldestBuild = buildNr;
			}

			if (build.branch !== 'master' || build.state !== 'finished') {
				return;
			}

			updateCount(build);
			builds.push(build);
		});

		function getDuration(build) {
			return build.duration/60;
		}

		function getClockTime(build) {
			var started_at = Date.parse(build.started_at);
			var finished_at = Date.parse(build.finished_at);

			return (finished_at - started_at) / 60000;
		}

		renderBuildTimes('#build-times-duration-'+repoObj.name, getDuration, builds, baseUrl);
		renderBuildTimes('#build-times-'+repoObj.name, getClockTime, builds, baseUrl);
		renderBuildCounts('#build-counts-'+repoObj.name, d3.entries(buildCounts), baseUrl);

		if (++i < n && curOldestBuild < oldestBuild) {
			oldestBuild = curOldestBuild;
			d3.json(buildsUrl + '&after_number=' + oldestBuild, filterBuilds);
		}
	}

	d3.json(buildsUrl, filterBuilds);

}

function updateChart() {
    var userName = document.getElementById('user-name').value;
    var token = document.getElementById('ghtoken').value;
    var oReq = new XMLHttpRequest();
    oReq.onload = handleRepoList;
    var url = "https://api.github.com/users/" + userName + "/repos?per_page=50";
    oReq.open("get", url, true);
    if(token.length > 0) {
        oReq.setRequestHeader("Authorization", "token " + token);
    }
    oReq.send();
}

function updateInputViaHash() {
	document.getElementById('user-name').value = window.location.hash.substr(1);
}

function updateHashViaInput() {
	window.location.hash = '#' + document.getElementById('user-name').value;
}

d3.select(window).on('hashchange', updateInputViaHash);

d3.select('form').on('submit', function() {
	d3.event.preventDefault();

	updateHashViaInput();
	updateChart();
});

updateInputViaHash();
updateChart();

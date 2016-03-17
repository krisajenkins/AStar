var _ = require('underscore');

var distance_between = function (a, b) {
	return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
};

var same_point = function (a, b) {
	return a[0] === b[0] && a[1] === b[1];
};

var grid = [[0, 1, 0, 0, 0, 1, 0, 0, 0],
			[0, 1, 0, 1, 0, 1, 0, 0, 1],
			[0, 1, 0, 1, 0, 1, 0, 0, 1],
			[0, 1, 0, 0, 0, 1, 0, 0, 1],
			[0, 1, 0, 1, 0, 1, 0, 1, 1],
			[0, 1, 0, 1, 0, 1, 0, 0, 1],
			[0, 1, 0, 1, 0, 1, 0, 1, 1],
			[0, 1, 0, 1, 0, 1, 0, 0, 1],
			[0, 1, 0, 1, 0, 1, 0, 0, 1],
			[0, 0, 0, 1, 0, 0, 0, 0, 0]];

var start = [0, 0];
var goal  = [8, 7];

var value_at = function(point) {
	var row = grid[point[0]];

	if (typeof(row) !== 'undefined') {
		return row[point[1]];
	}

	return -1;
};

var neighbours_of = function(point) {
	var neighbours = [];

	_.each(
		[[-1, 0], [1, 0], [0, -1], [0, 1]],
		function(move) {
			var new_point = [point[0] + move[0], point[1] + move[1]];
			if (value_at(new_point) === 0) {
				neighbours.push(new_point);
			}
		}
	);

	return neighbours;
};

var contains = function (points, point) {
	var i;

	for (i = 0; i < points.length; i++) {
		if (same_point(points[i], point)) {
			return true;
		}
	}

	return false;
};

var best_guess = function(f_score, points) {
	return _.sortBy(points, function(p) {return f_score[p];})[0];
};

var remove_point = function(points, point) {
	var new_points = [], i;

	for (i = 0; i < points.length; i++) {
		if (! same_point(points[i], point)) {
			new_points.push(points[i]);
		}
	}

	return new_points;
};

var reconstruct_path = function (came_from, node, path) {
	var previous = came_from[node];
	if (typeof(previous) !== 'undefined') {
		path.push(node);
		reconstruct_path(came_from, previous, path);
	}
};
var a_star = function() {
	var closed_set = [];
	var open_set = [start];
	var came_from = {};
	var g_score = {};
	var f_score = {};
	g_score[start] = 0;
	f_score[start] =  g_score[start] + distance_between(start, goal);

	while(open_set.length ) {
		var current = best_guess(f_score, open_set);

		if (same_point(current, goal)) {
			var path = [];
			reconstruct_path(came_from, current, path);
			return path;
		}

		open_set = remove_point(open_set, current);
		closed_set.push(current);

		_.each(
			neighbours_of(current),
			function (neighbour) {
				if (! contains(closed_set, neighbour)) {
					var tentative_g_score = g_score[current] + distance_between(current, neighbour);

					if (
						! contains(open_set, neighbour)
						||
						tentative_g_score < g_score[neighbour]
					) {
						came_from[neighbour] = current;
						g_score[neighbour] = tentative_g_score;
						f_score[neighbour] = g_score[neighbour] + distance_between(neighbour, goal);

						if ( ! contains(open_set, neighbour)) {
							open_set.push(neighbour);
						}
					}
				}
			}
		);
	}
};

var print_grid = function(start, goal, grid, path) {
	var row, col, line;
	for (row = 0; row < grid.length; row++) {
		line = "";
		for (col = 0; col < grid[0].length; col++) {
			var point = [row, col];
			if (same_point(start, point)) {
				line += "S";
			} else if (same_point(goal, point)) {
				line += "E";
			} else if (contains(path, point)) {
				line += "*";
			} else if (value_at(point) === 1) {
				line += "X";
			} else {
				line += " ";
			}
		}
		console.log(line);
	}
};

print_grid(start, goal, grid, a_star());

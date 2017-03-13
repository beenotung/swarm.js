function show_guide() {
    var text = document.getElementById("clipboard");
    text.value = swarm_main.toString() + ";swarm_main();";
    document.getElementById("guide").hidden = false;
}
function hide_guide() {
    document.getElementById("guide").hidden = true;
}
function swarm_main() {
    var cells = [];
    var size = 12;
    var margin = 50;
    var edge_size = 10;
    var avoid_edge_force = 1;
    var closeness_rate = 0.1;
    var min_distance = size * 1.5;
    var max_x = document.body.clientWidth;
    var max_y = document.body.clientHeight;
    var max_speed = 10;
    function avg(a, b) {
        return (a + b) / 2;
    }
    /**
     * @return 0 or 1
     * */
    function randomInt() {
        return Math.round(Math.random());
    }
    var Cell = (function () {
        function Cell(c) {
            this.span = document.createElement('span');
            this.span.style.position = 'absolute';
            this.span.textContent = c;
            this.span.style.fontSize = 12 + 'px';
            document.body.appendChild(this.span);
            this.id = cells.length;
            this.x = max_x / 2;
            this.y = max_y / 2;
            this.vx = (Math.random() * 2 - 1); //* size * 2;
            this.vy = (Math.random() * 2 - 1); //* size * 2;
            this.ax = 0;
            this.ay = 0;
            cells.push(this);
        }
        Cell.prototype.getDistance = function (cell) {
            var x = this.x - cell.x;
            var y = this.y - cell.y;
            return Math.sqrt(x * x + y * y);
        };
        Cell.prototype.getClosest = function () {
            var distance = Number.MAX_VALUE;
            var idx = this.id;
            for (var i = 0; i < cells.length; i++) {
                if (i == this.id)
                    continue;
                var d = this.getDistance(cells[i]);
                if (d < distance) {
                    distance = d;
                    idx = i;
                }
            }
            return [cells[idx], distance];
        };
        Cell.prototype.move = function () {
            var _a = this.getClosest(), cell = _a[0], distance = _a[1];
            if (this.x < edge_size) {
                this.ax = avoid_edge_force;
            }
            else if (this.x > max_x - edge_size) {
                this.ax = -avoid_edge_force;
            }
            else {
                this.ax = 0;
            }
            if (this.y < edge_size) {
                this.ay = avoid_edge_force;
            }
            else if (this.y > max_y - edge_size) {
                this.ay = -avoid_edge_force;
            }
            else {
                this.ay = 0;
            }
            this.vx += this.ax;
            this.vy += this.ay;
            this.vx *= (1 - closeness_rate);
            this.vy *= (1 - closeness_rate);
            if (distance < min_distance) {
                this.vx -= (cell.x - this.x) * closeness_rate;
                this.vy -= (cell.y - this.y) * closeness_rate;
            }
            else {
                this.vx += (cell.x - this.x) * closeness_rate;
                this.vy += (cell.y - this.y) * closeness_rate;
            }
            if (this.x <= edge_size && this.vx < 0)
                this.vx *= -1;
            else if (max_x <= this.x && this.vx > 0)
                this.vx *= -1;
            if (this.y <= edge_size && this.vy < 0)
                this.vy *= -1;
            else if (max_y <= this.y && this.vy > 0)
                this.vy *= -1;
            this.x += Math.min(this.vx, max_speed);
            this.y += Math.min(this.vy, max_speed);
            this.span.style.left = this.x + 'px';
            this.span.style.top = this.y + 'px';
        };
        return Cell;
    }());
    function createCells(s) {
        document.body.style.position = 'relative';
        var col = margin / size;
        var row = 0;
        for (var i = 0; i < s.length; i++) {
            if (s[i].trim().length == 0)
                continue;
            var cell = new Cell(s[i]);
            cell.x = col * size;
            cell.y = row * size;
            if (col * size >= max_x - margin) {
                col = 0;
                row++;
            }
            else {
                col++;
            }
        }
    }
    function init() {
        if (document.body.innerText.trim().length == 0) {
            document.writeln(swarm_main.toString());
        }
        var text = document.body.innerText.trim();
        document.body.textContent = '';
        document.body.style.left = '0px';
        document.body.style.top = '0px';
        createCells(text);
    }
    function main() {
        console.log('main');
        max_x = document.body.clientWidth - margin;
        max_y = document.body.clientHeight - margin;
        cells.forEach(function (cell) {
            cell.move();
        });
        // setTimeout(main, 40);
    }
    init();
    setInterval(main, 40);
    // main();
}
if (window['auto_start']) {
    if (typeof window.onload === 'function') {
        var f_1 = window.onload;
        window.onload = function () {
            f_1.apply(arguments);
            swarm_main();
        };
    }
    else {
        window.onload = swarm_main;
    }
}

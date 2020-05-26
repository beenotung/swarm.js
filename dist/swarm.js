function show_guide() {
    let text = document.getElementById("clipboard");
    text.value = swarm_main.toString() + ";swarm_main();";
    document.getElementById("guide").hidden = false;
}
function hide_guide() {
    document.getElementById("guide").hidden = true;
}
document.getElementById('name').textContent = 'swarm.js v1.1.4';
function swarm_main(mode) {
    let cells = [];
    let size = getFontSize();
    let margin = 25;
    let edge_size = 10;
    let avoid_edge_force = 1;
    let closeness_rate = 0.1;
    let min_distance = size * 1.5;
    let max_x;
    let max_y;
    let max_speed = 10;
    function update_screen_size() {
        max_x = window.innerWidth - edge_size - margin;
        max_y = window.innerHeight - edge_size - margin;
    }
    function getFontSize() {
        let span = document.createElement('span');
        span.textContent = 'o';
        span.style.fontSize = '1em';
        document.body.appendChild(span);
        let w = span.offsetWidth;
        let h = span.offsetHeight;
        document.body.removeChild(span);
        return Math.min(w, h);
    }
    function avg(a, b) {
        return (a + b) / 2;
    }
    /**
     * @return 0 or 1
     * */
    function randomInt() {
        return Math.round(Math.random());
    }
    class Cell {
        constructor(c, x, y) {
            this.span = document.createElement('span');
            this.span.style.position = 'absolute';
            this.span.textContent = c;
            document.body.appendChild(this.span);
            this.id = cells.length;
            this.x = x;
            this.y = y;
            this.vx = (Math.random() * 2 - 1); //* size * 2;
            this.vy = (Math.random() * 2 - 1); //* size * 2;
            this.ax = 0;
            this.ay = 0;
            this.span.style.left = this.x + 'px';
            this.span.style.top = this.y + 'px';
            cells.push(this);
        }
        getDistance(cell) {
            let x = this.x - cell.x;
            let y = this.y - cell.y;
            return Math.sqrt(x * x + y * y);
        }
        getClosest() {
            if (this.closest)
                return this.closest;
            let distance = Number.MAX_VALUE;
            let idx = this.id;
            for (let i = 0; i < cells.length; i++) {
                if (i == this.id)
                    continue;
                let d = this.getDistance(cells[i]);
                if (d < distance) {
                    distance = d;
                    idx = i;
                }
            }
            let cell = cells[idx];
            cell.closest = [this, distance];
            return [cell, distance];
        }
        move() {
            let [cell, distance] = this.getClosest();
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
        }
    }
    function createCells(s) {
        document.body.style.position = 'relative';
        let col = 0;
        let row = 0;
        for (let i = 0; i < s.length; i++) {
            if (s[i].trim().length == 0)
                continue;
            let x = col * size;
            let y = row * size;
            new Cell(s[i], x, y);
            if (col * size >= max_x - margin) {
                col = 0;
                row++;
            }
            else {
                col++;
            }
        }
        console.log('created', cells.length, 'cells');
    }
    function noop() {
        // do nothing
    }
    function setHead() {
        let meta = document.querySelector('meta[name=viewport]');
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = 'viewport';
            document.head.appendChild(meta);
        }
        meta.content = 'width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no';
    }
    function init() {
        for (let i = setTimeout(noop, 0); i >= 0; i--) {
            clearTimeout(i);
            clearInterval(i);
        }
        addFunction(window, 'onresize', update_screen_size);
        update_screen_size();
        if (document.body.innerText.trim().length == 0) {
            document.writeln(swarm_main.toString());
        }
        let text = document.body.innerText.trim();
        document.body.innerHTML = `<style>
body {
  margin: 0;
  left: 0;
  top: 0;
}
body span {
  font-size: 1em;
}
</style>`;
        setHead();
        if (mode == 'unique') {
            let res = {};
            for (let c of text) {
                res[c] = 1;
            }
            text = Object.keys(res).join('');
        }
        createCells(text);
    }
    let lastTime = Date.now();
    let nowTime = Date.now();
    let n_frame = 0;
    function main() {
        nowTime = Date.now();
        n_frame++;
        if (nowTime - lastTime > 1000) {
            lastTime = nowTime;
            console.log('fps', n_frame);
            n_frame = 0;
        }
        cells.forEach(cell => cell.closest = null);
        cells.forEach(cell => {
            cell.move();
        });
    }
    function addFunction(target, name, f) {
        if (typeof target[name] === 'function') {
            let ori = target[name];
            target[name] = function () {
                ori.apply(null, arguments);
                f.apply(null, arguments);
            };
        }
        else {
            target[name] = f;
        }
    }
    init();
    setInterval(main, 40);
}
if (window['auto_start']) {
    if (typeof window.onload === 'function') {
        let f = window.onload;
        window.onload = function () {
            f.apply(arguments);
            swarm_main();
        };
    }
    else {
        window.onload = swarm_main.bind(null);
    }
}

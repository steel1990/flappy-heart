#! /usr/bin/env node

var stdin = process.stdin;
var stdout = process.stdout;
stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding('utf8');

var MAP_WIDTH = 42;
var MAP_HEIGHT = 10;
var MAP_Y_GAP = 2;
var MAP_MIDDLE = {
    y: Math.floor(MAP_HEIGHT / 2),
    x: Math.floor(MAP_WIDTH / 2)
};
var MAP_LINE_GAP = 6;
var HEART_CHAR = '\033[31m♥\033[0m';
var LINE_CHAR = '\033[44m \033[0m';

var states = {
    currentX: 0,
    heart: {
        y: MAP_MIDDLE.y,
        x: MAP_MIDDLE.x
    },
    isCleared: true,
    currentScore: 0,
    isClickUp: false
};

var map = [];
for (var i = 0; i < MAP_HEIGHT; i += 1) {
    map.push([]);
    for (var j = 0; j < MAP_WIDTH; j += 1) {
        map[i].push(' ');
    }
}
map.unshift(new Array(MAP_WIDTH + 1).join('=').split(''));
map.unshift('  Score: 0'.split(''));

map[states.heart.y + MAP_Y_GAP][states.heart.x] = HEART_CHAR;

var writeTextCenter = function (text, y) {
    var len = text.length;
    map[y].length = 0;
    for (var i = 0; i < Math.floor((MAP_WIDTH - len) / 2); i += 1) {
        map[y].push(' ');
    }
    for (var i = 0; i < len; i += 1) {
        map[y].push(text[i]);
    }
    for (var i = map[y].length; i < MAP_WIDTH; i += 1) {
        map[y].push(' ');
    }
};

var gameOver = function () {
    for (var i = 0; i < map.length; i += 1) {
        if (i - MAP_Y_GAP === MAP_MIDDLE.y - 2) {
            writeTextCenter('Game Over', i);
        } else if (i - MAP_Y_GAP === MAP_MIDDLE.y - 1) {
            writeTextCenter('Your Score is ' + states.currentScore, i);
        } else {
            for (var j = 0; j < MAP_WIDTH; j += 1) {
                map[i][j] = ' ';
            }
        }
    }
    map[map.length - 1] = new Array(MAP_WIDTH + 1).join('-').split('');
    states.isCleared = false;
    render();
    process.exit();
};

var clear = function () {
    if (states.isCleared) {
        return;
    }
    states.isCleared = true;
    for (var i = 0; i < map.length + 1; i += 1) {
        if (i) {
            stdout.moveCursor(0, -1);
        }
        stdout.clearLine();
        stdout.cursorTo(0);
    }
};

var render = function () {
    clear();

    stdout.write(map.map(function (line) {
        return line.join('');
    }).join('\n') + '\n');
    states.isCleared = false;
};

var plusScore = function () {
    states.currentScore += 1;
    map[0][9] = states.currentScore;
};


var moveHeart = function () {
    var heart = states.heart;
    map[heart.y + MAP_Y_GAP][heart.x] = ' ';
    heart.x += 1;
    if (!states.isClickUp) {
        heart.y += 1;
        if (heart.y >= MAP_HEIGHT) {
            heart.y = MAP_HEIGHT - 1;
        }
    }
    states.isClickUp = false;
    if (map[heart.y + MAP_Y_GAP][heart.x] === LINE_CHAR) {
        // Game Over
        gameOver();
    } else {
        map[heart.y + MAP_Y_GAP][heart.x] = HEART_CHAR;
        if (heart.x - 1 + states.currentX >= MAP_WIDTH && (heart.x - 1 + states.currentX) % MAP_LINE_GAP === 0) {
            plusScore();
        }
    }
};

var heartUp = function () {
    var heart = states.heart;
    states.isClickUp = true;
    map[heart.y + MAP_Y_GAP][heart.x] = ' ';
    heart.y -= 1;
    if (heart.y < 0) {
        heart.y = 0;
    }
    if (map[heart.y + MAP_Y_GAP][heart.x] === LINE_CHAR) {
        // Game Over
        gameOver();
    } else {
        map[heart.y + MAP_Y_GAP][heart.x] = HEART_CHAR;
        render();
    }
};

var moveLine = function () {
    var isAddLine = (states.currentX + MAP_WIDTH - 1) % MAP_LINE_GAP === 0;
    var repture = Math.floor(Math.random() * (MAP_HEIGHT - 3));
    for (var i = 0; i < MAP_HEIGHT; i += 1) {
        map[i + MAP_Y_GAP].shift();
        if (isAddLine) {
            map[i + MAP_Y_GAP].push(i >= repture && i - repture < 3 ? ' ' : LINE_CHAR);
        } else {
            map[i + MAP_Y_GAP].push(' ');
        }
    }
    states.heart.x -= 1;
};

var move = function () {
    states.currentX += 1;
    moveHeart();
    moveLine();
    render();
};

stdout.write(new Array(Math.round((MAP_WIDTH - 20) / 2)).join(' ') + 'Flappy Heart CMD Game\n');
stdout.write(new Array(MAP_WIDTH + 1).join('-') + '\n');

setInterval(move, 200);

stdin.on('data', function(key){
    if ( key === '\u0003' ) {
        process.exit();
    }
    if (key === '\u001b\u005b\u0041') {
        heartUp();
    }
});
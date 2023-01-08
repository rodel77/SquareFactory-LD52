;
var IS_DRAWING = false;
var draw_stack = [];
var last_x = 0;
var last_y = 0;
var COLORS = {
    YELLOW: [241, 200, 15],
    BLACK: [0, 0, 0],
    BLUE: [52, 152, 219],
    CYAN: [26, 188, 156],
    WHITE: [255, 255, 255],
    GREEN: [46, 204, 113],
    PURPLE: [155, 89, 182],
    RED: [231, 76, 60],
    ORANGE: [230, 126, 34],
    PINK: [243, 104, 224]
};
var HEART = [[1171, 865], [745, 869], [876, 375], [831, 203], [950, 205], [951, 169], [913, 167], [912, 125], [948, 127], [948, 80], [989, 81], [987, 119], [1021, 121], [1019, 163], [987, 164], [985, 198], [1144, 204], [1061, 373], [1170, 864]];
var scribble = new Scribble();
var screen_size;
var scl;
var like_image;
var font, font2;
var move, place, check, checkmate;
var song;
var intro;
function preload() {
    soundFormats("mp3");
    // plop = loadSound("assets/plop");
    // pling = loadSound("assets/pling");
    // nice = loadSound("assets/nice");
    // rip = loadSound("assets/rip");
    // dead = loadSound("assets/dead");
    move = loadSound("assets/move");
    place = loadSound("assets/place");
    intro = loadSound("assets/intro");
    check = loadSound("assets/check");
    checkmate = loadSound("assets/checkmate");
    song = loadSound("assets/theme");
    song.setLoop(true);
    intro.onended(function () {
        if (gameState != 2 && !song.isPlaying()) {
            song.play();
        }
    });
    // like_image = loadImage("assets/like.png");
    font = loadFont("assets/Pangolin-Regular.ttf");
}
var positions = [];
var au;
var g;
var fun = 100;
var turn = 0;
var botMoved = false;
var updateTime = 0;
var Pieces;
(function (Pieces) {
    Pieces[Pieces["KING"] = 0] = "KING";
    Pieces[Pieces["BISHOP"] = 1] = "BISHOP";
})(Pieces || (Pieces = {}));
function toBoard(x, y) {
    return [(x - windowWidth / 2 + screen_size / 2) / 10 / 10 / get_scale() - 1, (y - windowHeight / 2 + screen_size / 2) / 10 / 10 / get_scale() - 1];
    // let mouseLY = (mouseY - windowHeight/2 + screen_size/2)/10;
}
var gameState = 0;
var lastPlayed;
var cycles;
var cyclesNeeded;
var moves;
function arrow(x1, y1, x2, y2) {
    stroke(COLORS.WHITE);
    strokeWeight(get_scale() * 13);
    scribble.scribbleLine(x1, y1, x2, y2);
    scribble.scribbleLine(x2, y2, x2, y2);
    // scribble.scribbleLine(-100, 100, -100, 80);
    // scribble.scribbleLine(-100, 100, -80, 100);
    stroke(COLORS.BLACK);
    strokeWeight(get_scale() * 5);
    scribble.scribbleLine(-50, 50, -100, 100);
    scribble.scribbleLine(-100, 100, -100, 80);
    scribble.scribbleLine(-100, 100, -80, 100);
}
var Piece = /** @class */ (function () {
    function Piece(type, x, y) {
        this.moving = false;
        this.consecutive = 0;
        this.x = x;
        this.y = y;
        this.type = type;
    }
    Piece.prototype.value = function (x, y) {
        if (x === void 0) { x = this.x; }
        if (y === void 0) { y = this.y; }
        return valuePlaceDiagonal(x, y, this);
    };
    Piece.prototype.bestCell = function () {
        var bestScore, bestCell;
        switch (this.type) {
            case Pieces.BISHOP:
                for (var a = -8; a < 8; a++) {
                    var y = this.y + a;
                    var x1 = this.x + a;
                    var x2 = this.x - a;
                    if (y >= 0 && y <= 7 && (x1 >= 0 && x1 <= 7 || x2 >= 0 && x2 <= 7)) {
                        var vala = this.value(x1, y);
                        var valb = this.value(x2, y);
                        if ((bestScore == undefined || bestScore < vala) && (x1 >= 0 && x1 <= 7 && y >= 0 && y <= 7 && x1 != this.x && y != this.y) && !isOcuppied(x1, y)) {
                            bestScore = vala;
                            bestCell = [x1, y];
                        }
                        if ((bestScore == undefined || bestScore < valb) && (x2 >= 0 && x2 <= 7 && y >= 0 && y <= 7 && x2 != this.x && y != this.y) && !isOcuppied(x2, y)) {
                            bestScore = valb;
                            bestCell = [x2, y];
                        }
                    }
                }
            case Pieces.KING:
                break;
        }
        return bestCell;
    };
    Piece.prototype.draw = function () {
        if (this.gotoX != undefined || this.gotoY != undefined) {
            var alpha = pow(min((Date.now() - this.moveTime) / 500, 1), 3);
            this.x = lerp(this.fromX, this.gotoX, alpha);
            this.y = lerp(this.fromY, this.gotoY, alpha);
            if (this.x == this.gotoX && this.y == this.gotoY) {
                this.gotoX = undefined;
                this.gotoY = undefined;
                this.moving = false;
                place.play();
            }
        }
        push();
        translate((this.x) * 10, (this.y) * 10);
        scale(1 / 10, 1 / 10);
        // console.log(this.x, this.y)
        if (turn == 0 && gameState != 2 && this.type == Pieces.KING) {
            push();
            stroke(COLORS.YELLOW);
            strokeWeight(get_scale() * 2.5);
            translate(-50, -50);
            translate(-100, -100);
            for (var y = -1; y <= 1; y++) {
                for (var x = -1; x <= 1; x++) {
                    if (!(x == 0 && y == 0) && this.x + x >= 0 && this.y + y >= 0 && this.x + x <= 7 && this.y + y <= 7) {
                        stroke(COLORS.YELLOW);
                        if (moves == 0) {
                            for (var i = 0; i < pieces.length; i++) {
                                if (isDiagonal(this.x + x, this.y + y, pieces[i].x, pieces[i].y)) {
                                    stroke(COLORS.RED);
                                    break;
                                }
                            }
                        }
                        scribble.scribbleRect(50, 50, 90, 90);
                        translate(5, 5);
                        scribble.scribbleFilling([0, 90, 90, 0], [0, 0, 90, 90], 10, 215);
                        translate(-5, -5);
                    }
                    translate(100, 0);
                }
                translate(-300, 100);
            }
            pop();
        }
        strokeWeight(get_scale() * 5);
        push();
        if (this.type == Pieces.KING) {
            // stroke(COLORS.WHITE);
            // scribble.scribbleRect(0, 30, 67, 27);
            // strokeWeight(get_scale() * 14)
            // scribble.scribbleCurve(0, 20, 0, -30, 30, 0, 50, -40);
            // scribble.scribbleCurve(0, 20, 0, -30, -30, 0, -50, -40);
            // scribble.scribbleLine(0, 20, 0, -30);
            // strokeWeight(get_scale() * 10)
            // scribble.scribbleLine(0, -30, 0, -45);
            // scribble.scribbleLine(-5, -40, 5, -40);
            pop();
            stroke(COLORS.BLACK);
            push();
            translate(-60 / 2, 23);
            scribble.scribbleFilling([0, 60, 60, 0], [0, 0, 15, 15], 7, 215);
            pop();
            // translate(70/2, -10)
            scribble.scribbleRect(0, 30, 60, 15);
            strokeWeight(get_scale() * 7);
            // // scribble.scribbleLine(0, 2, 0, -3);
            scribble.scribbleLine(0, 20, 0, -30);
            scribble.scribbleCurve(0, 20, 0, -30, 30, 0, 50, -40);
            scribble.scribbleCurve(0, 20, 0, -30, -30, 0, -50, -40);
            strokeWeight(get_scale() * 5);
            scribble.scribbleLine(0, -30, 0, -45);
            scribble.scribbleLine(-5, -40, 5, -40);
            if (gameState == 0) {
                stroke(COLORS.WHITE);
                strokeWeight(get_scale() * 13);
                scribble.scribbleLine(-50, 50, -100, 100);
                scribble.scribbleLine(-100, 100, -100, 80);
                scribble.scribbleLine(-100, 100, -80, 100);
                stroke(COLORS.BLACK);
                strokeWeight(get_scale() * 5);
                scribble.scribbleLine(-50, 50, -100, 100);
                scribble.scribbleLine(-100, 100, -100, 80);
                scribble.scribbleLine(-100, 100, -80, 100);
                stroke(COLORS.WHITE);
                strokeWeight(get_scale() * 13);
                scribble.scribbleLine(50, -50, 100, -100);
                scribble.scribbleLine(100, -100, 100, -80);
                scribble.scribbleLine(100, -100, 80, -100);
                stroke(COLORS.BLACK);
                strokeWeight(get_scale() * 5);
                scribble.scribbleLine(50, -50, 100, -100);
                scribble.scribbleLine(100, -100, 100, -80);
                scribble.scribbleLine(100, -100, 80, -100);
            }
        }
        if (this.type == Pieces.BISHOP) {
            // stroke(COLORS.BLACK);
            // scribble.scribbleRect(0, 30, 67, 27);
            // strokeWeight(get_scale() * 19)
            // scribble.scribbleEllipse(0, -35, 10, 10);
            // scribble.scribbleEllipse(0, 0, 35, 55);
            // strokeWeight(get_scale() * 10)
            pop();
            stroke(COLORS.WHITE);
            push();
            translate(-60 / 2, 23);
            scribble.scribbleFilling([0, 60, 60, 0], [0, 0, 15, 15], 7, 215);
            pop();
            // translate(70/2, -10)
            scribble.scribbleRect(0, 30, 60, 15);
            strokeWeight(get_scale() * 7);
            // // scribble.scribbleLine(0, 2, 0, -3);
            // scribble.scribbleLine(0, 20, 0, -30);
            fill(COLORS.WHITE);
            scribble.scribbleEllipse(0, -35, 10, 10);
            scribble.scribbleEllipse(0, 0, 35, 55);
            // scribble.scribbleCurve(15, 20, 0, -30, 35, 5, 30, -30);
            // scribble.scribbleCurve(-15, 20, 0, -30, -35, 5, -30, -30);
            // scribble.scribbleCurve(0, 20, 0, -30, -30, 0, -50, -40);
        }
        pop();
        if (this.type == Pieces.BISHOP) {
            push();
            // scale(1/10, 1/10)
            textSize(4);
            fill(COLORS.WHITE);
            for (var a = -8; a < 8; a++) {
                var y = this.y + a;
                var x1 = this.x + a;
                var x2 = this.x - a;
                var coords = toBoard(mouseX, mouseY);
                if (y >= 0 && y <= 7 && (x1 >= 0 && x1 <= 7 || x2 >= 0 && x2 <= 7) && this.x == floor(coords[0]) && this.y == floor(coords[1])) {
                    text(Math.floor(valuePlaceDiagonal(x1, y, this)), x1 * 10, y * 10);
                    text(Math.floor(valuePlaceDiagonal(x2, y, this)), x2 * 10, y * 10);
                    // text(valuePlaceCross(x1, this.y), x1 * 10, this.y * 10);
                }
            }
            pop();
        }
    };
    Piece.prototype.move = function (x, y) {
        this.gotoX = x;
        this.gotoY = y;
        this.fromX = this.x;
        this.fromY = this.y;
        this.moving = true;
        this.moveTime = Date.now();
        move.play();
        if (this.type == Pieces.KING) {
            for (var i = 0; i < pieces.length; i++) {
                if (pieces[i].x == x && pieces[i].y == y) {
                    pieces.splice(i, 1);
                    if (pieces.length == 1) {
                        cycles += cyclesNeeded - 1;
                    }
                }
            }
        }
    };
    return Piece;
}());
var lastMessage, messageTime;
var pieces = [];
var piece;
function reset() {
    gameState = 0;
    lastPlayed = null;
    lastMessage = null;
    messageTime = null;
    cycles = 0;
    cyclesNeeded = 7;
    botMoved = false;
    turn = 0;
    moves = 0;
    pieces = [
        // new Piece(Pieces.BISHOP, 3, 4),
        new Piece(Pieces.BISHOP, 3, 4),
        new Piece(Pieces.BISHOP, 4, 4),
        new Piece(Pieces.BISHOP, 5, 4),
    ];
    piece = new Piece(Pieces.KING, 1, 1);
}
reset();
function isDiagonal(x1, y1, x2, y2) {
    if (x1 == x2 && y1 == y2)
        return false;
    return abs(x1 - x2) == abs(y1 - y2);
}
function isCross(x1, y1, x2, y2) {
    return x1 == x2 || y1 == y2;
}
function isAdjacent8(x1, y1, x2, y2) {
    return abs(x1 - x2) <= 1 && abs(y1 - y2) <= 1;
}
function valuePlaceCross(x, y) {
    if (isAdjacent8(piece.x, piece.y, x, y))
        return -1;
    if (isCross(piece.x, piece.y, x, y)) {
        return 100;
    }
    var defenses = 0;
    for (var ly = -1; ly <= 1; ly++) {
        for (var lx = -1; lx <= 1; lx++) {
            if (isCross(piece.x + lx, piece.y + ly, x, y)) {
                defenses += 10;
            }
        }
    }
    if (defenses > 0) {
        return defenses;
    }
    return 0;
}
function valuePlaceDiagonal(x, y, owner) {
    if (isAdjacent8(piece.x, piece.y, x, y))
        return -1;
    if (isDiagonal(piece.x, piece.y, x, y)) {
        return 100;
    }
    var defenses = 0;
    for (var ly = -1; ly <= 1; ly++) {
        for (var lx = -1; lx <= 1; lx++) {
            if (isDiagonal(piece.x + lx, piece.y + ly, x, y)) {
                // console.log(sqrt((pow(piece.x+lx - x, 2) + pow(piece.y+ly - y, 2))))
                defenses += 10 - someoneDefending(piece.x + lx, piece.y + ly, owner) * 5 + random(-5, 5);
            }
        }
    }
    if (defenses > 0) {
        return defenses;
    }
    return 0;
}
function someoneDefending(x, y, expect) {
    var defenses = 0;
    for (var i = 0; i < pieces.length; i++) {
        if (expect != piece[i] && isDiagonal(x, y, pieces[i].x, pieces[i].y)) {
            defenses++;
        }
    }
    return defenses;
}
function checkCheckmate() {
    for (var ly = -1; ly <= 1; ly++) {
        for (var lx = -1; lx <= 1; lx++) {
            var x = piece.x + lx;
            var y = piece.y + ly;
            if (!(x == piece.x && y == piece.y) && x >= 0 && y >= 0 && x <= 7 && y <= 7) {
                var attacking_cell = false;
                for (var i = 0; i < pieces.length; i++) {
                    if (isDiagonal(x, y, pieces[i].x, pieces[i].y)) {
                        attacking_cell = true;
                        continue;
                    }
                }
                if (!attacking_cell) {
                    return false;
                }
            }
        }
    }
    message("Checkmate!");
    return true;
}
function checkLose() {
    if (checkCheckmate()) {
        return true;
    }
    for (var i = 0; i < pieces.length; i++) {
        if (isDiagonal(pieces[i].x, pieces[i].y, piece.x, piece.y)) {
            message("Checkmate!");
            return true;
        }
    }
}
function setup() {
    createCanvas(windowWidth, windowHeight);
    textFont(font);
    // scribble.roughness = .2;
    // frameRate(10)
}
;
function get_scale() {
    return screen_size / 1000;
}
function isOcuppied(x, y) {
    for (var i = 0; i < pieces.length; i++) {
        if (pieces[i].x == x && pieces[i].y == y)
            return true;
    }
    return false;
}
function update() {
    updateTime += deltaTime;
    if (updateTime > 250) {
        updateTime = 0;
        fun -= 2;
        fun = max(0, fun);
    }
    scribble.roughness = 1 + max(pieces.length - 3, 0) * .5;
    // console.log(1 + min(pieces.length - 3, 0))
    if (gameState != 2) {
        if (turn == 1) {
            if (!piece.moving) {
                if (!botMoved) {
                    if (checkLose()) {
                        gameState = 2; // lose
                        return;
                    }
                    if (cycles >= cyclesNeeded) {
                        cyclesNeeded += 2;
                        cycles = 0;
                        var distance = void 0, cell = void 0;
                        var light = 0;
                        var dark = 0;
                        for (var i = 0; i < pieces.length; i++) {
                            if (pieces[i].x % 2 == pieces[i].y % 2) {
                                light++;
                            }
                            else {
                                dark++;
                            }
                        }
                        for (var x = 0; x <= 7; x++) {
                            for (var y = 0; y <= 7; y++) {
                                if (x % 2 == y % 2) {
                                    if (light > dark)
                                        continue;
                                }
                                else {
                                    if (dark > light)
                                        continue;
                                }
                                var dist = sqrt(pow(x - piece.x, 2) + pow(x - piece.x, 2));
                                if (!isOcuppied(x, y) && (distance == undefined || dist > distance)) {
                                    distance = dist;
                                    cell = [x, y];
                                }
                            }
                        }
                        if (cell) {
                            pieces.push(new Piece(Pieces.BISHOP, cell[0], cell[1]));
                        }
                    }
                    botMoved = true;
                    botMove();
                }
                var static = true;
                for (var i = 0; i < pieces.length; i++) {
                    if (pieces[i].moving) {
                        static = false;
                    }
                }
                if (static) {
                    botMoved = false;
                    turn = 0;
                    for (var i = 0; i < pieces.length; i++) {
                        if (isDiagonal(pieces[i].x, pieces[i].y, piece.x, piece.y)) {
                            check.play();
                            message("Check");
                            break;
                        }
                    }
                    if (checkCheckmate()) {
                        gameState = 2; // lose
                        return;
                    }
                }
            }
        }
    }
}
function message(text) {
    lastMessage = text;
    messageTime = Date.now();
}
function draw() {
    var t = 0;
    t = Date.now();
    update();
    textAlign(CENTER, CENTER);
    randomSeed(Date.now() / 100);
    // update();
    // // console.log("asd")
    // // clear();
    // // rect(sin(Date.now())*100, 0, 100, 100);
    background(200);
    // stroke(COLORS.RED);
    // scribble.scribbleLine(0, 0, 100, 100);
    var scl = get_scale();
    push();
    noStroke();
    screen_size = min(windowWidth, windowHeight);
    fill(50, 50, 50);
    translate(-screen_size / 2, -screen_size / 2);
    translate(windowWidth / 2, windowHeight / 2);
    // rect(0, 0, screen_size, screen_size)
    stroke(COLORS.BLACK);
    fill(COLORS.WHITE);
    textSize(scl * 100);
    pop();
    var board_size = 10 * 5 * 8;
    push();
    strokeWeight(scl * .5);
    translate(windowWidth / 2, windowHeight / 2);
    translate(-screen_size / 2, -screen_size / 2);
    // translate(scl*10*5*8/4,scl*10*5*8/4)
    var mouseLX = toBoard(mouseX, mouseY);
    var mouseLY = toBoard(mouseX, mouseY);
    scale(scl * 10);
    translate(10, 10);
    translate(5, 5);
    // t = Date.now();
    pop();
    // if(mouseIsPressed){
    //     draw_stack[draw_stack.length-1] = [mouseX, mouseY];
    // }
    // if(gameState==2 && (intro.isPlaying() || song.isPlaying())){
    //     song.stop();
    //     intro.stop()
    //     checkmate.play()
    // }
}
// window.mousePressed = function(){
// }
window.mousePressed = function (e) {
};
window.windowResized = function () {
    resizeCanvas(windowWidth, windowHeight);
};

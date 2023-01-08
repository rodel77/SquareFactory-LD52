;
const IS_DRAWING = false;
let draw_stack = [];
let last_x = 0;
let last_y = 0;
const COLORS = {
    YELLOW: [241, 200, 15],
    BLACK: [0, 0, 0],
    BLUE: [52, 152, 219],
    CYAN: [26, 188, 156],
    WHITE: [255, 255, 255],
    GREEN: [46, 204, 113],
    PURPLE: [155, 89, 182],
    RED: [231, 76, 60],
    ORANGE: [230, 126, 34],
    PINK: [243, 104, 224],
};
const RESOURCES = {
    CIRCLE: COLORS.BLUE,
    TRIANGLE: COLORS.YELLOW,
    DIAMOND: COLORS.CYAN,
    PLUS: COLORS.GREEN,
    HEX: COLORS.PINK,
    RECT: COLORS.WHITE,
};
const EXCHANGES = {
    TRIANGLE: [["CIRCLE", 2]],
    DIAMOND: [["TRIANGLE", 20], ["CIRCLE", 20]],
    PLUS: [["DIAMOND", 200], ["CIRCLE", 200]],
    HEX: [["PLUS", 4], ["CIRCLE", 5000]],
    RECT: [["CIRCLE", 10000], ["TRIANGLE", 1000], ["PLUS", 100], ["HEX", 5]]
};
const FACTORY_PRICES = {
    CIRCLE: [["TRIANGLE", 5]],
    TRIANGLE: [["CIRCLE", 10]],
    DIAMOND: [["TRIANGLE", 10], ["CIRCLE", 10]],
    PLUS: [["DIAMOND", 100]],
    HEX: [["TRIANGLE", 1000]],
    RECT: [["HEX", 1]],
};
const FACTORY_PRICE = 10;
const inventory = {};
const factories = {};
let init_state = true;
let input_down;
var scribble = new Scribble();
var screen_size;
var scl;
let like_image;
let font, font2;
let pick, pling1, pling3, checkmate;
let song;
let intro;
function preload() {
    soundFormats("mp3");
    // plop = loadSound("assets/plop");
    // pling = loadSound("assets/pling");
    // nice = loadSound("assets/nice");
    // rip = loadSound("assets/rip");
    // dead = loadSound("assets/dead");
    pick = loadSound("assets/pick");
    pick.setVolume(.3);
    pling1 = loadSound("assets/pling2");
    // pling3 = loadSound("assets/pling3");
    // check = loadSound("assets/check");
    // checkmate = loadSound("assets/checkmate");
    song = loadSound("assets/theme");
    song.setLoop(true);
    // song.setLoop(true);
    // intro.onended(()=>{
    //     if(gameState!=2 && !song.isPlaying()){
    //         song.play()
    //     }
    // })
    // like_image = loadImage("assets/like.png");
    font = loadFont("assets/JosefinSans-Regular.ttf");
}
let positions = [];
let au;
let g;
let fun = 100;
let turn = 0;
let botMoved = false;
let updateTime = 0;
var Pieces;
(function (Pieces) {
    Pieces[Pieces["KING"] = 0] = "KING";
    Pieces[Pieces["BISHOP"] = 1] = "BISHOP";
})(Pieces || (Pieces = {}));
function toBoard(x, y) {
    return [(x - windowWidth / 2 + screen_size / 2) / (get_scale() * 10), (y - windowHeight / 2 + screen_size / 2) / (get_scale() * 10)];
    // let mouseLY = (mouseY - windowHeight/2 + screen_size/2)/10;
}
let gameState = 0;
let lastPlayed;
let cycles;
let cyclesNeeded;
let moves;
let last_click = 0;
let click_streak = 0;
function reset() {
    for (let resource in RESOURCES) {
        inventory[resource] = 0;
        factories[resource] = 0;
    }
    init_state = true;
    msg = "Purchase the blue factory\nHarvest and manage resources";
}
function setup() {
    createCanvas(windowWidth, windowHeight);
    textFont(font);
    angleMode(DEGREES);
    reset();
    // scribble.roughness = .2;
    // frameRate(10)
}
;
function get_scale() {
    return screen_size / 1000;
}
let generated_last_update = {};
let last_update = 0;
let build_update = 0;
function update() {
    updateTime += deltaTime;
    // console.log(click_streak, millis()-last_click)
    if (click_streak > 10 && last_click && millis() - last_click > 3000) {
        msg = "";
    }
    if (updateTime > 1500) {
        generated_last_update = {};
        last_update = millis();
        updateTime = 0;
        // pick.play()
        for (let resource in RESOURCES) {
            if (factories[resource] > 0) {
                // Check if exchange is valid
                let is_valid = true;
                if (EXCHANGES[resource]) {
                    for (let i in EXCHANGES[resource]) {
                        let exchange = EXCHANGES[resource][i];
                        // console.log("Searching for", exchange[1],)
                        if (inventory[exchange[0]] < exchange[1] * max(factories[resource], 1)) {
                            is_valid = false;
                            console.log("invalid!");
                            break;
                        }
                    }
                }
                if (is_valid) {
                    inventory[resource] += factories[resource] * 1;
                    generated_last_update[resource] = true;
                    if (EXCHANGES[resource]) {
                        for (let i in EXCHANGES[resource]) {
                            let exchange = EXCHANGES[resource][i];
                            inventory[exchange[0]] -= exchange[1] * max(factories[resource], 1);
                        }
                    }
                }
            }
        }
    }
}
// function message(text){
//     lastMessage = text;
//     messageTime = Date.now();
// }
function draw_house(x, y) {
}
function draw_resource(x, y, resource, color) {
    fill(color ? color : RESOURCES[resource]);
    push();
    translate(x, y);
    scale(.5, .5);
    switch (resource) {
        case "RECT":
            translate(-5 / 2, -5 / 2);
            rect(0, 0, 5, 5);
            break;
        case "CIRCLE":
            circle(0, 0, 5);
            break;
        case "TRIANGLE":
            beginShape();
            translate(0, -5 / 2);
            vertex(0, 0);
            vertex(5 / 2, 5);
            vertex(-5 / 2, 5);
            vertex(0, 0);
            endShape();
            break;
        case "DIAMOND":
            beginShape();
            translate(0, -5 / 2);
            vertex(0, 0);
            vertex(5 / 2, 5 / 2);
            vertex(0, 5);
            vertex(-5 / 2, 5 / 2);
            vertex(0, 0);
            endShape();
            break;
        case "PLUS":
            beginShape();
            translate(-.5, -1.5);
            vertex(0, 0);
            vertex(1, 0);
            vertex(1, 1);
            vertex(2, 1);
            vertex(2, 2);
            vertex(1, 2);
            vertex(1, 3);
            vertex(0, 3);
            vertex(0, 2);
            vertex(-1, 2);
            vertex(-1, 1);
            vertex(0, 1);
            vertex(0, 0);
            endShape();
            break;
        case "HEX":
            beginShape();
            let scl = .2;
            vertex(scl * -7.5, -13.0 * scl);
            vertex(scl * 7.5, -13.0 * scl);
            vertex(scl * 15.0, 0 * scl);
            vertex(scl * 7.5, 13.0 * scl);
            vertex(scl * -7.5, 13.0 * scl);
            vertex(scl * -15.0, 0);
            vertex(scl * -7.5, -13.0 * scl);
            endShape();
            break;
    }
    pop();
}
function draw_factory(x, y, resource, focus) {
    let fact = factories[resource];
    fill(RESOURCES[resource]);
    push();
    translate(x, y);
    scale(.5, .5);
    if (fact != 0 && generated_last_update[resource] == true) {
        let scl = 1 + sin(min(360 / 2, (millis() - last_update) * .4)) * .2;
        scale(scl, scl);
    }
    if (focus) {
        scale(1.1, 1.1);
    }
    beginShape();
    vertex(4, -3);
    vertex(4, -15);
    vertex(6, -16);
    vertex(6, -3);
    vertex(7, -3);
    vertex(7, -15);
    vertex(9, -16);
    vertex(9, -3);
    endShape();
    beginShape();
    vertex(-10, -4);
    vertex(-6, -7);
    vertex(-6, -4);
    vertex(-2, -7);
    vertex(-2, -4);
    vertex(2, -7);
    vertex(2, -4);
    vertex(10, -4);
    vertex(10, 4);
    vertex(-10, 4);
    vertex(-10, -4);
    endShape();
    // circle(0, 0, 5);
    stroke(0, 0, 0);
    if (fact != 0 && generated_last_update[resource] == true) {
        push();
        let alpha = (millis() - last_update) * .4 / 360 / 2;
        scale(.5, .5);
        text("+" + factories[resource], 0, -alpha * 40);
        pop();
    }
    scale(.5, .5);
    text(factories[resource], -28, 0);
    if (focus) {
        text("Purchase factory:", 0, 33);
        if (FACTORY_PRICES[resource]) {
            push();
            translate(0, 45);
            let size = (Object.keys(FACTORY_PRICES[resource]).length + .5) * (5 / 2);
            translate(-size / 2, 0);
            for (let res in FACTORY_PRICES[resource]) {
                let factory_price = FACTORY_PRICES[resource][res];
                fill(RESOURCES[factory_price[0]]);
                scale(1 / .3, 1 / .3);
                draw_resource(0, 0, factory_price[0], undefined);
                push();
                scale(.3, .3);
                translate(2, 2);
                strokeWeight(get_scale() * .8);
                if (inventory[factory_price[0]] < (factory_price[1])) {
                    fill(COLORS.RED);
                }
                else {
                    fill(RESOURCES[factory_price[0]]);
                }
                text(factory_price[1], 0, 0);
                pop();
                translate(5 / 2 + 1, 0);
                scale(.3, .3);
            }
            pop();
        }
        // if(factories["CIRCLE"]!=0){
        //     text(FACTORY_PRICE, 6, 48)
        //     scale(4, 4)
        //     draw_resource(-2, 12, resource)
        // }
    }
    pop();
    draw_resource(x, y, resource);
    let size = 0;
    if (EXCHANGES[resource]) {
        size = (textWidth("=") + 4) + (Object.keys(EXCHANGES[resource]).length + 1) * (5 / 2 * 1 / .3);
        // console.log(Object.keys(EXCHANGES[resource]).length)
    }
    if (fact == 0) {
        fill(COLORS.RED);
    }
    push();
    translate(x, y);
    scale(.3, .3);
    translate(-size / 2, 0);
    // rect(0, 0, size, 10)
    translate(0, 13);
    stroke(0, 0, 0);
    scale(1 / .3, 1 / .3);
    draw_resource(0, 0, resource, fact == 0 ? COLORS.RED : undefined);
    push();
    scale(.3, .3);
    translate(2, 2);
    strokeWeight(get_scale() * .8);
    if (((fact) + "").length >= 3) {
        scale(.5, .5);
    }
    text(fact, 0, 0);
    pop();
    translate(5 / 2 + 1, 0);
    scale(.3, .3);
    if (resource != "CIRCLE") {
        text("=", 0, 0);
        translate(textWidth("=") + 4, 0);
        if (EXCHANGES[resource]) {
            for (let exchanges in EXCHANGES[resource]) {
                let exchange = EXCHANGES[resource][exchanges];
                fill(RESOURCES[exchange[0]]);
                scale(1 / .3, 1 / .3);
                draw_resource(0, 0, exchange[0], undefined);
                push();
                scale(.3, .3);
                translate(2, 2);
                strokeWeight(get_scale() * .8);
                if (inventory[exchange[0]] < (exchange[1] * max(1, fact))) {
                    fill(COLORS.RED);
                }
                else {
                    fill(RESOURCES[exchange[0]]);
                }
                push();
                if (((exchange[1] * max(1, fact)) + "").length >= 3) {
                    scale(.7, .7);
                }
                if (((exchange[1] * max(1, fact)) + "").length >= 4) {
                    scale(.7, .7);
                }
                text(exchange[1] * max(1, fact), 0, 0);
                pop();
                pop();
                translate(7 / 2 + 2, 0);
                scale(.3, .3);
            }
        }
    }
    pop();
}
const size = .70;
function draw_hex(x, y) {
    push();
    // scale(size, size)
    // colorMode(HSB);
    noStroke();
    let result = noise(x * .1 + millis() * .0001, y * .1 + millis() * .0001);
    fill(50 + result * 3, 50 + result * 3, 50 + result * 3);
    translate(50, 50);
    scale(size, size);
    translate(x * 23.5 * 1.5, y * 27 * 1.5);
    if (x % 2 != 0) {
        translate(0, 27 / 2);
    }
    scale(.7 + result * .8, .7 + result * .8);
    beginShape();
    vertex(-7.5, -13.0);
    vertex(7.5, -13.0);
    vertex(15.0, 0);
    vertex(7.5, 13.0);
    vertex(-7.5, 13.0);
    vertex(-15.0, 0);
    vertex(-7.5, -13.0);
    endShape();
    pop();
    // colorMode(RGB);
}
let msg = "";
let focused_factory;
function draw() {
    let t = 0;
    focused_factory = undefined;
    t = Date.now();
    update();
    textAlign(CENTER, CENTER);
    randomSeed(Date.now() / 100);
    // update();
    // // console.log("asd")
    // // clear();
    // // rect(sin(Date.now())*100, 0, 100, 100);
    background(50, 50, 50);
    // stroke(COLORS.RED);
    // scribble.scribbleLine(0, 0, 100, 100);
    let scl = get_scale();
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
    let board_size = 10 * 5 * 8;
    push();
    strokeWeight(scl * .5);
    translate(windowWidth / 2, windowHeight / 2);
    translate(-screen_size / 2, -screen_size / 2);
    // translate(scl*10*5*8/4,scl*10*5*8/4)
    let mouseLX = toBoard(mouseX, mouseY);
    let mouseLY = toBoard(mouseX, mouseY);
    scale(scl * 10);
    // translate(10, 10);
    // translate(5, 5)
    let mouse = toBoard(mouseX, mouseY);
    // print(mouse)
    // circle(mouse[0], mouse[1], 10)
    for (let x = -2; x <= 2; x++) {
        for (let y = -2; y <= (abs(x % 2) == 1 ? 1 : 2); y++) {
            if (abs(x) == abs(y) && abs(x) == 2) {
                continue;
            }
            draw_hex(x, y);
        }
    }
    let keys = Object.keys(RESOURCES);
    let angle = 360 / keys.length;
    for (let i = 0; i < keys.length; i++) {
        let x = 50 + cos(angle * i) * 30;
        let y = 46 + sin(angle * i) * 22;
        let valid = true;
        let resource = keys[i];
        if (resource != "CIRCLE") {
            if (FACTORY_PRICES[resource]) {
                for (let res in FACTORY_PRICES[resource]) {
                    let factory_price = FACTORY_PRICES[resource][res];
                    if (factories[factory_price[0]] == 0) {
                        valid = false;
                    }
                }
            }
            if (EXCHANGES[resource]) {
                for (let res in EXCHANGES[resource]) {
                    let exchange = EXCHANGES[resource][res];
                    if (factories[exchange[0]] == 0) {
                        valid = false;
                    }
                }
            }
        }
        if (valid) {
            let focus = false;
            if (sqrt(pow(mouse[0] - x, 2) + pow(mouse[1] - y, 2)) < 5) {
                focus = true;
                focused_factory = keys[i];
            }
            draw_factory(x, y, keys[i], focus);
        }
    }
    push();
    scale(.5, .5);
    fill(255, 255, 255);
    text(msg, 50 * 2, 15);
    pop();
    push();
    translate(50, 85);
    translate(-(7 * (keys.length - 1)), 0);
    scale(2, 2);
    for (let i = 0; i < keys.length; i++) {
        draw_resource(0, 0, keys[i]);
        push();
        scale(.3, .3);
        stroke(0, 0, 0);
        // strokeWeight(get_scale())
        translate(0, 15);
        if ((inventory[keys[i]] + "").length > 3) {
            scale(.5, .5);
        }
        text(inventory[keys[i]], 0, 0);
        pop();
        translate(7, 0);
    }
    pop();
    // t = Date.now();
    pop();
    if (input_down != undefined && millis() - input_down > 500) {
        build_update += deltaTime;
        if (build_update > map(min(10000, max(5000, millis() - input_down)), 5000, 10000, 100, 10)) {
            build_update = 0;
            buy_factory();
        }
    }
    // if(mouseIsPressed){
    //     draw_stack[draw_stack.length-1] = [mouseX, mouseY];
    // }
    // if(gameState==2 && (intro.isPlaying() || song.isPlaying())){
    //     song.stop();
    //     intro.stop()
    //     checkmate.play()
    // }
}
function buy_factory() {
    if (init_state && focused_factory != "CIRCLE")
        return false;
    if (!init_state) {
        for (let index in FACTORY_PRICES[focused_factory]) {
            let price = FACTORY_PRICES[focused_factory][index];
            if (inventory[price[0]] < price[1]) {
                console.log("No money");
                return false;
            }
        }
    }
    if (!init_state) {
        for (let index in FACTORY_PRICES[focused_factory]) {
            let price = FACTORY_PRICES[focused_factory][index];
            inventory[price[0]] -= price[1];
        }
    }
    else {
        init_state = false;
        msg = "";
        song.play();
    }
    factories[focused_factory] += 1;
    return true;
}
window.mouseReleased = function () {
    input_down = undefined;
};
window.mousePressed = function (e) {
    if (focused_factory) {
        if (millis() - last_click < 500) {
            click_streak++;
        }
        else {
            click_streak = 1;
        }
        if (click_streak > 10) {
            msg = "Hold to rapid purchase factories";
        }
        if (buy_factory()) {
            pling1.play();
        }
        last_click = millis();
        input_down = millis();
        // if(!init_state && inventory[focused_factory]<FACTORY_PRICE){
        //     return;
        // }
        // factories[focused_factory] += 1;
        // if(!init_state){
        //     inventory[focused_factory] -= FACTORY_PRICE;
        // }else{
        //     init_state = false;
        // }
    }
};
window.windowResized = function () {
    resizeCanvas(windowWidth, windowHeight);
};

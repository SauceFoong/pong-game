"use strict";
exports.__esModule = true;
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
function pong() {
    // Inside this function you will use the classes and functions 
    // from rx.js
    // to add visuals to the svg element in pong.html, animate them, and make them interactive.
    // Study and complete the tasks in observable exampels first to get ideas.
    // Course Notes showing Asteroids in FRP: https://tgdwyer.github.io/asteroids/ 
    // You will be marked on your functional programming style
    // as well as the functionality that you implement.
    // Document your code!  
    var rect = document.getElementById("paddle1");
    var state = {
        x: 50,
        y: 20,
        fill: '#95B3D7'
    };
    var keyUp$ = rxjs_1.fromEvent(document, 'keydown').pipe(operators_1.filter(function (x) { return x.key == "ArrowUp"; })).pipe(operators_1.map(function (x) { return ([0, -10]); }));
    var keyDown$ = rxjs_1.fromEvent(document, 'keydown').pipe(operators_1.filter(function (x) { return x.key == "ArrowDown"; })).pipe(operators_1.map(function (x) { return ([0, 10]); }));
    var keyboard = rxjs_1.merge(keyUp$, keyDown$).subscribe(function (x) { return (rect.setAttribute("transform", 'translate(${state.y})')); });
}
// fromEvent<KeyboardEvent>(document,'keydown')
//   .pipe(
//     filter(({repeat})=>!repeat),
//     filter(({keyCode:k})=>k===38 || k===40),
//     flatMap(({keyCode:downKeyCode})=>interval(10).pipe(
//       takeUntil(
//         fromEvent<KeyboardEvent>(document,'keyup').pipe(
//           filter(up=>up.keyCode === downKeyCode))),
//       map(_=>downKeyCode===38?-1:1))
//     )
//   ).subscribe({next:e=>{
//     rect.setAttribute('transform',
//       `translate(${state.x},${state.y+=Number(e)})`)
//   }})
// }
// the following simply runs your pong function on window load.  Make sure to leave it in place.
if (typeof window != 'undefined')
    window.onload = function () {
        pong();
    };

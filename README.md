WebGL-2D
========

#### HTML5 Canvas2D API in WebGL. ####

**Authors:** 

* Corban Brook [@corban](http://twitter.com/corban) 
* Bobby Richter [@secretrobotron](http://twitter.com/secretrobotron) 
* Charles J. Cliffe [@ccliffe](http://twitter.com/ccliffe)

This project aims to be a complete port of the Canvas2D API implemented in a WebGL context. 
WebGL-2D is a proof of concept and attempts to ascertain performance improvements over Canvas2D.

It should allow _most_ Canvas2D applications to be switched to a WebGL context.

Switching your Canvas2D sketch to a WebGL2D is very simple and only requires one additional line of code:

    var cvs = document.getElementById("myCanvas");

    WebGL2D.enable(cvs); // adds "webgl-2d" context to cvs

    var ctx = cvs.getContext("webgl-2d"); // easily switch between "webgl-2d" and "2d" contexts


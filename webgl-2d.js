/** 
 *  WebGL-2D.js - HTML5 Canvas2D API in a WebGL context
 * 
 *  Created by Corban Brook <corbanbrook@gmail.com> on 2011-03-02.
 *  Amended to by Bobby Richter <secretrobotron@gmail.com> on 2011-03-03
 *  CubicVR.js by Charles Cliffe <cj@cubicproductions.com> on 2011-03-03
 *
 */

/*  
 *  Copyright (c) 2011 Corban Brook
 * 
 *  Permission is hereby granted, free of charge, to any person obtaining
 *  a copy of this software and associated documentation files (the
 *  "Software"), to deal in the Software without restriction, including
 *  without limitation the rights to use, copy, modify, merge, publish,
 *  distribute, sublicense, and/or sell copies of the Software, and to
 *  permit persons to whom the Software is furnished to do so, subject to
 *  the following conditions:
 *  
 *  The above copyright notice and this permission notice shall be
 *  included in all copies or substantial portions of the Software.
 *  
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 *  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 *  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 *  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 *  LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 *  OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 *  WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

/**
 * Usage:
 * 
 *    var cvs = document.getElementById("myCanvas");
 * 
 *    WebGL2D.enable(cvs); // adds "webgl-2d" to cvs
 *
 *    cvs.getContext("webgl-2d");
 *
 */

(function(undefined) {

  // Vector & Matrix libraries from CubicVR.js
  var M_PI = 3.1415926535897932384626433832795028841968;
  var M_TWO_PI = 2.0 * M_PI;
  var M_HALF_PI = M_PI / 2.0;
  var vec3 = {
    length: function(pt) {
      return Math.sqrt(pt[0] * pt[0] + pt[1] * pt[1] + pt[2] * pt[2]);
    },
    normalize: function(pt) {
      var d = Math.sqrt((pt[0] * pt[0]) + (pt[1] * pt[1]) + (pt[2] * pt[2]));
      if (d === 0) {
        return [0, 0, 0];
      }
      return [pt[0] / d, pt[1] / d, pt[2] / d];
    },
    dot: function(v1, v2) {
      return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
    },
    angle: function(v1, v2) {
      return Math.acos((v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2]) / (Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1] + v1[2] * v1[2]) * Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1] + v2[2] * v2[2])));
    },
    cross: function(vectA, vectB) {
      return [vectA[1] * vectB[2] - vectB[1] * vectA[2], vectA[2] * vectB[0] - vectB[2] * vectA[0], vectA[0] * vectB[1] - vectB[0] * vectA[1]];
    },
    multiply: function(vectA, constB) {
      return [vectA[0] * constB, vectA[1] * constB, vectA[2] * constB];
    },
    add: function(vectA, vectB) {
      return [vectA[0] + vectB[0], vectA[1] + vectB[1], vectA[2] + vectB[2]];
    },
    subtract: function(vectA, vectB) {
      return [vectA[0] - vectB[0], vectA[1] - vectB[1], vectA[2] - vectB[2]];
    },
    equal: function(a, b) {
      var epsilon = 0.0000001;
      if ((a === undefined) && (b === undefined)) {
        return true;
      }
      if ((a === undefined) || (b === undefined)) {
        return false;
      }
      return (Math.abs(a[0] - b[0]) < epsilon && Math.abs(a[1] - b[1]) < epsilon && Math.abs(a[2] - b[2]) < epsilon);
    },
  }; 
  var mat4 = {
    multiply: function (m1, m2) {
      var mOut = [];
      mOut[0] = m2[0] * m1[0] + m2[4] * m1[1] + m2[8] * m1[2] + m2[12] * m1[3];
      mOut[1] = m2[1] * m1[0] + m2[5] * m1[1] + m2[9] * m1[2] + m2[13] * m1[3];
      mOut[2] = m2[2] * m1[0] + m2[6] * m1[1] + m2[10] * m1[2] + m2[14] * m1[3];
      mOut[3] = m2[3] * m1[0] + m2[7] * m1[1] + m2[11] * m1[2] + m2[15] * m1[3];
      mOut[4] = m2[0] * m1[4] + m2[4] * m1[5] + m2[8] * m1[6] + m2[12] * m1[7];
      mOut[5] = m2[1] * m1[4] + m2[5] * m1[5] + m2[9] * m1[6] + m2[13] * m1[7];
      mOut[6] = m2[2] * m1[4] + m2[6] * m1[5] + m2[10] * m1[6] + m2[14] * m1[7];
      mOut[7] = m2[3] * m1[4] + m2[7] * m1[5] + m2[11] * m1[6] + m2[15] * m1[7];
      mOut[8] = m2[0] * m1[8] + m2[4] * m1[9] + m2[8] * m1[10] + m2[12] * m1[11];
      mOut[9] = m2[1] * m1[8] + m2[5] * m1[9] + m2[9] * m1[10] + m2[13] * m1[11];
      mOut[10] = m2[2] * m1[8] + m2[6] * m1[9] + m2[10] * m1[10] + m2[14] * m1[11];
      mOut[11] = m2[3] * m1[8] + m2[7] * m1[9] + m2[11] * m1[10] + m2[15] * m1[11];
      mOut[12] = m2[0] * m1[12] + m2[4] * m1[13] + m2[8] * m1[14] + m2[12] * m1[15];
      mOut[13] = m2[1] * m1[12] + m2[5] * m1[13] + m2[9] * m1[14] + m2[13] * m1[15];
      mOut[14] = m2[2] * m1[12] + m2[6] * m1[13] + m2[10] * m1[14] + m2[14] * m1[15];
      mOut[15] = m2[3] * m1[12] + m2[7] * m1[13] + m2[11] * m1[14] + m2[15] * m1[15];
      return mOut;
    },
    vec4_multiply: function (m1, m2) {
      var mOut = [];
      mOut[0] = m2[0] * m1[0] + m2[4] * m1[1] + m2[8] * m1[2] + m2[12] * m1[3];
      mOut[1] = m2[1] * m1[0] + m2[5] * m1[1] + m2[9] * m1[2] + m2[13] * m1[3];
      mOut[2] = m2[2] * m1[0] + m2[6] * m1[1] + m2[10] * m1[2] + m2[14] * m1[3];
      mOut[3] = m2[3] * m1[0] + m2[7] * m1[1] + m2[11] * m1[2] + m2[15] * m1[3];
      return mOut;
    },
    vec3_multiply: function (m1, m2) {
      var mOut = [];
      mOut[0] = m2[0] * m1[0] + m2[4] * m1[1] + m2[8] * m1[2] + m2[12];
      mOut[1] = m2[1] * m1[0] + m2[5] * m1[1] + m2[9] * m1[2] + m2[13];
      mOut[2] = m2[2] * m1[0] + m2[6] * m1[1] + m2[10] * m1[2] + m2[14];
      return mOut;
    },
    perspective: function (fovy, aspect, near, far) {
      var yFac = Math.tan(fovy * M_PI / 360.0);
      var xFac = yFac * aspect;
      return [1.0 / xFac, 0, 0, 0, 0, 1.0 / yFac, 0, 0, 0, 0, -(far + near) / (far - near), -1, 0, 0, -(2.0 * far * near) / (far - near), 0];
    },
    determinant: function (m) {
      var a0 = m[0] * m[5] - m[1] * m[4];
      var a1 = m[0] * m[6] - m[2] * m[4];
      var a2 = m[0] * m[7] - m[3] * m[4];
      var a3 = m[1] * m[6] - m[2] * m[5];
      var a4 = m[1] * m[7] - m[3] * m[5];
      var a5 = m[2] * m[7] - m[3] * m[6];
      var b0 = m[8] * m[13] - m[9] * m[12];
      var b1 = m[8] * m[14] - m[10] * m[12];
      var b2 = m[8] * m[15] - m[11] * m[12];
      var b3 = m[9] * m[14] - m[10] * m[13];
      var b4 = m[9] * m[15] - m[11] * m[13];
      var b5 = m[10] * m[15] - m[11] * m[14];
      var det = a0 * b5 - a1 * b4 + a2 * b3 + a3 * b2 - a4 * b1 + a5 * b0;
      return det;
    },
    transpose: function (m) {
      return [m[0], m[4], m[8], m[12], m[1], m[5], m[9], m[13], m[2], m[6], m[10], m[14], m[3], m[7], m[11], m[15]];
    },
    inverse: function (m) {
      var a0 = m[0] * m[5] - m[1] * m[4];
      var a1 = m[0] * m[6] - m[2] * m[4];
      var a2 = m[0] * m[7] - m[3] * m[4];
      var a3 = m[1] * m[6] - m[2] * m[5];
      var a4 = m[1] * m[7] - m[3] * m[5];
      var a5 = m[2] * m[7] - m[3] * m[6];
      var b0 = m[8] * m[13] - m[9] * m[12];
      var b1 = m[8] * m[14] - m[10] * m[12];
      var b2 = m[8] * m[15] - m[11] * m[12];
      var b3 = m[9] * m[14] - m[10] * m[13];
      var b4 = m[9] * m[15] - m[11] * m[13];
      var b5 = m[10] * m[15] - m[11] * m[14];
      var determinant = a0 * b5 - a1 * b4 + a2 * b3 + a3 * b2 - a4 * b1 + a5 * b0;
      if (determinant != 0) {
        var m_inv = [];
        m_inv[0] = 0 + m[5] * b5 - m[6] * b4 + m[7] * b3;
        m_inv[4] = 0 - m[4] * b5 + m[6] * b2 - m[7] * b1;
        m_inv[8] = 0 + m[4] * b4 - m[5] * b2 + m[7] * b0;
        m_inv[12] = 0 - m[4] * b3 + m[5] * b1 - m[6] * b0;
        m_inv[1] = 0 - m[1] * b5 + m[2] * b4 - m[3] * b3;
        m_inv[5] = 0 + m[0] * b5 - m[2] * b2 + m[3] * b1;
        m_inv[9] = 0 - m[0] * b4 + m[1] * b2 - m[3] * b0;
        m_inv[13] = 0 + m[0] * b3 - m[1] * b1 + m[2] * b0;
        m_inv[2] = 0 + m[13] * a5 - m[14] * a4 + m[15] * a3;
        m_inv[6] = 0 - m[12] * a5 + m[14] * a2 - m[15] * a1;
        m_inv[10] = 0 + m[12] * a4 - m[13] * a2 + m[15] * a0;
        m_inv[14] = 0 - m[12] * a3 + m[13] * a1 - m[14] * a0;
        m_inv[3] = 0 - m[9] * a5 + m[10] * a4 - m[11] * a3;
        m_inv[7] = 0 + m[8] * a5 - m[10] * a2 + m[11] * a1;
        m_inv[11] = 0 - m[8] * a4 + m[9] * a2 - m[11] * a0;
        m_inv[15] = 0 + m[8] * a3 - m[9] * a1 + m[10] * a0;
        var inverse_det = 1.0 / determinant;
        m_inv[0] *= inverse_det;
        m_inv[1] *= inverse_det;
        m_inv[2] *= inverse_det;
        m_inv[3] *= inverse_det;
        m_inv[4] *= inverse_det;
        m_inv[5] *= inverse_det;
        m_inv[6] *= inverse_det;
        m_inv[7] *= inverse_det;
        m_inv[8] *= inverse_det;
        m_inv[9] *= inverse_det;
        m_inv[10] *= inverse_det;
        m_inv[11] *= inverse_det;
        m_inv[12] *= inverse_det;
        m_inv[13] *= inverse_det;
        m_inv[14] *= inverse_det;
        m_inv[15] *= inverse_det;
        return m_inv;
      }
      return null; 
    }
  }; //mat4

  // Transform library from CubicVR.js
  function Transform(mat) {
    return this.clearStack(mat);
  };

  Transform.prototype.setIdentity = function() {
    this.m_stack[this.c_stack] = this.getIdentity();
    if (this.valid === this.c_stack && this.c_stack) {
      this.valid--;
    }
    return this;
  };

  Transform.prototype.getIdentity = function() {
    return [1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0];
  };

  Transform.prototype.getResult = function() {
    if (!this.c_stack) {
      return this.m_stack[0];
    }

    if (this.valid !== this.c_stack) {
      if (this.valid > this.c_stack) {
        while (this.valid > this.c_stack + 1) {
          this.valid--;
          this.m_cache.pop();
        }
      }
      else {
        for (var i = this.valid; i <= this.c_stack; i++) {
          if (i === 0) {
            this.m_cache[0] = this.m_stack[0];
          }
          else {
            this.m_cache[i] = mat4.multiply(this.m_cache[i - 1], this.m_stack[i]);
          }
          this.valid++;
        } //for
      } //if
      this.result = this.m_cache[this.valid - 1];
    } //if
    return this.result;
  }; //getResult

  Transform.prototype.pushMatrix = function(m) {
    this.c_stack++;
    this.m_stack.push(m ? m : this.getIdentity());
    return this;
  }; //pushMatrix

  Transform.prototype.popMatrix = function() {
    if (this.c_stack === 0) {
      return;
    }
    this.c_stack--;
    return this;
  }; //popMatrix

  Transform.prototype.clearStack = function(init_mat) {
    this.m_stack = [];
    this.m_cache = [];
    this.c_stack = 0;
    this.valid = 0;
    this.result = null;

    if (init_mat !== undefined) {
      this.m_stack[0] = init_mat;
    } else {
      this.setIdentity();
    }

    return this;
  }; //clearStack

  Transform.prototype.translate = function(x, y, z) {
    if (typeof(x) === 'object') {
      return this.translate(x[0], x[1], x[2]);
    }
    var m = this.getIdentity();
    m[12] = x;
    m[13] = y;
    m[14] = z;
    this.m_stack[this.c_stack] = mat4.multiply(this.m_stack[this.c_stack], m);
    if (this.valid === this.c_stack && this.c_stack) {
      this.valid--;
    }
    return this;
  }; //translate

  Transform.prototype.scale = function(x, y, z) {
    if (typeof(x) === 'object') {
      return this.scale(x[0], x[1], x[2]);
    }
    var m = this.getIdentity();
    m[0] = x;
    m[5] = y;
    m[10] = z;
    this.m_stack[this.c_stack] = mat4.multiply(this.m_stack[this.c_stack], m);
    if (this.valid === this.c_stack && this.c_stack) {
      this.valid--;
    }
    return this;
  }; //scale

  Transform.prototype.rotate = function(ang, x, y, z) {
    if (typeof(ang) === 'object') {
      this.rotate(ang[0], 1, 0, 0);
      this.rotate(ang[1], 0, 1, 0);
      this.rotate(ang[2], 0, 0, 1);
      return this;
    }
    var sAng, cAng;
    if (x || y || z) {
      sAng = Math.sin(-ang * (M_PI / 180.0));
      cAng = Math.cos(-ang * (M_PI / 180.0));
    }
    if (z) {
      var Z_ROT = this.getIdentity();
      Z_ROT[0] = cAng * z;
      Z_ROT[4] = sAng * z;
      Z_ROT[1] = -sAng * z;
      Z_ROT[5] = cAng * z;
      this.m_stack[this.c_stack] = mat4.multiply(this.m_stack[this.c_stack], Z_ROT);
    }
    if (y) {
      var Y_ROT = this.getIdentity();
      Y_ROT[0] = cAng * y;
      Y_ROT[8] = -sAng * y;
      Y_ROT[2] = sAng * y;
      Y_ROT[10] = cAng * y;
      this.m_stack[this.c_stack] = mat4.multiply(this.m_stack[this.c_stack], Y_ROT);
    }
    if (x) {
      var X_ROT = this.getIdentity();
      X_ROT[5] = cAng * x;
      X_ROT[9] = sAng * x;
      X_ROT[6] = -sAng * x;
      X_ROT[10] = cAng * x;
      this.m_stack[this.c_stack] = mat4.multiply(this.m_stack[this.c_stack], X_ROT);
    }
    if (this.valid === this.c_stack && this.c_stack) {
      this.valid--;
    }
    return this;
  }; //rotate

  var WebGL2D = this.WebGL2D = function WebGL2D(canvas) {
    this.canvas         = canvas;
    this.gl             = undefined;
    this.fs             = undefined;
    this.vs             = undefined;
    this.shaderProgram  = undefined;
    this.fillStyle      = [0, 0, 0, 1]; // default black
    this.strokeStyle    = [0, 0, 0, 1]; // default black
    this.transform      = new Transform();

    // Store getContext function for later use
    canvas.$getContext = canvas.getContext;

    // Override getContext function with "webgl-2d" enabled version
    canvas.getContext = (function(gl2d) { 
      return function(context) {
        switch(context) {
          case "2d":
            return    gl2d.canvas.$getContext(context);

          case "webgl-2d":
            gl2d.gl = gl2d.canvas.$getContext("experimental-webgl");

            gl2d.initShaders();
            gl2d.addCanvas2DAPI();

            // Default white background
            gl2d.gl.clearColor(1, 1, 1, 1);
            gl2d.gl.clear(gl2d.gl.COLOR_BUFFER_BIT);

            return gl2d.gl;
        }
      };
    }(this));

    this.postInit();
  };

  // Enables WebGL2D on your canvas
  WebGL2D.enable = function(canvas) {
    return new WebGL2D(canvas);
  };

  // Fragment shader source
  var fsSource =
  '#ifdef GL_ES                                \n\
    precision highp float;                     \n\
    #endif                                     \n\
                                               \n\
    varying vec4 vColor;                       \n\
                                               \n\
    void main(void) {                          \n\
      gl_FragColor = vColor;                   \n\
    }                                          \n\
  ';

  // Vertex shader source
  var vsSource =
  'attribute vec3 aVertexPosition;             \n\
    attribute vec4 aVertexColor;               \n\
    uniform mat4 uOMatrix;                     \n\
                                               \n\
    varying vec4 vColor;                       \n\
                                               \n\
    void main(void) {                          \n\
      gl_Position = uOMatrix * vec4(aVertexPosition, 1.0);\n\
      vColor = aVertexColor;                   \n\
    }                                          \n\
  ';

  // Initialize fragment and vertex shaders
  WebGL2D.prototype.initShaders = function initShaders() {
    var gl = this.gl;

    this.fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(this.fs, fsSource);
    gl.compileShader(this.fs);

    this.vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(this.vs, vsSource);
    gl.compileShader(this.vs);

    this.shaderProgram = gl.createProgram();
    gl.attachShader(this.shaderProgram, this.vs);
    gl.attachShader(this.shaderProgram, this.fs);
    gl.linkProgram(this.shaderProgram);

    gl.useProgram(this.shaderProgram);

    this.shaderProgram.vertexPositionAttribute = gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);

    this.shaderProgram.vertexColorAttribute = gl.getAttribLocation(this.shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(this.shaderProgram.vertexColorAttribute);

    this.shaderProgram.uOMatrix = gl.getUniformLocation(this.shaderProgram, 'uOMatrix');
  };

  // Maintains an array of all WebGL2D instances
  WebGL2D.instances = [];

  WebGL2D.prototype.postInit = function() {
    WebGL2D.instances.push(this);    
  };

  // Extends gl context with Canvas2D API
  WebGL2D.prototype.addCanvas2DAPI = function addCanvas2DAPI() {
    var gl2d = this,
        gl   = this.gl;

    // Converts rgb(a) color string to gl color array
    function colorStringToArray(colorString) {
      var glColor = colorString.replace(/[^\d.,]/g, "").split(",");
      glColor[0] /= 255; glColor[1] /= 255; glColor[2] /= 255;

      return glColor;
    }

    // Setter for fillStyle
    Object.defineProperty(gl, "fillStyle", {
      set: function(value) {
        gl2d.fillStyle = colorStringToArray(value); 
      }
    });

    // Setter for strokeStyle
    Object.defineProperty(gl, "strokeStyle", {
      set: function(value) {
        gl2d.strokeStyle = colorStringToArray(value); 
      }
    });

    var rectVertexPositionBuffer;
    var rectVertexColorBuffer;
    var rectVerts = new Float32Array([0,0,0, 0,1,0, 1,1,0, 1,0,0]);

    gl.translate = function translate(x, y) {
      gl2d.transform.translate([x, -y, 0]);
    }; //translate

    gl.rotate = function rotate(a) {
      gl2d.transform.rotate([0, 0, a]);
    }; //rotate

    gl.scale = function scale(x, y) {
      gl2d.transform.scale([x, y, 0]);
    }; //scale

    gl.fillRect = function fillRect(x, y, width, height) {
      // for now just set the background color to the fillStyle
      //this.clearColor.apply(this, gl2d.fillStyle);
      //this.clear(this.COLOR_BUFFER_BIT);
      
      rectVertexPositionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, rectVertexPositionBuffer);

      gl.bufferData(gl.ARRAY_BUFFER, rectVerts, gl.STATIC_DRAW);

      rectVertexColorBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, rectVertexColorBuffer);

      
      var colors = [];

      for (var i = 0; i < 4; i++) {
        colors.push(gl2d.fillStyle[0]);
        colors.push(gl2d.fillStyle[1]);
        colors.push(gl2d.fillStyle[2]);
        colors.push(gl2d.fillStyle[3]);
      }

      var trans = gl2d.transform;
      trans.translate([x, -y, 0]);
      var tMatrix = trans.getResult();

      gl.uniformMatrix4fv(gl2d.shaderProgram.uOMatrix, false, new Float32Array(tMatrix));

      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

      gl.bindBuffer(gl.ARRAY_BUFFER, rectVertexPositionBuffer);
      gl.vertexAttribPointer(gl2d.shaderProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, rectVertexColorBuffer);
      gl.vertexAttribPointer(gl2d.shaderProgram.vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);

      gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    };
  };

}());


// Initializing the canvas:
var gl;
function initGL(canvas) {
        try {
            gl = canvas.getContext("experimental-webgl");
            gl.viewportWidth = canvas.width;
            gl.viewportHeight = canvas.height;
        } catch (e) {
        }
        if (!gl) {
            alert("Could not initialise WebGL ...");
        }
    }

// Defining function for fragment or vertex shader creation based on the content of an element of our main HTML page:
function getShader(gl, id) {
        var shaderScript = document.getElementById(id);
        if (!shaderScript) {
            return null;
        }
 
        var str = "";
        var k = shaderScript.firstChild;
        while (k) {
            if (k.nodeType == 3) {
                str += k.textContent;
            }
            k = k.nextSibling;
        }
 
        var shader;
        if (shaderScript.type == "x-shader/x-fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (shaderScript.type == "x-shader/x-vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            return null;
        }
 
        gl.shaderSource(shader, str);
        gl.compileShader(shader);
 
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }
 
        return shader;
    }

// Updating the shaders to add-on the vertexColor input attribute:
var shaderProgram;
function initShaders() {
        var fragmentShader = getShader(gl, "shader-fs");
        var vertexShader = getShader(gl, "shader-vs");
 
        shaderProgram = gl.createProgram();
 
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
 
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
        }
 
        gl.useProgram(shaderProgram);
 
        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

        shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
        gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
 
        shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    }

// Uniformazing the model-view & projection matrix
// using the references to the uniforms that represent our projection matrix and our model-view matrix that we got back in initShaders, we send WebGL the values from our JavaScript-style matrices
    var mvMatrix = mat4.create();
    var pMatrix = mat4.create();
    function setMatrixUniforms() {
            gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
            gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
        }

// Updating the buffers to add-on the vertexColorBuffer :
    var triangleVertexPositionBuffer;
    var triangleVertexColorBuffer;
 
function initBuffers() {
        triangleVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
        var vertices = [
               0.0,  4.0,  0.0,
               0.5,  0.0,  0.0,
               3.5,  0.0,  0.0,

               0.0,  4.0,  0.0,
               3.5,  0.0,  0.0,
               4.0,  4.0,  0.0,


               0.5,  0.0,  0.0,
               3.5,  0.0,  0.0,
               2.0, -0.5,  0.0
            ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        triangleVertexPositionBuffer.numItems = 9;
        triangleVertexPositionBuffer.itemSize = 3;

            triangleVertexColorBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
            colors = [];
            for (var i=0; i < 9; i++) {
                colors = colors.concat([0.5, 0.5, 1.0, 1.0]);
            }
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
            triangleVertexColorBuffer.numItems = 9;
            triangleVertexColorBuffer.itemSize = 4;

    }


// Defining degToRad():
    function degToRad(degrees) {
        return degrees * Math.PI / 180;
    }

// Defining mvMatrixStack:
var mvMatrixStack = [];

// Defining mvPushMatrix():
function mvPushMatrix() {
        var copy = mat4.create();
        mat4.set(mvMatrix, copy);
        mvMatrixStack.push(copy);
    }

// Defining mvPopMatrix():
function mvPopMatrix() {
        if (mvMatrixStack.length == 0) {
            throw "Invalid popMatrix!";
        }
        mvMatrix = mvMatrixStack.pop();
    }

// Updating drawScene()
// mvPushMatrix stores the state of the model-view matrix before you start drawing the robot, and restoring it afterwards
// Applying rotation to the current model-view matrix with mat4.rotate such as :
// . 1rst arg.:
// . 2nd arg.:
// . 3rd arg.:
// mvPopMatrix gets rid of the current matrix, takes one from the top of the stack, and restores it
var rTri = 0;
function drawScene() {
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        mat4.perspective(100, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix); // ((x,y),z)
 
        mat4.identity(mvMatrix);

        mat4.translate(mvMatrix, [-2.0, 0.0, -5.0]); // (x,y,z)

        mvPushMatrix();
        mat4.rotate(mvMatrix, degToRad(rTri), [0, 1, 0]);

        gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, triangleVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

        setMatrixUniforms();
        gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);
        
        mvPopMatrix();
 
    }


// Defining animate():
    var lastTime = 0;
    function animate() {
        var timeNow = new Date().getTime();
        if (lastTime != 0) {
            var elapsed = timeNow - lastTime;
 
            rTri += (90 * elapsed) / 1000.0;
        }
        lastTime = timeNow;
    }

//Defining tick():
// Google utils function that gives us a browser-independent way of asking the browser to call us back next time it wants to repaint the WebGL scene
//
//
function tick() {
        requestAnimFrame(tick);
        drawScene();
        animate();
    }

// Initiliazing the webgl container:
function webGLStart() {
        var canvas = document.getElementById("webglcanvas");
        initGL(canvas);
        initShaders();
        initBuffers();
        
        // Prior to drawing the scene , clear color
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
 
        tick();
    }


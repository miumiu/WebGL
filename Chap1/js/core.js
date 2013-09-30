


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

    // Defining function for fragment or vertex shader creation based on a DOM id of an element of our main HTML page:
    //
    //
    //
    //
    //
    //
    //
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

    // Initialiazing the shaders:
    // Getting :
    // . a “fragment shader”
    // . and a “vertex shader”
    // Creating a webgl shader program
    // Attaching a fragment and a vertex shader to the shader program
    // Linking the shader program to the main gl container in the global script
    // Check if a shader program has been linked to the gl container
    // Making the gl container use the shader program
    // Define an “attribute” to the shader program, which it stores in a new field on the program object called vertexPositionAttribute
    // Setting the values of the attribute in type of an Array
    // Get locations of uniform variables associated to the shader program
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

    // Initializing the buffers:
    // Indicating to WebGL that any following operations that act on buffers should use the one we specify
    // Defining our vertex positions as a JavaScript list
    // Creating a Float32Array object based on our JavaScript list, and tell WebGL to use it to fill the current buffer, which is of course our *VertexPositionBuffer
    // Defining the buffer object properties
    var triangleVertexPositionBuffer;
     
    function initBuffers() {
            triangleVertexPositionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
            var vertices = [
               1.0,  1.0,  0.0,
               1.0,  0.0,  0.0,
               4.0,  0.5,  0.0,
               1.0,  1.0,  0.0,
               1.0,  0.0,  0.0,
              -4.0,  0.5,  0.0
            ];
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
            triangleVertexPositionBuffer.numItems = 6;
            triangleVertexPositionBuffer.itemSize = 3;
    }


    // Initialization of scene drawing:
    //
    // Clearing the canvas prior to drawing on it
    // Defining the perspective of the scene where:
    // . Vertical field of view: 45°C ((x,y) , z)
    // . Width-to-height ratio of our canvas
    // . units minimum to our viewpoint
    // . units maximum to our viewpoint
    // .
    // Initializing the model-view matrix
    // Translating the scene’s perspective for each object
    // Calling on our buffers
    // Pushing each of our model-view matrix & its transformations processing from the Javascript engine to the graphic card
    // Drawing for each object
    function drawScene() {
            gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            mat4.perspective(100, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
     
            mat4.identity(mvMatrix);

            mat4.translate(mvMatrix, [0, 0.0, -5.0]); // (x,y,z)
            gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
            gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
            setMatrixUniforms();
            gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);
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
     
            drawScene();
    }


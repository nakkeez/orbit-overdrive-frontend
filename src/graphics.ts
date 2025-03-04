import vertexSource from "./shaders/vertexShader.ts";
import fragmentSource from "./shaders/fragmentShader.ts";

/**
 * Sets up a WebGL context, compiles shaders, and draws graphics to the canvas.
 */
export class Graphics {
  private gl: WebGLRenderingContext;
  private program?: WebGLProgram;
  private positionAttributeLocation!: number;
  private colorUniformLocation!: WebGLUniformLocation | null;
  private positionBuffer!: WebGLBuffer | null;
  private startingPosition: number[] = [-0.05, 0.0, 0.0, 0.1, 0.05, 0.0];
  private positions: Map<string, number[]>;

  /**
   * Creates a Graphics instance and initializes the WebGL context.
   * @param gl - WebGL rendering context to draw on
   */
  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
    this.positions = new Map<string, number[]>();
    this.init();
  }

  /**
   * Initializes the WebGL context, compiles shaders, and sets up the program.
   * @private
   */
  private init() {
    // Set canvas to black background for debugging
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    // Compile shaders
    let vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexSource);
    let fragmentShader = this.createShader(
      this.gl.FRAGMENT_SHADER,
      fragmentSource
    );
    if (!vertexShader || !fragmentShader) {
      return;
    }

    // Link shaders into a program
    this.program = this.createProgram(vertexShader, fragmentShader);
    if (!this.program) {
      return;
    }

    this.positionAttributeLocation = this.gl.getAttribLocation(
      this.program,
      "a_position"
    );
    this.colorUniformLocation = this.gl.getUniformLocation(
      this.program,
      "u_color"
    );

    this.positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
  }

  /**
   * Updates the triangle's position based on the given x and y offsets.
   * @param id - The ID of the triangle to update
   * @param xOffset - The offset along the x-axis
   * @param yOffset - The offset along the y-axis
   * @public
   */
  public updateTrianglePosition(id: string, xOffset: number, yOffset: number) {
    const updatedPosition: number[] = [];
    for (let i = 0; i < this.startingPosition.length; i += 2) {
      const x = this.startingPosition[i] + xOffset;
      const y = this.startingPosition[i + 1] + yOffset;
      updatedPosition.push(x, y);
    }
    this.positions.set(id, updatedPosition);
  }

  /**
   * Removes a triangle from the canvas based on its ID.
   * @param id - The ID of the triangle to remove
   * @public
   */
  public removeTriangle(id: string) {
    this.positions.delete(id);
  }

  /**
   * Draws content to the canvas. This method is called recursively to create an animation loop.
   * @public
   */
  public drawScene() {
    if (this.gl === null || this.gl === undefined || this.program === undefined)
      return;

    this.resizeCanvasToDisplaySize(this.gl.canvas as HTMLCanvasElement);
    // tell WebGL how to convert clip space to pixels
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

    this.gl.useProgram(this.program);

    // Clear the canvas
    this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    this.gl.enableVertexAttribArray(this.positionAttributeLocation);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);

    this.positions.forEach((position) => {
      this.drawTriangle(position);
    });
  }

  /**
   * Sets the position buffer with the given points and draws a triangle.
   * @param points - An array of x,y coordinates describing the triangle's vertices
   * @private
   */
  private drawTriangle(points: number[]) {
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(points),
      this.gl.STATIC_DRAW
    );
    // Describe how the attribute can get the data out of positionBuffer
    this.gl.vertexAttribPointer(
      this.positionAttributeLocation,
      2, // 2 components per iteration
      this.gl.FLOAT, // the data is 32bit floats
      false, // don't normalize the data
      0, // 0 = move forward size * sizeof(type) each iteration to get the next position
      0 // start at the beginning of the buffer
    );
    // Set color
    this.gl.uniform4f(this.colorUniformLocation, 0.0, 0.3, 1.0, 1.0);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
  }

  /**
   * Resizes the canvas to match the size it is displayed.
   * @param canvas - A canvas to be resized.
   * @returns Boolean indicating if the canvas needed to be resized.
   * @private
   */
  private resizeCanvasToDisplaySize(canvas: HTMLCanvasElement) {
    const dpr = window.devicePixelRatio;
    const { width, height } = canvas.getBoundingClientRect();
    const displayWidth = Math.round(width * dpr);
    const displayHeight = Math.round(height * dpr);

    const needResize =
      canvas.width !== displayWidth || canvas.height !== displayHeight;

    if (needResize) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
    }
    return needResize;
  }

  /**
   * Creates and compiles a shader of a given type from a string of GLSL source code.
   * @param type - The type of shader (vertex or fragment)
   * @param source - The GLSL source code for the shader
   * @returns A compiled WebGLShader object or undefined if failed
   * @private
   */
  private createShader(type: number, source: string) {
    let shader = this.gl.createShader(type);
    if (shader == null) {
      this.gl.deleteShader(shader);
      return;
    }
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    let success = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);
    if (success) {
      return shader;
    }

    console.log(this.gl.getShaderInfoLog(shader));
    this.gl.deleteShader(shader);
  }

  /**
   * Creates a WebGLProgram by linking together a vertex and fragment shader.
   * @param vertexShader - The vertex shader to attach
   * @param fragmentShader - The fragment shader to attach
   * @returns A linked WebGLProgram object or undefined if failed
   * @private
   */
  private createProgram(
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
  ) {
    let program = this.gl.createProgram();
    if (program === null) return;

    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);
    let success = this.gl.getProgramParameter(program, this.gl.LINK_STATUS);
    if (success) {
      return program;
    }

    console.log(this.gl.getProgramInfoLog(program));
    this.gl.deleteProgram(program);
  }
}

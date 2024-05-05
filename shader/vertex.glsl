uniform float time;
varying vec2 vUv;
varying vec4 vPosition;
uniform vec2 pixels;
varying vec2 mandelbrot;
varying float it;


void main() {
  vUv = uv;

  vPosition = modelViewMatrix * vec4( position, 1.0 );
  gl_Position = projectionMatrix * vPosition;
}
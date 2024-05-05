uniform float time;
uniform float progress;
uniform sampler2D texture1;
uniform sampler2D texture2;
uniform vec4 resolution;
varying vec2 vUv;
varying vec4 vPosition;

float map(
  float n,
  float fromStart,
  float fromEnd,
  float toStart,
  float toEnd
) {
  return toStart + ((n - fromStart) / fromEnd - fromStart) * (toEnd - toStart);
}

void main()	{
  float unitTime = abs(sin(time * 0.05));
	unitTime *= unitTime;
	vec2 mandelbrotX = vec2(-2.0, 2.0);
	vec2 mandelbrotY = vec2(-1.12, 1.12);
  float unitX = map(vUv.y, 0.0, 1.0, mandelbrotX.x, mandelbrotX.y);
	float unitY = map(vUv.x, 0.0, 1.0, mandelbrotY.x, mandelbrotY.y);

	float xr = 0.0;
	float yi = 0.0;
	float it = 0.0;
	const int maxIterations = 200;

	for (int n = 0; n <= maxIterations; n++) {
	  float xr_temp = pow(xr * xr, 10. * (1. - unitTime)) - pow(yi * yi, 10. * unitTime) + unitX;
	  xr = xr_temp;
	  yi = 2.0 * xr * yi + unitY;
		it++;
		if (xr * xr + yi * yi > 4.) {
			break;
		}
	}

	float xe = map(xr, mandelbrotX.x, mandelbrotX.y, 0.0, 1.0);
	float ye = map(yi, mandelbrotY.x, mandelbrotY.y, 0.0, 1.0);

	float color = (1.-ye) / (1.-xe);
	gl_FragColor = vec4(vec3(color), 1.);
}
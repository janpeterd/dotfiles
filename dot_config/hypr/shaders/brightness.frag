precision mediump float;
varying vec2 v_texcoord;
uniform sampler2D tex;

#define BRIGHTNESS 0.6;

void main() {
  vec3 color = texture2D(tex, v_texcoord).rgb;
  color = color * BRIGHTNESS;

  gl_FragColor = vec4(color, 1.0);
}

// vim: ft=glsl

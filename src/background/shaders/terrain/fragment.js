const fragmentShader = /*glsl*/`
uniform sampler2D uTexture;
uniform float uTextureFrequency;

varying float vElevation;
varying vec2 vUv;


vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

//	Classic Perlin 2D Noise 
//	by Stefan Gustavson
//
vec2 fade(vec2 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

float cnoise(vec2 P){
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;
  vec4 i = permute(permute(ix) + iy);
  vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;
  vec2 g00 = vec2(gx.x,gy.x);
  vec2 g10 = vec2(gx.y,gy.y);
  vec2 g01 = vec2(gx.z,gy.z);
  vec2 g11 = vec2(gx.w,gy.w);
  vec4 norm = 1.79284291400159 - 0.85373472095314 * 
    vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
  g00 *= norm.x;
  g01 *= norm.y;
  g10 *= norm.z;
  g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  return 2.3 * n_xy;
}


vec3 hslTorgb(in vec3 c)
{
    vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0,0.0,1.0);

    return c.z + c.y*(rgb-0.5)*(1.0-abs(2.0*c.z-1.0));
}

vec3 getRainbowColor()
{
    float hue = cnoise(vec2(vUv*8.0));
    vec3 hslColor = vec3(hue,0.6,0.7);
    vec3 rainbowColor = hslTorgb(hslColor);
    return rainbowColor;
}

void main()
{
    vec3 uColor = vec3(1.0,1.0,1.0);
    vec3 rainbowColor = getRainbowColor();
    
    vec4 textureColor = texture2D(uTexture,vec2(0.0, vElevation*uTextureFrequency));
    // float elevation = vElevation+0.5;

    // float alpha = mod(vElevation*10.0,1.0);
    // alpha = step(0.95,alpha);
    
    // gl_FragColor = vec4(1.0,1.0,1.0,alpha);
    vec3 color = mix(uColor,rainbowColor,textureColor.r);
    gl_FragColor = vec4(color,textureColor.a);
}
`
export default fragmentShader
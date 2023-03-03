float sdCappedTorus(in vec3 p,in vec2 sc,in float ra,in float rb)
{
  p.x=abs(p.x);
  float k=(sc.y*p.x>sc.x*p.y)?dot(p.xy,sc):length(p.xy);
  return sqrt(dot(p,p)+ra*ra-2.*ra*k)-rb;
}
vec2 map(vec3 p){
  float angles[10]=float[10](0.,.5,1.4,2.9,4.5,.8,2.,1.,3.,5.5);
  vec3 positions[10]=vec3[10](vec3(.2,0.,0.),vec3(0.,.3,0.),vec3(-.3,0.,0.),vec3(0.,0.,.25),vec3(0.,-.2,0.),
  vec3(.2,.2,0.),vec3(.1,.3,0.),vec3(-.3,.1,.2),vec3(-.3,0.,.25),vec3(.1,-.2,-.1));
  float k=10000.;
  float j=0.;
  for(int i=0;i<10;i++){
    
    vec3 q=p+positions[i];
    
    float a=angles[i];
    q.xz*=mat2(cos(a),sin(a),-sin(a),cos(a));
    a=iTime*2.-float(i*3);
    q.xy*=mat2(cos(a),sin(a),-sin(a),cos(a));
    
    float an=sin(.5);
    float an2=cos(.5);
    vec2 c=vec2(sin(an),cos(an));
    float dk=sdCappedTorus(q,c,.4,.0025);
    if(dk<k){
      k=dk;
      j=mod(float(i),3.);
    }
    
  }
  
  float d=length(p)-.5;
  float y=.1;
  if(k<d){
    y=j+1.2;
  }
  
  d=min(d,k);
  return vec2(d,y);
}

vec2 ray(vec3 ro,vec3 rd){
  
  float t;
  vec2 h;
  vec3 p;
  for(int i=0;i<200;i++){
    p=ro+rd*t;
    h=map(p);
    if(h.x<.0001)break;
    t+=h.x;
    if(t>20.)break;
    
  }
  if(t>20.)t=-1.;
  return vec2(t,h.y);
  
}

float softshadow(in vec3 ro,in vec3 rd,float mint,float maxt,float k)
{
  float res=1.;
  float ph=1e20;
  for(float t=mint;t<maxt;)
  {
    float h=map(ro+rd*t).x;
    if(h<.001)
    return 0.;
    float y=h*h/(2.*ph);
    float d=sqrt(h*h-y*y);
    res=min(res,k*d/max(0.,t-y));
    ph=h;
    t+=h;
  }
  return res;
}

float calcOcclusion(in vec3 pos,in vec3 nor)
{
  float occ=0.;
  float sca=1.;
  for(int i=0;i<5;i++)
  {
    float h=.01+.11*float(i)/4.;
    vec3 opos=pos+h*nor;
    float d=map(opos).x;
    occ+=(h-d)*sca;
    sca*=.95;
    
  }
  return clamp(1.-2.*occ,0.,1.);
}

vec3 calcNorm(vec3 p){
  const float eps=.0001;
  vec4 n=vec4(0.);
  for(int i=min(iFrame,0);i<4;i++)
  {
    vec4 s=vec4(p,0.);
    s[i]+=eps;
    n[i]=map(s.xyz).x;
  }
  return normalize(n.xyz-n.w);
}

vec3 render(vec3 ro,vec3 rd){
  vec2 t=ray(ro,rd);
  vec3 sk=vec3(1.-rd.y,1.-rd.y,1.);
  
  vec3 p1=ro+rd*t.x;
  
  vec3 col=smoothstep(2.45,2.5,length(p1))*vec3(1.);
  if(t.x>0.){
    
    vec3 p=ro+rd*t.x;
    vec3 n=calcNorm(p);
    if(t.y>3.){
      col=vec3(0.,1.,0.);
      
    }
    else if(t.y>2.){
      col=vec3(1.,1.,1.);
      
    }
    else if(t.y>1.){
      col=vec3(1.,0.,0.);
      
    }
    else if(t.y>0.){
      vec3 q=n;
      
      vec3 sun=normalize(vec3(.2,5.,.4));
      vec3 r=reflect(-sun,n);
      vec3 spec=pow(max(0.,dot(r,-rd)),32.)*vec3(1.);
      
      vec2 longitudeLatitude=vec2(
        (atan(q.y,q.x)/3.1415926+1.)*.5,
        1.-acos(q.z)/3.1415926);
        
        float land=1.-smoothstep(.6,.4,texture(iChannel0,longitudeLatitude).y);
        col=mix(vec3(.5,.5,1.)*.5,vec3(.1,.9,.1),land)+spec*.7;
      }
      
    }
    
    return col;
    
  }
  
  void mainImage(out vec4 fragColor,in vec2 fragCoord)
  {
    vec2 uv=(2.*fragCoord-iResolution.xy)/iResolution.y;
    
    float an_x=10.*-iMouse.x/iResolution.x;
    float an_y=10.*-iMouse.y/iResolution.y;
    //an_x=0.;
    an_x+=sin(iTime/20.)/5.-.45;
    vec3 ta=vec3(0.,0.,0.);
    float off=1.5;
    vec3 ro=ta+vec3(sin(an_x)*off,0.,cos(an_x)*off);
    
    vec3 ww=normalize(ta-ro);
    
    vec3 uu=normalize(cross(ww,vec3(0.,1.,0.)));
    
    vec3 vv=normalize(cross(uu,ww));
    
    vec3 rd=normalize(uv.x*uu+uv.y*vv+1.5*ww);
    
    vec3 col=render(ro,rd);
    
    fragColor=vec4(col,1.);
  }
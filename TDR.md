---
layout: inner
title: Tiled Deferred Rendering
permalink: /TDR/
---
# Tiled Deferred Rendering


<iframe width="100%" height="412px" src="https://www.youtube.com/embed/CmAil1rzkHs" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
<iframe width="100%" height="412px" src="https://www.youtube.com/embed/UIVkuDuI8bI" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
### **Here's a short summary of my implementation:**

First I render all the Geometry to a G-Buffer using these two vertex and fragment shader:

#### **Vertex Shader:**
<details markdown="1">
  <summary style='cursor: pointer;'>show me the code!</summary>
{%highlight c++%}
#version 430 core

layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 normal;
layout (location = 2) in vec2 texCoord;
layout (location = 3) in vec3 tangent;
layout (location = 4) in vec3 bitangent;

layout (std140) uniform Matrices
{
    mat4 proj;
    mat4 view;
};

layout (std140, binding=8) uniform transformMatrices
{
    mat4 transform[1000];    
};

uniform int t_index;
out vec3 Normal;
out vec4 FragPos;
out vec2 uvCoord;
out mat3 TBN;
void main()
{
    mat4 model=transform[t_index];
    gl_Position =proj*view*model*vec4(aPos, 1.0);

    FragPos = model* vec4(aPos, 1.0);


   vec3 T = normalize(vec3(model * vec4(tangent,   0.0)));
   vec3 B = normalize(vec3(model * vec4(bitangent, 0.0)));
   vec3 N = normalize(mat3(transpose(inverse(model))) * normal);
   TBN = mat3(T, B, N);
    Normal=N;
    uvCoord=texCoord;
}
{%endhighlight%}

</details>
#### **Fragment Shader:**
<details markdown="1">
  <summary style='cursor: pointer;'>show me the code!</summary>
{%highlight c++%}
#version 430 core
layout (location = 0) out vec4 gAlbedoRougness;
layout (location = 1) out vec4 gPosition;
layout (location = 2) out vec4 gNormal;
//r:metallic g:AO
layout (location = 3) out vec4 gPBR;

in vec2 uvCoord;
in vec4 FragPos;
in vec3 Normal;
in mat3 TBN;
struct Material
{
    sampler2D diffuse;
    sampler2D roughness;
    sampler2D metallic;
    sampler2D normal;
    sampler2D ambientocclusion;
    vec3 ambientColor;
    vec3 diffuseColor;
    vec3 specularColor;
    float shininess;

};
uniform float noAO,noMetallic,noRoughness,noNormal;
uniform Material material;
uniform float metallic,roughness;
uniform float ambientocclusion;
uniform float normalStrength;

void main()
{    
    // store the fragment position vector in the first gbuffer texture
    gPosition = FragPos;
    float a=texture(material.diffuse,uvCoord).a;
    if(a<0.5)
        discard;
    if(noNormal<1.0f)
    {
        vec3 nMap=texture(material.normal,uvCoord).rgb;
        nMap=normalize(nMap*2.0-1.0);
        nMap.xy*=normalStrength;
        if(normalStrength==0)
            nMap=vec3(0,0,1);
        // also store the per-fragment normals into the gbuffer
        //gNormal = normalize(Normal);
        gNormal = vec4(normalize(TBN*nMap),1);
    }
    else
        gNormal=vec4(normalize(TBN*vec3(0,0,1)),1);
    // and the diffuse per-fragment color
    gAlbedoRougness.rgb = texture(material.diffuse, uvCoord).rgb;
    // store roughness, metallic and ambient occlusion
    gAlbedoRougness.a=roughness;
    if(noRoughness<1.0f)
        gAlbedoRougness.a = texture(material.roughness, uvCoord).r;
    gPBR=vec4(metallic,ambientocclusion,0,0);
    if(noMetallic<1.0f)
        gPBR.r = texture(material.metallic, uvCoord).r;
    if(noAO<1.0f)
        gPBR.b =texture(material.ambientocclusion,uvCoord).r;

}  
{%endhighlight%}
</details>
After rendering everything to the G-Buffers, I then collect information of each point-lights in the scene into an array so that I can transfer that to an UBO (Uniform Buffer Object) to be later culled and processed inside the compute shader.

#### **Compute Shader:**

you can find the full compute shader [here](https://github.com/SudharsanZen/Akame/blob/main/Assets/Shaders/Deferred/Compute/defCal.comp){:class='link-class'}.

So for the culling and rendering part this is what I basically did:

  1.  Divide the whole G-Buffer into tiles with fixed sizes (size of each tile is 32x32 pixel).

  1.  For each tile, we then get the maximum and minimum depth value from the depth buffer which will be later used to create the tile's frustum.

  1.  Calculate tile corners, then using all the details we previously obtained to form the six planes that defines the tile's frustum.

  1.  Divide the culling work between each invocation in a local workgroup, so you basically give each invocation the exact number of point-lights to deal with, and the index of the point-light in the UBO to start from. So that particular invocation will cull all the point-lights in the inclusive range of [start,start+numberOfPointLights-1].

  1. Now in each invocation, we then cull their respective point-lights assigned to them and add their Indices to a common light-list array.

  1. Wait for all the invocations in a local workgroup to finish culling.

  1. Then for each pixel, go through the light-list array and calculate the final pixel value and store it in the output-buffer/texture.

<details markdown="1">
  <summary style='cursor: pointer;'>show me the code!</summary>
The comments explain most of what is happening in the code:
{%highlight c++%}
void main()
{

      /*----------------------------------------------------------------------------------------------------
      light index: it's the index of the light being added to the list of lights to be used after culling.
      The local workgroup divide the work of iterating througg all the lights and culling them.
      the light index is incremented atomically by the current invocation if the light is inside the frustum.

      this value may not exceed 800 or the max point light count.
      this value, by the end of the calculation per workgroup will be the count of point lights afer culling
      initialize the light index to zero.
      ------------------------------------------------------------------------------------------------------*/
      lightIndex=0;

      //current pixel
      ivec2 pixel = ivec2(gl_GlobalInvocationID.xy);
      uint loc=(gl_WorkGroupID.x+gl_WorkGroupID.y)%2;
      vec2 n=vec2(pixel)/vec2(width,height);

      //initialize depth value with current pixel's depth value
      float depthValue=texture(depBuffer,n).r;

      //convert the depthValue [0,1] to unsigned integer [0,MAX_UNSIGNED_INT_VALUE/0XFFFFFFFF]
      //we do this to compare minimum and maximum depth per workGroup
      //the minimum and maximum depth values are use to construct culling frustums
      uint depthInt=uint(depthValue*0xFFFFFFFF);

      //get the maximu and minum depth for the current tile
      atomicMax(maxDepth,depthInt);
      atomicMin(minDepth,depthInt);
      barrier();

      //transform the maxDepth back to normalized floating point value
      float maxD=float(maxDepth)/float(0xFFFFFFFF);

      //the tile's screen coordinates for the current workGroup
      uint minX=gl_WorkGroupID.x*TILE_DIM_X;
      uint minY=gl_WorkGroupID.y*TILE_DIM_Y;
      uint maxX=(gl_WorkGroupID.x+1)*TILE_DIM_X;
      uint maxY=(gl_WorkGroupID.y+1)*TILE_DIM_Y;

      //unprojecting the screen coordinates to the viewSpace
      vec4 tileCorners[4];

      //constants for converting screenSpace points to NDC
      float xC=2.0f/(float(width));
      float yC=2.0f/(float(height));

      /*------------------------------------------------------------------------------------------------
      convert the tile corner points to NDC coordinate and then unProject it to get viewSpace coordinate,
      Shown below is an intutive ¯\_(ツ)_/¯ picture of the tileCorners and their respective index
         y+
         |   3*-----*2
         |    *     *
         |   0*-----*1
         |______________ x+
      --------------------------------------------------------------------------------------------------*/

      //tiles corners on the farPlane
      tileCorners[0]=unProject(vec4(float(minX)*xC-1.0f,float(minY)*yC-1.0f,maxD,1.0f));
      tileCorners[1]=unProject(vec4(float(maxX)*xC-1.0f,float(minY)*yC-1.0f,maxD,1.0f));
      tileCorners[2]=unProject(vec4(float(maxX)*xC-1.0f,float(maxY)*yC-1.0f,maxD,1.0f));
      tileCorners[3]=unProject(vec4(float(minX)*xC-1.0f,float(maxY)*yC-1.0f,maxD,1.0f));

      //all six bounding frustum plane's normals
      vec4 frustum[6];

      //calculating bounding frustum normals
      for(int i=0;i<4;i++)
      {
            frustum[i]=createFrustumFromPoints(tileCorners[i],tileCorners[(i+1)%4],viewMat*vec4(viewPos,1));
      }

      //tiles corner on the near plane to calculate the near culling plane
      tileCorners[0]=unProject(vec4(float(minX)*xC-1.0f,float(minY)*yC-1.0f,0.1,1.0f));
      tileCorners[1]=unProject(vec4(float(maxX)*xC-1.0f,float(minY)*yC-1.0f,0.1,1.0f));
      tileCorners[2]=unProject(vec4(float(maxX)*xC-1.0f,float(maxY)*yC-1.0f,0.1,1.0f));
      tileCorners[3]=unProject(vec4(float(minX)*xC-1.0f,float(maxY)*yC-1.0f,0.1,1.0f));

      //creating the near culling frustum plane
      frustum[4]=createFrustumFromPoints(tileCorners[0],tileCorners[1],tileCorners[2]);

      //the number of point lights to process per invocation in local workgroup
      uint lightPerIndex=int(ceil(float(NUM_POINT_LIGHT)/float(TILE_DIM_X*TILE_DIM_Y)));
      //starting index of main point light buffer for the current invocation to calculate from
      uint startIndex=((gl_LocalInvocationID.x)+(gl_LocalInvocationID.y*TILE_DIM_Y))*lightPerIndex;

      //do the light culling and create lightList that has indices of un culled point lights from the point light buffer
      for(uint i=startIndex;i<startIndex+lightPerIndex && i< NUM_POINT_LIGHT;i++)
      {
            bool inside=true;
            for(uint j=0;j<5;j++)
            {
                  float d=getSignedDistanceFromPlane(frustum[j],(viewMat*ptLight[i].lightPose).xyz);

                  if(d<0 && abs(d)>ptLight[i].constants.w )
                  {
                        inside=false;
                        break;
                  }

            }
            if(inside)
            {
                  uint lindx= atomicAdd(lightIndex,1);
                  lightList[lindx]=i;
            }
      }

      /*------------------------------------------
      calling barriers to wait for all invocations
      of the current workgroup to finish calculating
      point light list for this workgroup.
      --------------------------------------------*/
      groupMemoryBarrier();
      barrier();

      /*----------------------------------------------------------------------
      do the remaining Lighting calculations
      -----------------------------------------------------------------------/
      /----------------------------------------------------------------------
      set the buffer value for the current invocation.this value will be used
      by most of the functions used for lighting or
      shadow calculations.
      -----------------------------------------------------------------------*/

      BufferPixelValues pV;

      pV.norm = vec4(normalize(imageLoad(normal,pixel).xyz),1);
      pV.FragPos=vec4(imageLoad(position,pixel).xyz,1);
      pV.roughness = imageLoad(albedoSpec,pixel).a;  
      pV.albedo=vec4(pow(imageLoad(albedoSpec,pixel).xyz,vec3(2.2f)),1);
      pV.metallic=imageLoad(PBR,pixel).r;
      pV.AO=imageLoad(PBR,pixel).g;

      vec3 result=vec3(0,0,0);

      for(uint i=0;i<lightIndex;i++)
      {
            result+=calcPointLight(ptLight[lightList[i]],pV);

      }

      for(uint i=0;i<NUM_DIR_LIGHT;i++)
      {
            float s=shadowCalculation(pV.FragPos);
            result+=calcDirecLight(DIR_L[i],pV,s);
      }  
      vec3 ambient = vec3(0.03) * pV.albedo.xyz *pV.AO;
      result = ambient + result;
      result=result/(result+vec3(1.0f));
      result=pow(result,vec3(1.0f/2));
      //store the final calculated pixel value to the output buffer
      imageStore(outTexture, pixel,vec4(result, 1.0));       
}
{%endhighlight%}
</details>

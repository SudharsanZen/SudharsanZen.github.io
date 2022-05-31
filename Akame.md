---
layout: inner
title: Akame
permalink: /Akame/
---
# Akame

**what is akame?**

Akame is both a framework (Akame-Core) and a game engine(Akame-Engine) for building interactive applications.
So to put it straight, these are the things you can do:

  * Use Akame-Core and ignore the Engine.
  * Use Akame-Core and Use the Engine as an IDE for editing the scene.
  * Use the engine like any other game engine.

At the time of writing, The engine part is not fully complete (not fully functional) and as a solo developer I am still working on it as you are reading this!

Here are the stuff the framework and engine currently offers:

## Akame ECS

The custom made Entity Component System (ECS) is the core component of both the framework and you guessed it, the engine! It's designed to be very fast and easy to use.
if you are interested in taking a look at it you can find it in the Akame's repo [here](https://github.com/SudharsanZen/Akame/tree/main/ECS){:class='link-class'}, it's a header only ECS implementation written leveraging the power of templates.

## Akame-core
Akame-core is the Graphics Framework part, it's designed to be simple to use but also to be flexible and easily extendable. Enough said, here's a sample code to create a sphere and a directional light using my engine:
<details markdown="1">
  <summary style='cursor: pointer;'>show me a small tutorial on working with your framework!</summary>
{% highlight c++ %}
/*before you do anything, don't forget to set the relative location (relative to your working directory) of the assets folder that contains all the shaders, engine assets and your assets as shown below*/
AssetManager::setAssetRoot("../../../../Assets/");
{% endhighlight %}

{% highlight c++ %}
//initializing a window (800 by 800 pixels wide)
Window window(800, 800, "testWindow");
if (!window.initialize())
{
  std::cout << "Can't init WINDOW";
  return -1;
}
{% endhighlight %}

{% highlight c++ %}
//initializing the scene object
Scene scene(window);
{% endhighlight %}

and now we are ready to create 'Entities' (directional light and sphere)

{% highlight c++ %}
/*-------------Creating Directional Light--------------*/
  //create an entity and get it's id
  Entity dir = scene.CreateEntity();
  //add 'Lights' and Transform Component to 'dir' entity
  scene.AddComponent<Transform>(dir);  
  Lights& d = scene.AddComponent<Lights>(dir);  
  //set the light's properties
  d.setType(LIGHT::DIRECTIONAL);
  d.setColor(1, 1, 1);
  d.setDirection(-90, 0, 0);
  d.setIntensity(3);
  d.setPointLightConst(1, 2, 10);
  d.ambientLigting(0.1f, 0.1f, 0.1f);
{% endhighlight %}

**Now here come's the part of creating a mesh (Sphere).
for an Entity to become a renderable mesh, we need to add three components to it:**
  * **Material**  : This component is an interface to select the desired Shaders registered in the [ShaderConf.XML](https://github.com/SudharsanZen/Akame/blob/main/Assets/Shaders/ShaderConf.XML){:class='link-class'} and set material-properties\Shader-Uniforms to be used.
  * **Transform** : This component is used to describe and modify the position and orientation of an Entity.
  * **Mesh**      : This component is used to transfer mesh/vertex data to the rendering System.

**step1:** creating the entity:
{% highlight c++ %}
  Entity sphere = scene.CreateEntity();
{% endhighlight %}
**step2:** creating a Material:
{%highlight c++%}
  std::string rootDir(AssetManager::getAssetRoot());

  Material rust1("DEFERRED");
  rust1.setTexture2D("material.diffuse", rootDir + "Media/pbr/rust1/diffuse.png");
  rust1.setTexture2D("material.roughness", rootDir + "Media/pbr/rust1/roughness.png");
  rust1.setTexture2D("material.normal", rootDir + "Media/pbr/rust1/normal.png");
  rust1.setTexture2D("material.metallic", rootDir + "Media/pbr/rust1/metallic.png");
  rust1.setValue("noAO", 1);
  rust1.setValue("ambientocclusion", 1);
  rust1.setValue("noMetallic", 0);
  rust1.setValue("normalStrength", 1);

{% endhighlight %}

**step3:** Add transform, mesh and material component to the entity
{% highlight c++ %}
  Mesh& sphere_mesh = scene.AddComponent<Mesh>(sphere);
  Transform& sphere_t = scene.AddComponent<Transform>(sphere);
  scene.AddComponent<Material>(sphere) = rust1;
{% endhighlight %}

**step4:** set Mesh data and transform parameters:

{% highlight c++ %}
sphere_t.SetGlobalScale(glm::vec3(2.0f));
sphere_t.SetGlobalPosition(glm::vec3(0,0.01,0));
//generateSphereVertices(num of latitude segments,num of longitude segments,radius)
sphere_mesh.CreateMesh(generateSphereVertices(32,32,2));
{% endhighlight %}

and that's it, we've create a renderable entity (The Sphere) and a light entity (The directional light)!

now finally we need to create the main loop and render stuff.
which can be done with a few lines of self-explanatory code as shown below:

{% highlight c++ %}
while (!window.closeWindow())
{
  flyCam(scene.cam, scene.getDeltaTime());
  scene.cam.setAspectRation((float)window.getBufferWidth() / (float)window.getBufferHeight());

  scene.clearBuffer();
    scene.Render();
  scene.swapBuffers();
}
{% endhighlight %}
**here's the final code:**
{%highlight c++%}
#include<iostream>
#include"Core/Engine.h"
#include"Core/Scene.h"

int main()
{

	AssetManager::setAssetRoot("../../../../Assets/");
	std::string rootDir(AssetManager::getAssetRoot());
	Window window(800, 800, "testWindow");
	if (!window.initialize())
	{
		std::cout << "Can't init WINDOW";
		return -1;
	}
	Scene scene(window);

	Entity dir = scene.CreateEntity();
	Lights& d = scene.AddComponent<Lights>(dir);
	scene.AddComponent<Transform>(dir);
	d.setType(LIGHT::DIRECTIONAL);
	d.setColor(1, 1, 1);
	d.setDirection(-90, 0, 0);
	d.setIntensity(3);
	d.setPointLightConst(1, 2, 10);
	d.ambientLigting(0.1f, 0.1f, 0.1f);



	Material rust1("DEFERRED");
	rust1.setTexture2D("material.diffuse", rootDir + "Media/pbr/rust1/diffuse.png");
	rust1.setTexture2D("material.roughness", rootDir + "Media/pbr/rust1/roughness.png");
	rust1.setTexture2D("material.normal", rootDir + "Media/pbr/rust1/normal.png");
	rust1.setTexture2D("material.metallic", rootDir + "Media/pbr/rust1/metallic.png");
	rust1.setValue("noAO", 1);
	rust1.setValue("ambientocclusion", 1);
	rust1.setValue("noMetallic", 0);
	rust1.setValue("normalStrength", 1);


	Entity sphere = scene.CreateEntity();
	Mesh& sphere_mesh = scene.AddComponent<Mesh>(sphere);
	sphere_mesh.CreateMesh(generateSphereVertices(32,32,2));
	Transform& sphere_t = scene.AddComponent<Transform>(sphere);
	sphere_t.SetGlobalScale(30.0f* glm::vec3(1));
	sphere_t.SetGlobalPosition(glm::vec3(0,0.01,0));
	scene.AddComponent<Material>(sphere) = rust1;

	while (!window.closeWindow())
	{
	 flyCam(scene.cam, scene.getDeltaTime());
	 scene.cam.setAspectRation((float)window.getBufferWidth() / (float)window.getBufferHeight());

	 scene.clearBuffer();
			scene.Render();
	 scene.swapBuffers();
	}

	return 0;
}

{%endhighlight %}
</details>
**results:**
<img class="img-responsive" src="/img/posts/sphere_dir.png" title="output">
*Note*: if you've copy pasted the code and ran it and endded up with a black screen it's probably because the camera is inside the large sphere we've created XD, so move the camera out with WASD keys and your mouse.




## Creating custom Materials, Shaders and Rendering pipeline:
In Akame, it's very possible to write your own shader, material and a rendering pipeline to handle all the renderable entities that use a particular shader/material.
To register a new Shader with Akame, find the [_ShaderConf.XML_](https://github.com/SudharsanZen/Akame/blob/main/Assets/Shaders/ShaderConf.XML){:class='link-class'} file in the Assets folder of Akame and add details describing your shaders.
<details markdown="1">
  <summary style='cursor: pointer;'>show me the examples!</summary>
_**Example:**_
let's say you have a fragment shader named "frag.frag" and a vertex shader named "vert.vert" that's in the [same folder](https://github.com/SudharsanZen/Akame/tree/main/Assets/Shaders){:class='link-class'} as the [ShaderConf.XML](https://github.com/SudharsanZen/Akame/blob/main/Assets/Shaders/ShaderConf.XML){:class='link-class'} file.
Then to register the shader under the name "MyNewShader", you add this to the ShaderConf.XML:
{%highlight XML%}
<Shader name="MyNewShader" queue="NULL">
    <Vertex path="vert.vert"/>
    <Fragment path="frag.frag"/>
</Shader>
{%endhighlight%}

And that's it, it's ready to be used from within the framework's Material component.
The Material component takes in the name of the shader as a string argument. So, to create an entity with Material using 'MyNewShader' you do:
{%highlight c++%}
  Material newMaterial("MyNewShader");

  ...set material paramters...

  scene.AddComponent<Material>(somRenderableEntity)=newMaterial;
{%endhighlight%}

**Creating a new shader/render pipeline for our new shader:**
if you feel like you need more control than what the Material Interface offers, you can go for a yourown shader/render pipeline. To do that, from within the framework you need to inherit from the ['ShaderRenderPipeline'](https://github.com/SudharsanZen/Akame/blob/main/AkameCore/Header%20Files/Rendering/System/ShaderRenderPipeline.h){:class='link-class'} class.

{%highlight c++%}
/*This class is a base class that provides the
*interface for overriding callbacks like
*pre-render and post-render actions for
*a particular shader.*/
class AKAME_API ShaderRenderPipeline
{
public:

	//called everytime the windows is resized
	virtual void WindowsResizeCallBacks(int height,int width){
	}

	//called just before the rendering of entities begins
	virtual void OnPreRender(std::shared_ptr<Shader> shader,RenderingSystem *rsys,Camera cam, unsigned int frameBuffer=0){
	}

	//called after rendering stuff
	virtual void OnPostRender(std::shared_ptr<Shader> shader,RenderingSystem *rsys, Camera cam, unsigned int frameBuffer=0){
	}
	//called before every time an entity is rendered
	virtual void OnEntityRender(std::shared_ptr<Shader> shader,std::shared_ptr<ECS> e,Camera cam,Entity eid){
	}

	//destructor
	virtual ~ShaderRenderPipeline(){
	}

};
{%endhighlight%}

**Example:**

{%highlight c++%}
class MyNewRenderPipeline :public ShaderRenderPipeline
{
public:

	AKAME_API void OnPreRender(std::shared_ptr<Shader> shader, RenderingSystem* rsys, Camera cam, unsigned int frameBuffer=0) override;
	AKAME_API void OnPostRender(std::shared_ptr<Shader> shader, RenderingSystem* rsys, Camera cam, unsigned int frameBuffer=0) override;
};

**then somewhere before the main loop and after initializing the scene, add your new render/shader pipeline to akame as shown below:**


ShaderManager::AttachShaderPipeline<MyNewRenderPipeline>("MyNewShader");

{%endhighlight%}
</details>

## Physics System
  The engine uses [NVIDIA-PhysX](https://github.com/NVIDIAGameWorks/PhysX){:class='link-class'} as it's physics engine.
  The engine provides an abstracted and easy to use Interface to the PhysX engine via the 'RigidBody3D' component.
  Here's a [sample-code](https://github.com/SudharsanZen/Akame/tree/main/Samples/Test){:class='link-class'} utilizing this component.
  And here's it's Visual demo:
  <iframe width="100%" height="412" src="https://www.youtube.com/embed/PHQd2YKL90E" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## C++ Scripting System
  The Akame-Engine provides a C++ Scripting+Behviour system for creating off-the-shelf components and modifying the framework's normal function.
  Its C++ Scripting+Behaviour system allows you to create VS-Projects, Compile and run code written in C++ at runtime. It basically exposes the whole Framework's API and you can do everything the framework does from within the C++ 'Scripts' (basically compiling and hot-loading DLLs at runtime).
  It also provides support for **Reflection in C++** which allows **Serailization** and **Showing member variables in the Inspector pannel's UI** for a better manual debugging and testing experience!

  **UI example:**

  {%highlight c++%}
  class DummyCamController:public Behaviour
  {
    Camera& m_cam;

    glm::vec3 pose;
    glm::vec3 angle;
    float fov;
    float far;

    public:

    //UI reflection
    AK_SHOW_IN_INSPECTOR
  	(
  			AK_ID_COMPX(pose)
  			AK_ID_COMPX(angle)
  			AK_ID_COMPX(fov)
  			AK_ID_COMPX(far)
  	)
    .......
    .......
   };
  {%endhighlight%}


  **Result**

  If you select the entity in the scene hierarchy to which the scriptable component (with behaviour shown above) has been attached to inside the Engine, you will see this UI in the inspector panel:

  <img src="/img/posts/inspector-scriptable.png" title="output" style="max-height:412px;max-width:412px;">

<br>
<br>
  **Also, if you are interested, feel free to checkout my YouTube playlist with all the video-logs of my engine's update here:**
  <iframe width="100%" height="312px" src="https://www.youtube.com/embed/videoseries?list=PL7kD7ACAKlr9gos6Z2iEE2SDh2HoYlQqB" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

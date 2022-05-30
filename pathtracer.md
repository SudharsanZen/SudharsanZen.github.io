---
layout: inner
title: OpenGL GPU Path-Tracer
permalink: /pathtracer/
---
# OpenGL GPU Path-Tracer


<iframe width="100%" height="412px" src="https://www.youtube.com/embed/86xruFAXSHI" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
<center>
<b>Sci Fi Helmet</b><br/>
Credits:
<a href='https://sketchfab.com/cenobyte' class='link-class'> Artist </a>,
<a href='https://sketchfab.com/3d-models/sci-fi-helmet-57c4e5784952425bbe95e5975bbff694' class='link-class'> Source </a>
</center>


### **Here's a short summary of things I've worked on:**

#### Blender Exporter and Importer
The first thing I did is to write my own exporter that can export blender scenes to a custom 3D file format.
Instead of using existing standard 3D file formats with import-libraries like assimp, I chose to write my own exporter and define a custom format since that would give me more direct control over the materials and the mesh data. For now, all the meshes are automatically triangulated and the vertex data is transformed to World-Space before storing it in a file.  Two files are created, a Json and a binary file. the Json file contains the location to the binary file and a list of all materials that's assigned to the triangles, the binary file on the other hand contains the vertex and triangle data.
The exporter creates these two files and makes a copy of all the textures next to the binary file for easy access.
#### Acceleration Structure (used: BVH tree)
The triangle data are then packed into an array and then given to the BVH-tree class for tree generation. The BVH-tree then orders and partitions the given list of triangles equally into a fixed number of 'bins'. Then the SAH (Surface Area Heuristics) is used to determine the best split axis and split position or decide if we should split the node at all. This step is repeated as long as the splitting cost is lesser than making a leaf-node or if the number of triangles per leaf-node exceeds the given amount.
The below video show's the tree built using the above algorithm. (number of bins: 8, max number of nodes per triangle=1 (i.e) each leaf-node has exactly one triangle in it):
<iframe width="100%" height="412px" src="https://www.youtube.com/embed/yIk_IhPxnIM" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
Then next step, make the BVH traversable with a given ray!
The Demo of which is shown below:
<iframe width="100%" height="412px" src="https://www.youtube.com/embed/1qgJ9R6hCEA" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

#### Port the BVH tree to our OpenGL compute Shader:
This step is easy, just have to flatten the BVH tree into an array then write it to an SSBO. I then create separate SSBOs for triangle data, material data and triangle index list.
And the real question now is, how does it fairs?
Well see it for yourself!
#### The heatmap for the Stanford Bunny:
<table class="table-style">
  <tr>
    <th>BVH params</th> <th>heatmap</th>
  </tr>
  <tr>
  <td>
    Number of Bins: 20<br/>
    Max Number of Triangles Per Node: 3<br/>
  </td>
  <td>

    <b>Blue:</b>  1 triangle/AABB hit.<br/>
    <b>Green:</b> 100 triangle/AABB hit.<br/>
    <b>Red:</b>   200+ triangle/AABB hit.<br/>
  </td>
  </tr>
</table>


<img src="/img/posts/sbunny.png" title="output" >

Not bad, not excellent either.
<br/>
There are other better Alternatives like NVIDIA's [SBVH](https://www.nvidia.in/docs/IO/77714/sbvh.pdf){:class='link-class'} which avoids overlapping bounds. Here's the comparison of my attempt at BVH and SBVH:
<img src="/img/posts/sbvh bvh bunny.png" title="output" >
The SBVH implementation performs a little better, but it could be a lot more better than what it currently is. I've decided not to integrated the current implementation of SBVH as it is into my path-tracer since I felt like it's incomplete and wanted to dedicate more time slowly experimenting and optimizing it in the future. And also my hands were itching to complete the core features first!  



#### Actual Path-tracing
At the time of writing, the path-tracer uses a naive uniform hemisphere sampling approach.
##### Here are some of the renders from my path-tracer:
 <img src="/img/posts/spider.png" title="output" >
<center>

<b>Crystal Spider</b><br/>
Credits:
<a href='https://sketchfab.com/Your_friendly_wolf' class='link-class'> Artist </a>,
<a href='https://sketchfab.com/3d-models/crystal-spider-5d83a21690fa416f86c570a7377e935d' class='link-class'> Source </a>
</center>

<img src="/img/posts/helmet.png" title="output" >
<center>

<b>Sci Fi Helmet</b><br/>
Credits:
<a href='https://sketchfab.com/cenobyte' class='link-class'> Artist </a>,
<a href='https://sketchfab.com/3d-models/sci-fi-helmet-57c4e5784952425bbe95e5975bbff694' class='link-class'> Source </a>
</center>

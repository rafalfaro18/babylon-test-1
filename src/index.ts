import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera';
import { Engine } from '@babylonjs/core/Engines/engine';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder';
import { CreateGround } from '@babylonjs/core/Meshes/Builders/groundBuilder';
import { CreateSphere } from '@babylonjs/core/Meshes/Builders/sphereBuilder';
import { CreateText } from '@babylonjs/core/Meshes/Builders/textBuilder';
import { Scene } from '@babylonjs/core/scene';

import { GridMaterial } from '@babylonjs/materials/grid/gridMaterial';
import "@babylonjs/core/Materials/standardMaterial";

import * as earcut from "earcut"
import { VirtualJoystick } from '@babylonjs/core/Misc/virtualJoystick';

//import "@babylonjs/core/Debug/debugLayer"; // Augments the scene with the debug methods
//import "@babylonjs/inspector"; // Injects a local ES6 version of the inspector to prevent automatically relying on the none compatible version

// Get the canvas element from the DOM.
const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

// Associate a Babylon Engine to it.
const engine = new Engine(canvas);

// Create our first scene.
var scene = new Scene(engine);

//scene.debugLayer.show();

// This creates and positions a free camera (non-mesh)
var camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);

// This targets the camera to scene origin
camera.setTarget(Vector3.Zero());

// This attaches the camera to the canvas
camera.attachControl(canvas, true);

// This creates a light, aiming 0,1,0 - to the sky (non-mesh)
var light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);

// Default intensity is 1. Let's dim the light a small amount
light.intensity = 0.7;

// Create a grid material
var material = new GridMaterial("grid", scene);

// Our built-in 'sphere' shape.
var sphere = CreateSphere('sphere1', { segments: 16, diameter: 2 }, scene);

// Move the sphere upward 1/2 its height
sphere.position.y = 2;

// Affect a material
sphere.material = material;

// Create a box
var box = CreateBox("box1", { size: 2 }, scene)
box.material = material;
box.position.x = -2;
box.position.y = 1;
box.position.z = -2;

const fontData = await (await fetch("./fonts/Roboto_Regular.json")).json();

var title = CreateText("title", "Rafael Alfaro - Resume", fontData, {
  size: 1,
  resolution: 64,
  depth: 0.5
}, scene, earcut)

title.position.y = 4

// Our built-in 'ground' shape.
var ground = CreateGround('ground1', { width: 6, height: 6, subdivisions: 2 }, scene);

// Affect a material
ground.material = material;

// Create joystick and set z index to be below playgrounds top bar
var leftJoystick = new VirtualJoystick(true);
var rightJoystick = new VirtualJoystick(false);
VirtualJoystick.Canvas.style.zIndex = "4";

var movespeed = 5
scene.onBeforeRenderObservable.add(()=>{
    if(leftJoystick.pressed){
        var moveX = leftJoystick.deltaPosition.x * (engine.getDeltaTime()/1000) * movespeed;
        var moveZ = leftJoystick.deltaPosition.y * (engine.getDeltaTime()/1000) * movespeed;
        camera.position.x+=moveX
        camera.position.z+=moveZ
        
    }
    if(rightJoystick.pressed){
        var moveY = rightJoystick.deltaPosition.y * (engine.getDeltaTime()/1000) * movespeed;
        camera.position.y+=moveY
    }
})

// Create button to toggle joystick overlay canvas
var btn = document.createElement("button")
btn.innerText = "Enable/Disable Joystick"
btn.style.zIndex = "10";
btn.style.position = "absolute"
btn.style.bottom = "50px"
btn.style.right = "0px"
document.body.appendChild(btn)

// Button toggle logic
btn.onclick = ()=>{
    if(VirtualJoystick.Canvas.style.zIndex == "-1"){
        VirtualJoystick.Canvas.style.zIndex = "4";
    }else{
        VirtualJoystick.Canvas.style.zIndex = "-1";
    }
}

// Dispose button on rerun
scene.onDisposeObservable.add(()=>{
    VirtualJoystick.Canvas.style.zIndex = "-1";
    document.body.removeChild(btn)
})

// Render every frame
engine.runRenderLoop(() => {
  scene.render();
});
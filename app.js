import * as THREE from "three";
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import fragment from "./shader/fragment.glsl";
import vertex from "./shader/vertex.glsl";
import * as dat from "dat.gui";

import { TimelineMax } from "gsap";
let OrbitControls = require("three-orbit-controls")(THREE);

function map(n, fromStart, fromEnd, toStart, toEnd) {
  return toStart + ((n - fromStart) / fromEnd - fromStart) * (toEnd - toStart);
}

function carthesianToSpherical(x, y, z) {
  let r = Math.sqrt(x * x + y * y + z * z);
  let theta = Math.atan2(Math.sqrt(x * x + y * y), z);
  let phi = Math.atan2(y, x);
  return [r, theta, phi];
}

function sphericalToCarthesian(r, theta, phi) {
  let x = r * Math.sin(theta) * Math.cos(phi);
  let y = r * Math.sin(theta) * Math.sin(phi);
  let z = r * Math.cos(theta);
  return [x, y, z];
}

export default class Sketch {
  constructor(selector) {
    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer();
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x000000, 1);

    this.container = document.getElementById("container");
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001,
      10000
    );

    // var frustumSize = 10;
    // var aspect = window.innerWidth / window.innerHeight;
    // this.camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000 );
    this.camera.position.set(0, 0, 3);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.time = 0;

    this.paused = false;

    this.setupResize();

    this.addObjects();
    this.resize();
    this.render();
    // this.settings();
  }

  settings() {
    let that = this;
    this.settings = {
      time: 0,
    };
    this.gui = new dat.GUI();
    this.gui.add(this.settings, "time", 0, 100, 0.01);
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;

    // image cover
    this.imageAspect = 853 / 1280;
    let a1;
    let a2;
    if (this.height / this.width > this.imageAspect) {
      a1 = (this.width / this.height) * this.imageAspect;
      a2 = 1;
    } else {
      a1 = 1;
      a2 = this.height / this.width / this.imageAspect;
    }

    // this.material.uniforms.resolution.value.x = this.width;
    // this.material.uniforms.resolution.value.y = this.height;
    // this.material.uniforms.resolution.value.z = a1;
    // this.material.uniforms.resolution.value.w = a2;

    // optional - cover with quad
    // const dist  = this.camera.position.z;
    // const height = 1;
    // this.camera.fov = 2*(180/Math.PI)*Math.atan(height/(2*dist));

    // // if(w/h>1) {
    // if(this.width/this.height>1){
    //   this.plane.scale.x = this.camera.aspect;
    //   // this.plane.scale.y = this.camera.aspect;
    // } else{
    //   this.plane.scale.y = 1/this.camera.aspect;
    // }

    this.camera.updateProjectionMatrix();
  }

  addObjects() {
    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);
    let that = this;
    // this.material = new THREE.ShaderMaterial({
    //   extensions: {
    //     derivatives: "#extension GL_OES_standard_derivatives : enable",
    //   },
    //   side: THREE.DoubleSide,
    //   uniforms: {
    //     time: { type: "f", value: 0 },
    //     resolution: { type: "v4", value: new THREE.Vector4() },
    //     uvRate1: {
    //       value: new THREE.Vector2(1, 1),
    //     },
    //   },
    //   // wireframe: true,
    //   // transparent: true,
    //   vertexShader: vertex,
    //   fragmentShader: fragment,
    // });

    // this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
    // const sphereGeo = new THREE.SphereBufferGeometry(2.5, 64, 64);
    // const spherePoints = sphereGeo.attributes.position.array;

    // let transformedPoints = [];
    // for (let i = 3; i <= spherePoints.length; i += 3) {

    //   if (m < 10) {
    //     transformedPoints.push(xe, ye, ze);
    //   }
    // }

    let points = [];
    let maxIterations = 50;
    const length = 200;
    for (let x = 0; x < length; x++) {
      for (let y = 0; y < length; y++) {
        let edge = false;
        for (let z = 0; z < length; z++) {
          const ux = map(x, 0, length, -1, 1);
          const uy = map(y, 0, length, -1, 1);
          const uz = map(z, 0, length, -1, 1);
          let xe = 0;
          let ye = 0;
          let ze = 0;
          let it = 0;
          let n = 3;

          while (true) {
            const [r, t, p] = carthesianToSpherical(xe, ye, ze);
            let m = Math.pow(r, n);
            xe = ux + m * Math.sin(n * t) * Math.cos(n * p);
            ye = uy + m * Math.sin(n * t) * Math.sin(n * p);
            ze = uz + m * Math.cos(n * t);
            it++;

            if (r > 2) {
              if (edge) {
                edge = false;
              }
              break;
            }
            if (it > maxIterations) {
              if (!edge) {
                edge = true;
                points.push(ux, uy, uz);
              }
              break;
            }
          }
        }
      }
    }

    const geometry = new THREE.BufferGeometry();
    this.geometry = geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(points), 3)
    );
    this.material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.005,
      sizeAttenuation: true,
    });
    this.plane = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.plane);
  }

  stop() {
    this.paused = true;
  }

  play() {
    this.paused = false;
    this.render();
  }

  render() {
    if (this.paused) return;
    this.time += 0.05;
    // this.material.uniforms.time.value = this.time;
    this.scene.rotateX(0.001);
    this.scene.rotateY(0.001);
    this.scene.rotateZ(0.001);
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
  }
}

new Sketch("container");

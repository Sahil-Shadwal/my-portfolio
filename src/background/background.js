import React, { useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import './styles.css'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
// import { BokehPass } from './shaders/Passes/BokehPass';
// import { BokehPass } from './shaders/bokeh/BokehPass'
import { BokehPass } from './shaders/Passes/BokehPass';

import terrainVertexShader from './shaders/terrain/vertex.js';
import terrainFragmentShader from './shaders/terrain/fragment.js';

const Terrain = () => {
  useEffect(() => {
     

    /**
     * Base
     */
    // Debug

    // Canvas
    const canvas = document.querySelector('canvas.webgl')

    // Scene
    const scene = new THREE.Scene()

    /**
     * Terrain
     */
    const terrain ={}

    //Texture
    terrain.texture ={}
    terrain.texture.linesCount = 5
    terrain.texture.bigLineWidth = 0.04
    terrain.texture.smallLineWidth = 0.01
    terrain.texture.width = 1
    terrain.texture.height = 128
    terrain.texture.canvas = document.createElement('canvas')
    terrain.texture.canvas.width = terrain.texture.width
    terrain.texture.canvas.height = terrain.texture.height
    terrain.texture.canvas.style.position = 'fixed'
    terrain.texture.canvas.style.top = 0 
    terrain.texture.canvas.style.left = 0
    terrain.texture.canvas.style.zIndex = 1
    document.body.append(terrain.texture.canvas)

    terrain.texture.context = terrain.texture.canvas.getContext('2d')




    terrain.texture.instance = new THREE.CanvasTexture(terrain.texture.canvas)
    terrain.texture.instance.wrapS = THREE.RepeatWrapping
    terrain.texture.instance.wrapT = THREE.RepeatWrapping
    // terrain.texture.instance.minFilter = THREE.NearestFilter
    // terrain.texture.instance.magFilter = THREE.NearestFilter



    terrain.texture.update = () => {
        terrain.texture.context.clearRect(0, 0, terrain.texture.width, terrain.texture.height)

        //Big Lines
        const actualBigLineWidth =  Math.round(terrain.texture.height*terrain.texture.bigLineWidth)
        terrain.texture.context.globalAlpha =1
        terrain.texture.context.fillStyle = '#ffffff'

        terrain.texture.context.fillRect(
            0,
            0,
            terrain.texture.width,
            actualBigLineWidth
        )

        //Small lines
        const actualSmallLineWidth = Math.round(terrain.texture.height*terrain.texture.smallLineWidth)
        const smallLinesCount = terrain.texture.linesCount-1

        for(let i = 0; i < smallLinesCount;i++){
            terrain.texture.context.globalAlpha =0.5
            terrain.texture.context.fillRect(
                0,
                actualBigLineWidth + Math.round((terrain.texture.height - actualBigLineWidth) / terrain.texture.linesCount)*(i+1),
                terrain.texture.width,
                actualSmallLineWidth
            )
        }
    }
    terrain.texture.update()

    // Geometry
    terrain.geometry = new THREE.PlaneGeometry(1, 1, 1000, 1000)
    terrain.geometry.rotateX(-Math.PI*0.5)

    //Material
    terrain.material = new THREE.ShaderMaterial( {
        transparent:true,
        // blending: THREE.AdditiveBlending,
        // side: THREE.DoubleSide,
        vertexShader: terrainVertexShader,
        fragmentShader: terrainFragmentShader,
        uniforms:{
            uTexture:{value: terrain.texture.instance },
            uElevation: { value:2},
            uTextureFrequency: {value:10.0},
            uTime: {value: 0}
        }
    }) 

    //Mesh
    terrain.mesh = new THREE.Mesh(terrain.geometry,terrain.material)
    terrain.mesh.scale.set(10,10,10)
    scene.add(terrain.mesh)
    // Material
    // const waterMaterial = new THREE.MeshBasicMaterial()



    /**
     * Sizes
     */
    const sizes = {
        width: window.innerWidth,
        height: window.innerHeight,
        pixelRatio: Math.min(window.devicePixelRatio,2)
    }

    window.addEventListener('resize', () =>
    {
        // Update sizes
        sizes.width = window.innerWidth
        sizes.height = window.innerHeight
        sizes.pixelRatio = Math.min(window.devicePixelRatio,2)

        // Update camera
        camera.aspect = sizes.width / sizes.height
        camera.updateProjectionMatrix()

        // Update renderer
        renderer.setSize(sizes.width, sizes.height)
        renderer.setPixelRatio(sizes.pixelRatio)

        // Update effect composer
        effectComposer.setSize(sizes.width, sizes.height)
        effectComposer.setPixelRatio(sizes.pixelRatio)

        //Update passes
        bokehPass.renderTargetDepth.width = sizes.width * sizes.pixelRatio
        bokehPass.renderTargetDepth.height = sizes.height * sizes.pixelRatio

    })

    /**
     * Camera
     */
    // Base camera
    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
    camera.position.x =1
    camera.position.y =1
    camera.position.z =1

    scene.add(camera)

    // Controls
    const controls = new OrbitControls(camera, canvas)
    controls.enableDamping = false
    controls.enabled = false


    /**
     * Renderer
     */
    //Renderer
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        // antialias: true,
    })
    renderer.setClearColor(0x080024,1)
    // renderer.setClearColor(0x8EC3B0,1)
    // renderer.setClearColor(0x053B50,1)
    // renderer.setClearColor(0xEEEEEE,1)
    // renderer.setClearColor(0x404258,1)
    // renderer.setClearColor(0xC9CCD5,1)





    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    //Effect composer
    const renderTarget = new THREE.WebGLMultipleRenderTargets(800,600,{
        // minFilter : THREE.LinearFilter,
        // magFilter: THREE.LinearFilter,
        // format: THREE.RGBAFormat,
        // encoding: THREE.sRGBEncoding
    })
    const effectComposer = new EffectComposer(renderer)
    effectComposer.setSize(sizes.width,sizes.height)
    effectComposer.setPixelRatio(sizes.pixelRatio)
    effectComposer.enabled = false

    //Render pass
    const renderPass = new RenderPass(scene, camera)
    effectComposer.addPass(renderPass)


    //Bokeh pass
    const bokehPass = new BokehPass(
        scene,
        camera,
        {
            focus: 1.0,
            aperture: 0.025,
            maxblur: 0.01,

            width:sizes.width,
            height: sizes.height
        }
    )
    effectComposer.addPass(bokehPass)

    /**
     * Animate
     */
    const clock = new THREE.Clock()

    const tick = () =>
    {
        const elapsedTime = clock.getElapsedTime()

        // Update controls
        controls.update()

        //Update terrain
        terrain.material.uniforms.uTime.value = elapsedTime

        // Render
        // renderer.render(scene, camera)
        effectComposer.render()

        // Call tick again on the next frame
        window.requestAnimationFrame(tick)
    }

    tick()


    // Cleanup when component unmounts
    return () => {
      // Clean up resources here if needed
    };
  }, []);

  return <canvas className="webgl" />;
};

export default Terrain;

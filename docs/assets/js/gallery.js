function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}const { easing, value, tween } = window.popmotion;

class AccessibleWebglEffect {
















  constructor(canvas, items) {_defineProperty(this, "engine", void 0);_defineProperty(this, "scene", void 0);_defineProperty(this, "camera", void 0);_defineProperty(this, "items", void 0);_defineProperty(this, "itemIndex", void 0);_defineProperty(this, "light", void 0);_defineProperty(this, "plane", void 0);_defineProperty(this, "canvas", void 0);_defineProperty(this, "isAnimating", void 0);_defineProperty(this, "animationState", void 0);_defineProperty(this, "uniforms", void 0);_defineProperty(this, "state", void 0);_defineProperty(this, "animating", void 0);_defineProperty(this, "tween", void 0);_defineProperty(this, "textures", void 0);
    this.canvas = canvas;
    this.items = items;
    this.itemIndex = -1;
    this.isAnimating = false;
    this.animationState = "grid";

    this.uniforms = {
      uProgress: 0,
      uMeshScale: new BABYLON.Vector2(1, 1),
      uMeshPosition: new BABYLON.Vector2(0, 0),
      uViewSize: new BABYLON.Vector2(1, 1) };

  }

  init() {
    // ⚙️ ⚙️ ⚙️
    this.engine = new BABYLON.Engine(this.canvas, true);

    // 🖼 🖼 🖼
    this.scene = new BABYLON.Scene(this.engine, true, {
      preserveDrawingBuffer: true,
      stencil: true });

    this.scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);

    // 🎥 🎥 🎥
    this.camera = new BABYLON.UniversalCamera(
    "UniversalCamera",
    new BABYLON.Vector3(0, 0, -1),
    this.scene);

    this.camera.setTarget(BABYLON.Vector3.Zero());
    this.camera.attachControl(this.canvas, true);

    // ☀ ☀ ☀
    this.light = new BABYLON.HemisphericLight(
    "hemiLight",
    new BABYLON.Vector3(0, 0, -100),
    this.scene);


    // 🌫 🌫 🌫
    let path0;
    let path1;
    let path2;
    let path3;
    let path4;
    let path5;
    let path6;
    let path7;
    let path8;
    let path9;
    let path10;

    path0 = [];
    path1 = [];
    path2 = [];
    path3 = [];
    path4 = [];
    path5 = [];
    path6 = [];
    path7 = [];
    path8 = [];
    path9 = [];
    path10 = [];

    for (let i = -0.5; i <= 0.5; i += 0.1) {if (window.CP.shouldStopExecution(0)) break;
      path0.push(new BABYLON.Vector3(i, -0.5, 0));
      path1.push(new BABYLON.Vector3(i, -0.4, 0));
      path2.push(new BABYLON.Vector3(i, -0.3, 0));
      path3.push(new BABYLON.Vector3(i, -0.2, 0));
      path4.push(new BABYLON.Vector3(i, -0.1, 0));
      path5.push(new BABYLON.Vector3(i, 0, 0));
      path6.push(new BABYLON.Vector3(i, 0.1, 0));
      path7.push(new BABYLON.Vector3(i, 0.2, 0));
      path8.push(new BABYLON.Vector3(i, 0.3, 0));
      path9.push(new BABYLON.Vector3(i, 0.4, 0));
      path10.push(new BABYLON.Vector3(i, 0.5, 0));
    }

    // Plane as ribbon to allow distortion
    window.CP.exitedLoop(0);this.plane = BABYLON.MeshBuilder.CreateRibbon(
    "segmentedPlane",
    {
      pathArray: [
      path0,
      path1,
      path2,
      path3,
      path4,
      path5,
      path6,
      path7,
      path8,
      path9,
      path10] },


    this.scene);


    // 🌈 🌈 🌈
    BABYLON.Effect.ShadersStore["customVertexShader"] = `
      precision highp float;
	    
      uniform float uProgress;
	    uniform vec2 uMeshScale;
	    uniform vec2 uMeshPosition;
	    uniform vec2 uViewSize;
      uniform mat4 worldViewProjection;

      attribute vec3 position;
      attribute vec2 uv;
      
      varying vec2 vUV;

	    void main(){
	      vec3 pos = position.xyz;
        float maxDistance = distance(vec2(0.),vec2(0.5));
        float dist = distance(vec2(0.), uv-0.5);
        float activation = smoothstep(0.,maxDistance,dist);

        float latestStart = 0.5;
      	float startAt = activation * latestStart;
        float vertexProgress = smoothstep(startAt,1.,uProgress);

		    // Scale to page view size/page size
	      vec2 scaleToViewSize = uViewSize / uMeshScale - 1.; 
        vec2 scale = vec2(
          1. + scaleToViewSize * vertexProgress * .9
        );
        
        pos.xy *= scale;
        
        // Move towards center 
        pos.y += -uMeshPosition.y * vertexProgress;
        pos.x += -uMeshPosition.x * vertexProgress;
        
        gl_Position = worldViewProjection * vec4(pos,1.);
        vUV = uv;
	    }
    `;

    // 📦 📦 📦
    BABYLON.Effect.ShadersStore["customFragmentShader"] = `
      precision highp float;
      
      uniform vec3 uColor;
      uniform sampler2D textureSampler;

      varying vec2 vUV;
      
      void main(){
        gl_FragColor = texture2D(textureSampler, vUV);
	    }
    `;

    // 🌈 🌈 🌈 + 📦 📦 📦
    const shaderMaterial = new BABYLON.ShaderMaterial(
    "shader",
    this.scene,
    {
      vertex: "custom",
      fragment: "custom" },

    {
      attributes: ["position", "normal", "uv"],
      uniforms: [
      "world",
      "worldView",
      "worldViewProjection",
      "view",
      "projection",
      "uProgress",
      "uPlaneSize",
      "uPlanePosition",
      "uViewSize",
      "sampler2D"] });




    const viewSize = this.getViewSize();
    this.uniforms.uViewSize.x = viewSize.width;
    this.uniforms.uViewSize.y = viewSize.height;

    this.textures = [];
    this.items.forEach(item => {
      console.log(item.src);
      this.textures.push(new BABYLON.Texture(item.src, this.scene));
    });
    shaderMaterial.setTexture("textureSampler", this.textures[0]);
    shaderMaterial.backFaceCulling = false;
    this.plane.material = shaderMaterial;

    this.setUniforms();

    window.addEventListener("resize", this.onResize.bind(this));

    for (let i = 0; i < this.items.length; i++) {if (window.CP.shouldStopExecution(1)) break;
      const element = this.items[i];
      element.addEventListener("mousedown", ev => this.onGridImageClick(ev, i));
    }window.CP.exitedLoop(1);
  }

  // 📐 📐 📐
  setUniforms() {
    this.plane.material.setFloat("uProgress", this.uniforms.uProgress);
    this.plane.material.setVector2("uMeshScale", this.uniforms.uMeshScale);
    this.plane.material.setVector2(
    "uMeshPosition",
    this.uniforms.uMeshPosition);

    this.plane.material.setVector2("uViewSize", this.uniforms.uViewSize);
  }

  // UPDATE MESH ✍️✍️✍️
  updateMesh() {
    if (this.itemIndex === -1) {
      return;
    }

    const rect = this.items[this.itemIndex].getBoundingClientRect();
    const viewSize = this.getViewSize();

    // Pixel units => camera's view units
    const widthViewUnit = rect.width * viewSize.width / window.innerWidth;
    const heightViewUnit = rect.height * viewSize.height / window.innerHeight;
    let xViewUnit = rect.left * viewSize.width / window.innerWidth;
    let yViewUnit = rect.top * viewSize.height / window.innerHeight;

    // Units relative to center instead of the top left.
    xViewUnit = xViewUnit - viewSize.width / 2;
    yViewUnit = yViewUnit - viewSize.height / 2;

    // Origin of the plane's position to be the center instead of top Left.
    const x = xViewUnit + widthViewUnit / 2;
    const y = -yViewUnit - heightViewUnit / 2;

    const mesh = this.plane;
    // Since the geometry's size is 1. The scale is equivalent to the size.
    mesh.scaling.x = widthViewUnit;
    mesh.scaling.y = heightViewUnit;
    mesh.position.x = x;
    mesh.position.y = y;

    this.uniforms.uMeshPosition.x = x / widthViewUnit;
    this.uniforms.uMeshPosition.y = y / heightViewUnit;

    this.uniforms.uMeshScale.x = widthViewUnit;
    this.uniforms.uMeshScale.y = heightViewUnit;
  }

  // ONGRIDIMAGECLICK 🐭🐭🐭
  onGridImageClick(ev, itemIndex) {
    this.toFullscreen(itemIndex);
  }

  // TOGRID ✨✨✨✨
  toGrid() {
    if (this.state === "grid" || this.isAnimating) {
      return;
    }

    this.isAnimating = true;

    this.tween = tween({
      from: 1,
      to: 0,
      ease: easing.linear,
      duration: 700 }).
    start({
      update: e => {
        this.plane.material.setFloat("uProgress", e);
        this.render.bind(this);
      },
      complete: () => {
        this.isAnimating = false;
        this.state = "grid";
        console.log("done !");
      } });

  }

  // TOFULLSCREEN 🌟
  toFullscreen(index) {
    if (this.state === "fullscreen" || this.isAnimating) {
      console.log('NO');
      return;
    }

    this.itemIndex = index;
    this.updateMesh();
    this.render();

    this.isAnimating = true;

    this.plane.material.setTexture("textureSampler", this.textures[index]);

    this.tween = tween({
      from: 0,
      to: 1,
      ease: easing.cubicBezier(0, 0.4, 0, 1),
      duration: 1700 }).
    start({
      update: e => {
        this.plane.material.setFloat("uProgress", e);
        this.render.bind(this);
      },
      complete: () => {
        this.isAnimating = false;
        this.state = "fullscreen";
        setTimeout(() => {
          this.toGrid();
        }, 200);
      } });

  }

  // RENDER 🔥🔥🔥
  render() {
    this.engine.runRenderLoop(() => {
      if (this.scene) {
        this.scene.render();
      }
    });
  }

  // UTILS 📏📏📏
  getViewSize() {
    const fovInRadians = this.camera.fov * Math.PI / 180;
    const height = Math.abs(
    this.camera.position.z * Math.tan(fovInRadians / 2) * 121);


    return {
      width: height * window.innerWidth / window.innerHeight,
      height };

  }

  // UTILS 📏📏📏
  onResize() {
    const viewSize = this.getViewSize();
    this.uniforms.uViewSize.x = viewSize.width;
    this.uniforms.uViewSize.y = viewSize.height;
    this.setUniforms();
    this.updateMesh();
    this.engine.resize();
  }}


const effect = new AccessibleWebglEffect(
document.getElementById("app"),
Array.from(document.getElementsByClassName("item")));


effect.init();
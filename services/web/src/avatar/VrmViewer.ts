// Copyright 2026 Satoshi Maemoto
// SPDX-License-Identifier: Apache-2.0

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRMLoaderPlugin, type VRM } from "@pixiv/three-vrm";

export type VrmViewerOptions = {
  width?: number;
  height?: number;
};

const MAX_DELTA = 0.1;
const SPRING_WARMUP_FRAMES = 90;

export class VrmViewer {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private clock = new THREE.Clock();
  private animationId: number | null = null;
  private vrm: VRM | null = null;
  private modelRoot: THREE.Object3D | null = null;
  private loadedUrl: string | null = null;
  private loading = false;
  private lipSync = false;
  private lipPhase = 0;
  private initialized = false;

  private initialCameraPosition: THREE.Vector3 | null = null;
  private initialCameraLookAt: THREE.Vector3 | null = null;
  private initialModelPosition: THREE.Vector3 | null = null;
  private initialModelRotation: { x: number; y: number; z: number } | null = null;

  private isIdleAnimating = false;
  private idleAnimationTime = 0;
  private idleAnimationChangeTimer = 0;
  private idleAnimationChangeInterval = 5 + Math.random() * 5;
  private idleAnimationAmplitude = { y: 0.12, z: 0.08 };
  private idleAnimationFrequency = { y: 0.18, z: 0.14 };
  private idleAnimationPhaseOffset = { y: 0, z: Math.PI / 4 };
  private lastActionTime = Date.now();

  private neckRotationTarget = { y: 0, z: 0 };
  private neckRotationCurrent = { y: 0, z: 0 };

  private blinkTimer = 0;
  private blinkInterval = 3 + Math.random() * 2;
  private leftEyeDefaultQuat: THREE.Quaternion | null = null;
  private rightEyeDefaultQuat: THREE.Quaternion | null = null;

  constructor(
    private canvas: HTMLCanvasElement,
    private options: VrmViewerOptions = {},
  ) {
    const w = options.width ?? (canvas.clientWidth || 320);
    const h = options.height ?? (canvas.clientHeight || 320);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 100);
    this.camera.position.set(0, 1.35, 1.8);
    this.camera.lookAt(0, 1.35, 0);
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setSize(w, h, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
  }

  init() {
    if (this.initialized) return;
    const ambient = new THREE.AmbientLight(0xfff5e6, 0.55);
    const key = new THREE.DirectionalLight(0xfff8f0, 1.0);
    key.position.set(0.4, 1.6, 1.4).normalize();
    const fill = new THREE.DirectionalLight(0xffffff, 0.35);
    fill.position.set(-0.8, 0.8, 0.6);
    const rim = new THREE.DirectionalLight(0xfff0e0, 0.2);
    rim.position.set(0, 0.5, -1);
    this.scene.add(ambient, key, fill, rim);
    this.initialized = true;
    this.tick();
  }

  async loadVRM(url: string) {
    if (!this.initialized) this.init();
    if (this.loadedUrl === url && this.modelRoot) return;

    if (this.loading) return;
    this.loading = true;
    try {
      this.clearModel();
      const loader = new GLTFLoader();
      loader.register((parser) => new VRMLoaderPlugin(parser));
      const gltf = await loader.loadAsync(url);
      const vrm = gltf.userData.vrm as VRM | undefined;
      const root = vrm?.scene ?? gltf.scene;
      this.vrm = vrm ?? null;
      this.modelRoot = root;

      root.rotation.y = Math.PI;
      const box = new THREE.Box3().setFromObject(root);
      const center = box.getCenter(new THREE.Vector3());
      root.position.sub(center);

      const size = box.getSize(new THREE.Vector3());

      this.scene.add(root);
      root.updateMatrixWorld(true);

      let faceY = size.y * 0.4;
      const headNode = this.vrm?.humanoid?.getNormalizedBoneNode("head");
      if (headNode) {
        const headPos = new THREE.Vector3();
        headNode.getWorldPosition(headPos);
        faceY = headPos.y;
      }

      const cameraY = faceY - size.y * 0.03;
      const dist = Math.max(size.y * 0.45, 0.75);
      this.initialCameraPosition = new THREE.Vector3(0, cameraY, dist);
      this.initialCameraLookAt = new THREE.Vector3(0, faceY, 0);
      this.camera.position.copy(this.initialCameraPosition);
      this.camera.lookAt(this.initialCameraLookAt);
      this.camera.fov = 30;
      this.camera.updateProjectionMatrix();

      this.initialModelPosition = root.position.clone();
      this.initialModelRotation = {
        x: root.rotation.x,
        y: root.rotation.y,
        z: root.rotation.z,
      };

      this.resetLayout(
        this.canvas.clientWidth || 320,
        this.canvas.clientHeight || 320,
      );

      if (this.vrm) {
        if (this.vrm.lookAt) this.vrm.lookAt.autoUpdate = false;
        this.saveEyeDefaults();
        this.setNaturalArmPose();
        this.warmupSpringBones();
        this.resetAnimationState();
        this.startIdleAnimation();
      }

      this.loadedUrl = url;
    } finally {
      this.loading = false;
    }
  }

  /** SpringBone（髪など）を数フレーム先に進めて逆立ちを抑える */
  private warmupSpringBones() {
    if (!this.vrm) return;
    for (let i = 0; i < SPRING_WARMUP_FRAMES; i++) {
      this.maintainArmPose();
      this.vrm.update(1 / 60);
    }
  }

  private saveEyeDefaults() {
    const bones = this.vrm?.humanoid?.normalizedHumanBones;
    if (!bones) return;
    if (bones.leftEye?.node) {
      this.leftEyeDefaultQuat = bones.leftEye.node.quaternion.clone();
    }
    if (bones.rightEye?.node) {
      this.rightEyeDefaultQuat = bones.rightEye.node.quaternion.clone();
    }
  }

  private resetAnimationState() {
    this.neckRotationTarget = { y: 0, z: 0 };
    this.neckRotationCurrent = { y: 0, z: 0 };
    this.idleAnimationTime = 0;
    this.idleAnimationChangeTimer = 0;
    this.blinkTimer = 0;
    this.blinkInterval = 3 + Math.random() * 2;
    this.randomizeIdleParameters();
    this.lastActionTime = Date.now();
  }

  private startIdleAnimation() {
    this.isIdleAnimating = true;
  }

  private randomizeIdleParameters() {
    this.idleAnimationAmplitude.y = 0.08 + Math.random() * 0.1;
    this.idleAnimationAmplitude.z = 0.05 + Math.random() * 0.08;
    this.idleAnimationFrequency.y = 0.12 + Math.random() * 0.15;
    this.idleAnimationFrequency.z = 0.1 + Math.random() * 0.12;
    this.idleAnimationPhaseOffset.y = Math.random() * Math.PI * 2;
    this.idleAnimationPhaseOffset.z = Math.random() * Math.PI * 2;
    this.idleAnimationChangeInterval = 5 + Math.random() * 5;
  }

  private setNaturalArmPose() {
    this.maintainArmPose();
  }

  private maintainArmPose() {
    const bones = this.vrm?.humanoid?.normalizedHumanBones;
    if (!bones) return;
    try {
      if (bones.leftShoulder?.node) {
        bones.leftShoulder.node.rotation.set(0, 0, 0);
      }
      if (bones.leftUpperArm?.node) {
        bones.leftUpperArm.node.rotation.set(0, 0, Math.PI / 2);
      }
      if (bones.leftLowerArm?.node) {
        bones.leftLowerArm.node.rotation.set(0, 0, 0);
      }
      if (bones.rightShoulder?.node) {
        bones.rightShoulder.node.rotation.set(0, 0, 0);
      }
      if (bones.rightUpperArm?.node) {
        bones.rightUpperArm.node.rotation.set(0, 0, -Math.PI / 2);
      }
      if (bones.rightLowerArm?.node) {
        bones.rightLowerArm.node.rotation.set(0, 0, 0);
      }
    } catch {
      /* ignore */
    }
  }

  private updateIdleAnimation(dt: number) {
    if (!this.vrm || !this.isIdleAnimating) return;

    this.idleAnimationTime += dt;
    this.idleAnimationChangeTimer += dt;

    if (this.idleAnimationChangeTimer >= this.idleAnimationChangeInterval) {
      this.neckRotationCurrent.y = this.neckRotationTarget.y;
      this.neckRotationCurrent.z = this.neckRotationTarget.z;
      this.randomizeIdleParameters();
      this.idleAnimationTime = 0;
      this.idleAnimationChangeTimer = 0;
    }

    const elapsed = (Date.now() - this.lastActionTime) / 1000;
    if (elapsed > 3) {
      this.neckRotationTarget.y =
        Math.sin(
          this.idleAnimationTime * this.idleAnimationFrequency.y +
          this.idleAnimationPhaseOffset.y,
        ) * this.idleAnimationAmplitude.y;
      this.neckRotationTarget.z =
        Math.sin(
          this.idleAnimationTime * this.idleAnimationFrequency.z +
          this.idleAnimationPhaseOffset.z,
        ) * this.idleAnimationAmplitude.z;
    } else {
      this.neckRotationTarget.y = 0;
      this.neckRotationTarget.z = 0;
    }
  }

  private updateSmoothNeckMovement(dt: number) {
    const neck = this.vrm?.humanoid?.normalizedHumanBones?.neck?.node;
    if (!neck) return;
    const lerpSpeed = 2.5;
    this.neckRotationCurrent.y = THREE.MathUtils.lerp(
      this.neckRotationCurrent.y,
      this.neckRotationTarget.y,
      lerpSpeed * dt,
    );
    this.neckRotationCurrent.z = THREE.MathUtils.lerp(
      this.neckRotationCurrent.z,
      this.neckRotationTarget.z,
      lerpSpeed * dt,
    );
    neck.rotation.y = this.neckRotationCurrent.y;
    neck.rotation.z = this.neckRotationCurrent.z;
  }

  private updateBlink(dt: number) {
    if (!this.vrm) return;
    this.blinkTimer += dt;

    if (this.blinkTimer < this.blinkInterval) return;

    const blinkDuration = 0.15;
    const t = this.blinkTimer - this.blinkInterval;
    const blinkValue = Math.min(1, t / blinkDuration);

    this.setExpression("blink", blinkValue);

    if (this.blinkTimer >= this.blinkInterval + blinkDuration) {
      this.blinkTimer = 0;
      this.blinkInterval = 3 + Math.random() * 2;
      this.setExpression("blink", 0);
    }
  }

  private setExpression(name: string, value: number) {
    if (!this.vrm?.expressionManager) return;
    try {
      this.vrm.expressionManager.setValue(name, value);
      this.vrm.expressionManager.update();
    } catch {
      /* preset may not exist */
    }
  }

  private fixEyeBones() {
    const bones = this.vrm?.humanoid?.normalizedHumanBones;
    if (!bones) return;
    if (bones.leftEye?.node && this.leftEyeDefaultQuat) {
      bones.leftEye.node.quaternion.copy(this.leftEyeDefaultQuat);
    }
    if (bones.rightEye?.node && this.rightEyeDefaultQuat) {
      bones.rightEye.node.quaternion.copy(this.rightEyeDefaultQuat);
    }
  }

  private lockTransform() {
    if (this.initialCameraPosition && this.initialCameraLookAt) {
      this.camera.position.copy(this.initialCameraPosition);
      this.camera.lookAt(this.initialCameraLookAt);
    }
    if (this.vrm?.scene && this.initialModelPosition && this.initialModelRotation) {
      this.vrm.scene.position.copy(this.initialModelPosition);
      this.vrm.scene.rotation.set(
        this.initialModelRotation.x,
        this.initialModelRotation.y,
        this.initialModelRotation.z,
      );
    }
  }

  startLipSync() {
    this.lipSync = true;
    this.lastActionTime = Date.now();
  }

  stopLipSync() {
    this.lipSync = false;
    this.setExpression("aa", 0);
    this.lastActionTime = Date.now();
  }

  private tick = () => {
    this.animationId = requestAnimationFrame(this.tick);
    let dt = this.clock.getDelta();
    if (dt > MAX_DELTA) {
      dt = MAX_DELTA;
      this.resetAnimationState();
    }

    if (this.vrm) {
      this.updateIdleAnimation(dt);

      if (this.lipSync) {
        this.lipPhase += dt * 12;
        this.setExpression("aa", (Math.sin(this.lipPhase) + 1) * 0.25);
      }

      this.vrm.update(dt);

      if (this.vrm.lookAt) this.vrm.lookAt.autoUpdate = false;

      this.fixEyeBones();
      this.maintainArmPose();
      this.lockTransform();
      this.updateSmoothNeckMovement(dt);
      this.updateBlink(dt);
    }

    this.renderer.render(this.scene, this.camera);
  };

  /** Sync viewport size and restore load-time camera framing on layout change. */
  resetLayout(width: number, height: number) {
    if (width <= 0 || height <= 0) return;

    this.camera.aspect = width / height;
    if (this.initialCameraPosition && this.initialCameraLookAt) {
      this.camera.position.copy(this.initialCameraPosition);
      this.camera.lookAt(this.initialCameraLookAt);
    }
    this.camera.updateProjectionMatrix();
    this.syncRendererSize(width, height);
  }

  private syncRendererSize(width: number, height: number) {
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height, false);
    this.canvas.style.removeProperty("width");
    this.canvas.style.removeProperty("height");
  }

  resize(width: number, height: number) {
    this.resetLayout(width, height);
  }

  dispose() {
    if (this.animationId != null) cancelAnimationFrame(this.animationId);
    this.stopLipSync();
    this.isIdleAnimating = false;
    this.clearModel();
    this.renderer.dispose();
  }

  private clearModel() {
    if (this.modelRoot) {
      this.scene.remove(this.modelRoot);
      this.modelRoot.traverse((o) => {
        const mesh = o as THREE.Mesh;
        mesh.geometry?.dispose();
        const mat = mesh.material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat?.dispose();
      });
    }
    this.modelRoot = null;
    this.vrm = null;
    this.loadedUrl = null;
    this.leftEyeDefaultQuat = null;
    this.rightEyeDefaultQuat = null;
  }
}

export function isWebGLAvailable(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl") || c.getContext("webgl2"));
  } catch {
    return false;
  }
}

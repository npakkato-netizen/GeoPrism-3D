import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Box, 
  RotateCw, 
  Scissors, 
  Eye, 
  Layers, 
  Maximize2, 
  HelpCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { ShapeType } from '../../types';

interface Shape3DViewerProps {
  onShapeExplored?: (shape: ShapeType) => void;
}

export const Shape3DViewer: React.FC<Shape3DViewerProps> = ({ onShapeExplored }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const meshGroupRef = useRef<THREE.Group | null>(null);
  const sliceMeshRef = useRef<THREE.Mesh | null>(null);

  // States
  const [currentShape, setCurrentShape] = useState<ShapeType>('rectangular_prism');
  
  // Dimensions
  const [width, setWidth] = useState<number>(6);
  const [length, setLength] = useState<number>(4);
  const [height, setHeight] = useState<number>(5);
  const [radius, setRadius] = useState<number>(3);
  const [innerRadius, setInnerRadius] = useState<number>(1.8);

  // Triangular Prism Options
  const [triangleType, setTriangleType] = useState<'general' | 'equilateral'>('general');

  // Trapezoidal Prism specific dimensions: a (top parallel side), b (bottom parallel side), h_ฐาน (trapezoid height)
  const [trapTop, setTrapTop] = useState<number>(3);
  const [trapBottom, setTrapBottom] = useState<number>(6);
  const [trapHeight, setTrapHeight] = useState<number>(4);

  // Cross-section controls
  const [enableSlice, setEnableSlice] = useState<boolean>(true);
  const [sliceType, setSliceType] = useState<'horizontal' | 'vertical' | 'angled'>('horizontal');
  const [slicePos, setSlicePos] = useState<number>(0); // -1 to 1 normalized
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [showFormulaInfo, setShowFormulaInfo] = useState<boolean>(true);

  // Drag interaction
  const isDraggingRef = useRef<boolean>(false);
  const prevMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rotationRef = useRef<{ x: number; y: number }>({ x: 0.4, y: 0.6 });

  // Notify shape exploration
  useEffect(() => {
    onShapeExplored?.(currentShape);
  }, [currentShape, onShapeExplored]);

  // Calculations
  const calculations = React.useMemo(() => {
    let baseArea = 0;
    let perimeter = 0;
    let lateralArea = 0;
    let totalSurfaceArea = 0;
    let volume = 0;
    let crossSectionName = '';
    let crossSectionFormula = '';
    let crossSectionArea = 0;

    let baseAreaFormula = '';
    let baseAreaSubstitution = '';
    let lateralAreaFormula = '';
    let lateralAreaSubstitution = '';
    let totalSurfaceFormula = '';
    let totalSurfaceSubstitution = '';
    let volumeFormula = '';
    let volumeSubstitution = '';
    let baseSummaryText = '';

    switch (currentShape) {
      case 'rectangular_prism': {
        baseArea = width * length;
        perimeter = 2 * (width + length);
        lateralArea = perimeter * height;
        totalSurfaceArea = 2 * baseArea + lateralArea;
        volume = baseArea * height;

        baseAreaFormula = 'กว้าง × ยาว';
        baseAreaSubstitution = `${width} × ${length} = ${baseArea.toFixed(2)}`;
        lateralAreaFormula = 'ความยาวรอบฐาน × h';
        lateralAreaSubstitution = `2(${width} + ${length}) × ${height} = ${perimeter} × ${height} = ${lateralArea.toFixed(2)}`;
        totalSurfaceFormula = '2(พื้นที่ฐาน) + ผิวข้าง';
        totalSurfaceSubstitution = `2(${baseArea.toFixed(2)}) + ${lateralArea.toFixed(2)} = ${totalSurfaceArea.toFixed(2)}`;
        volumeFormula = 'พื้นที่ฐาน × สูง';
        volumeSubstitution = `${baseArea.toFixed(2)} × ${height} = ${volume.toFixed(2)}`;
        baseSummaryText = `ฐานสี่เหลี่ยมผืนผ้า: กว้าง ${width} หน่วย, ยาว ${length} หน่วย, สูงของปริซึม ${height} หน่วย`;

        if (sliceType === 'horizontal') {
          crossSectionName = 'สี่เหลี่ยมผืนผ้า (ขนานกับฐาน)';
          crossSectionFormula = 'กว้าง × ยาว';
          crossSectionArea = width * length;
        } else if (sliceType === 'vertical') {
          crossSectionName = 'สี่เหลี่ยมผืนผ้า (ตั้งฉากกับฐาน)';
          crossSectionFormula = 'กว้าง × สูง หรือ ยาว × สูง';
          crossSectionArea = width * height;
        } else {
          crossSectionName = 'สี่เหลี่ยมด้านขนาน / สี่เหลี่ยมผืนผ้าเอียง';
          crossSectionFormula = 'กว้าง × ความยาวแนวเฉียง';
          crossSectionArea = width * Math.sqrt(length * length + (height * 0.5) ** 2);
        }
        break;
      }
      case 'triangular_prism': {
        if (triangleType === 'equilateral') {
          // Equilateral triangle: (√3 / 4) × ด้าน²
          const s = width;
          baseArea = (Math.sqrt(3) / 4) * s * s;
          perimeter = 3 * s;
          lateralArea = perimeter * height;
          totalSurfaceArea = 2 * baseArea + lateralArea;
          volume = baseArea * height;

          baseAreaFormula = '(√3 / 4) × ด้าน²';
          baseAreaSubstitution = `(√3 / 4) × ${s}² ≈ (1.732 / 4) × ${(s * s).toFixed(1)} = ${baseArea.toFixed(2)}`;
          lateralAreaFormula = 'ความยาวรอบฐาน × สูงของปริซึม';
          lateralAreaSubstitution = `(3 × ${s}) × ${height} = ${perimeter} × ${height} = ${lateralArea.toFixed(2)}`;
          totalSurfaceFormula = '2(พื้นที่ฐาน) + ผิวข้าง';
          totalSurfaceSubstitution = `2(${baseArea.toFixed(2)}) + ${lateralArea.toFixed(2)} = ${totalSurfaceArea.toFixed(2)}`;
          volumeFormula = 'พื้นที่ฐาน × สูงของปริซึม';
          volumeSubstitution = `${baseArea.toFixed(2)} × ${height} = ${volume.toFixed(2)}`;
          baseSummaryText = `ฐานสามเหลี่ยมด้านเท่า: ด้านยาวด้านละ ${s} หน่วย, สูงของปริซึม ${height} หน่วย`;

          if (sliceType === 'horizontal') {
            crossSectionName = 'สามเหลี่ยมด้านเท่า (เท่ากับฐานทุกประการ)';
            crossSectionFormula = '(√3 / 4) × ด้าน²';
            crossSectionArea = baseArea;
          } else if (sliceType === 'vertical') {
            crossSectionName = 'สี่เหลี่ยมผืนผ้า (ตั้งฉากกับฐาน)';
            crossSectionFormula = 'ด้านตัด × สูง';
            crossSectionArea = s * height;
          } else {
            crossSectionName = 'สามเหลี่ยมหน้าจั่วหรือสี่เหลี่ยมคางหมู';
            crossSectionFormula = 'แปรผันตามมุมเอียง';
            crossSectionArea = baseArea * 1.15;
          }
        } else {
          // General / Isosceles triangle: 1/2 × ฐาน × สูง
          const b = width; // ความยาวฐาน
          const hBase = length; // ความสูงของฐานสามเหลี่ยม
          baseArea = 0.5 * b * hBase;
          // Side leg of isosceles triangle with base b and height hBase
          const leg = Math.sqrt(Math.pow(b / 2, 2) + Math.pow(hBase, 2));
          perimeter = b + 2 * leg;
          lateralArea = perimeter * height;
          totalSurfaceArea = 2 * baseArea + lateralArea;
          volume = baseArea * height;

          baseAreaFormula = '1/2 × ฐาน × สูงของฐาน';
          baseAreaSubstitution = `1/2 × ${b} × ${hBase} = ${baseArea.toFixed(2)}`;
          lateralAreaFormula = 'ความยาวรอบฐาน × สูงของปริซึม';
          lateralAreaSubstitution = `(${b} + 2×${leg.toFixed(1)}) × ${height} = ${perimeter.toFixed(1)} × ${height} = ${lateralArea.toFixed(2)}`;
          totalSurfaceFormula = '2(พื้นที่ฐาน) + ผิวข้าง';
          totalSurfaceSubstitution = `2(${baseArea.toFixed(2)}) + ${lateralArea.toFixed(2)} = ${totalSurfaceArea.toFixed(2)}`;
          volumeFormula = 'พื้นที่ฐาน × สูงของปริซึม';
          volumeSubstitution = `${baseArea.toFixed(2)} × ${height} = ${volume.toFixed(2)}`;
          baseSummaryText = `ฐานสามเหลี่ยม: ฐาน (b) = ${b} หน่วย, สูงของฐาน (h_ฐาน) = ${hBase} หน่วย, สูงของปริซึม (h_ปริซึม) = ${height} หน่วย`;

          if (sliceType === 'horizontal') {
            crossSectionName = 'สามเหลี่ยม (เท่ากับฐานทุกประการ)';
            crossSectionFormula = '1/2 × ฐาน × สูง';
            crossSectionArea = baseArea;
          } else if (sliceType === 'vertical') {
            crossSectionName = 'สี่เหลี่ยมผืนผ้า (ตั้งฉากกับฐาน)';
            crossSectionFormula = 'ความยาวฐานตัด × สูง';
            crossSectionArea = b * height;
          } else {
            crossSectionName = 'สามเหลี่ยมหน้าจั่วหรือสี่เหลี่ยมคางหมู';
            crossSectionFormula = 'แปรผันตามมุมเอียง';
            crossSectionArea = baseArea * 1.15;
          }
        }
        break;
      }
      case 'trapezoidal_prism': {
        // Trapezoid base: 1/2 × (ผลบวกด้านคู่ขนาน) × สูงของฐาน
        const a = trapTop; // ด้านคู่ขนานด้านบน
        const b = trapBottom; // ด้านคู่ขนานด้านล่าง
        const hBase = trapHeight; // ความสูงของรูปสี่เหลี่ยมคางหมู
        baseArea = 0.5 * (a + b) * hBase;
        const leg = Math.sqrt(Math.pow((b - a) / 2, 2) + Math.pow(hBase, 2));
        perimeter = a + b + 2 * leg;
        lateralArea = perimeter * height;
        totalSurfaceArea = 2 * baseArea + lateralArea;
        volume = baseArea * height;

        baseAreaFormula = '1/2 × (ผลบวกด้านคู่ขนาน) × สูงของฐาน';
        baseAreaSubstitution = `1/2 × (${a} + ${b}) × ${hBase} = 1/2 × ${(a + b).toFixed(1)} × ${hBase} = ${baseArea.toFixed(2)}`;
        lateralAreaFormula = 'ความยาวรอบฐาน × สูงของปริซึม';
        lateralAreaSubstitution = `(${a} + ${b} + 2×${leg.toFixed(1)}) × ${height} = ${perimeter.toFixed(1)} × ${height} = ${lateralArea.toFixed(2)}`;
        totalSurfaceFormula = '2(พื้นที่ฐาน) + ผิวข้าง';
        totalSurfaceSubstitution = `2(${baseArea.toFixed(2)}) + ${lateralArea.toFixed(2)} = ${totalSurfaceArea.toFixed(2)}`;
        volumeFormula = 'พื้นที่ฐาน × สูงของปริซึม';
        volumeSubstitution = `${baseArea.toFixed(2)} × ${height} = ${volume.toFixed(2)}`;
        baseSummaryText = `ฐานสี่เหลี่ยมคางหมู: ด้านคู่ขนาน a = ${a}, b = ${b} (ผลรวม = ${(a + b).toFixed(1)}), สูงตรงของคางหมู = ${hBase}, สูง/ยาวของปริซึม = ${height} หน่วย`;

        if (sliceType === 'horizontal') {
          crossSectionName = 'สี่เหลี่ยมคางหมู (เท่ากับฐานทุกประการ)';
          crossSectionFormula = '1/2 × (a + b) × h_ฐาน';
          crossSectionArea = baseArea;
        } else {
          crossSectionName = 'สี่เหลี่ยมผืนผ้า (ตัดตามแนวขวาง)';
          crossSectionFormula = 'กว้างรอยตัด × สูง';
          crossSectionArea = b * height;
        }
        break;
      }
      case 'hexagonal_prism': {
        const a = radius;
        baseArea = (3 * Math.sqrt(3) / 2) * a * a;
        perimeter = 6 * a;
        lateralArea = perimeter * height;
        totalSurfaceArea = 2 * baseArea + lateralArea;
        volume = baseArea * height;

        baseAreaFormula = '(3√3 / 2) × ด้าน²';
        baseAreaSubstitution = `(3√3 / 2) × ${a}² ≈ 2.598 × ${(a * a).toFixed(1)} = ${baseArea.toFixed(2)}`;
        lateralAreaFormula = 'ความยาวรอบฐาน × สูงของปริซึม';
        lateralAreaSubstitution = `(6 × ${a}) × ${height} = ${perimeter} × ${height} = ${lateralArea.toFixed(2)}`;
        totalSurfaceFormula = '2(พื้นที่ฐาน) + ผิวข้าง';
        totalSurfaceSubstitution = `2(${baseArea.toFixed(2)}) + ${lateralArea.toFixed(2)} = ${totalSurfaceArea.toFixed(2)}`;
        volumeFormula = 'พื้นที่ฐาน × สูงของปริซึม';
        volumeSubstitution = `${baseArea.toFixed(2)} × ${height} = ${volume.toFixed(2)}`;
        baseSummaryText = `ฐานหกเหลี่ยมด้านเท่ามุมเท่า: ด้านยาวด้านละ ${a} หน่วย, สูงของปริซึม ${height} หน่วย`;

        if (sliceType === 'horizontal') {
          crossSectionName = 'หกเหลี่ยมด้านเท่ามุมเท่า';
          crossSectionFormula = '(3√3 / 2) × a²';
          crossSectionArea = baseArea;
        } else {
          crossSectionName = 'สี่เหลี่ยมผืนผ้า';
          crossSectionFormula = 'ความกว้างหน้าตัด × สูง';
          crossSectionArea = 2 * a * height;
        }
        break;
      }
      case 'solid_cylinder': {
        baseArea = Math.PI * radius * radius;
        perimeter = 2 * Math.PI * radius;
        lateralArea = perimeter * height;
        totalSurfaceArea = 2 * baseArea + lateralArea;
        volume = baseArea * height;

        baseAreaFormula = 'πr²';
        baseAreaSubstitution = `π × ${radius}² ≈ 3.1416 × ${(radius * radius).toFixed(1)} = ${baseArea.toFixed(2)}`;
        lateralAreaFormula = '2πrh (เส้นรอบวง × สูง)';
        lateralAreaSubstitution = `2 × π × ${radius} × ${height} ≈ ${lateralArea.toFixed(2)}`;
        totalSurfaceFormula = '2πr² + 2πrh = 2πr(r + h)';
        totalSurfaceSubstitution = `2(${baseArea.toFixed(2)}) + ${lateralArea.toFixed(2)} = ${totalSurfaceArea.toFixed(2)}`;
        volumeFormula = 'πr²h';
        volumeSubstitution = `${baseArea.toFixed(2)} × ${height} = ${volume.toFixed(2)}`;
        baseSummaryText = `ฐานทรงกระบอก: รัศมีฐาน (r) = ${radius} หน่วย, สูงตรง (h) = ${height} หน่วย`;

        if (sliceType === 'horizontal') {
          crossSectionName = 'วงกลม (ขนานกับฐาน มีขนาดเท่าฐาน)';
          crossSectionFormula = 'πr²';
          crossSectionArea = baseArea;
        } else if (sliceType === 'vertical') {
          crossSectionName = 'สี่เหลี่ยมผืนผ้า (ผ่านแกนกลาง)';
          crossSectionFormula = 'เส้นผ่านศูนย์กลาง (2r) × สูง (h)';
          crossSectionArea = 2 * radius * height;
        } else {
          crossSectionName = 'วงรี (Ellipse ตัดเฉียงทำมุม)';
          crossSectionFormula = 'π × r × (r / cos θ)';
          crossSectionArea = Math.PI * radius * (radius * 1.35);
        }
        break;
      }
      case 'hollow_cylinder': {
        const outerBase = Math.PI * radius * radius;
        const innerBase = Math.PI * innerRadius * innerRadius;
        baseArea = outerBase - innerBase; // Ring area
        const outerLat = 2 * Math.PI * radius * height;
        const innerLat = 2 * Math.PI * innerRadius * height;
        lateralArea = outerLat + innerLat;
        totalSurfaceArea = 2 * baseArea + lateralArea;
        volume = baseArea * height;

        baseAreaFormula = 'π(R² - r²) [พื้นที่วงแหวน]';
        baseAreaSubstitution = `π(${radius}² - ${innerRadius}²) ≈ 3.1416 × ${(radius * radius - innerRadius * innerRadius).toFixed(2)} = ${baseArea.toFixed(2)}`;
        lateralAreaFormula = '2πRh + 2πrh (ผิวข้างนอก + ผิวข้างใน)';
        lateralAreaSubstitution = `2π(${radius} + ${innerRadius}) × ${height} ≈ ${lateralArea.toFixed(2)}`;
        totalSurfaceFormula = '2(พื้นที่วงแหวน) + ผิวข้างนอก + ผิวข้างใน';
        totalSurfaceSubstitution = `2(${baseArea.toFixed(2)}) + ${lateralArea.toFixed(2)} = ${totalSurfaceArea.toFixed(2)}`;
        volumeFormula = 'π(R² - r²)h [ปริมาตรเนื้อท่อ]';
        volumeSubstitution = `${baseArea.toFixed(2)} × ${height} = ${volume.toFixed(2)}`;
        baseSummaryText = `ทรงกระบอกกลวง: รัศมีนอก (R) = ${radius}, รัศมีใน (r) = ${innerRadius}, สูงตรง (h) = ${height} หน่วย`;

        if (sliceType === 'horizontal') {
          crossSectionName = 'วงแหวน (Annulus)';
          crossSectionFormula = 'π(R² - r²)';
          crossSectionArea = baseArea;
        } else if (sliceType === 'vertical') {
          crossSectionName = 'สี่เหลี่ยมผืนผ้าคู่สองแผ่น (เนื้อท่อ)';
          crossSectionFormula = '2 × (ความหนา × สูง)';
          crossSectionArea = 2 * (radius - innerRadius) * height;
        } else {
          crossSectionName = 'วงแหวนวงรี';
          crossSectionFormula = 'π(R_maj·R_min - r_maj·r_min)';
          crossSectionArea = baseArea * 1.35;
        }
        break;
      }
    }

    return {
      baseArea: Number(baseArea.toFixed(2)),
      perimeter: Number(perimeter.toFixed(2)),
      lateralArea: Number(lateralArea.toFixed(2)),
      totalSurfaceArea: Number(totalSurfaceArea.toFixed(2)),
      volume: Number(volume.toFixed(2)),
      crossSectionName,
      crossSectionFormula,
      crossSectionArea: Number(crossSectionArea.toFixed(2)),
      baseAreaFormula,
      baseAreaSubstitution,
      lateralAreaFormula,
      lateralAreaSubstitution,
      totalSurfaceFormula,
      totalSurfaceSubstitution,
      volumeFormula,
      volumeSubstitution,
      baseSummaryText,
    };
  }, [currentShape, width, length, height, radius, innerRadius, sliceType, trapTop, trapBottom, trapHeight, triangleType]);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 450;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f172a'); // Rich dark slate
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(12, 10, 14);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.localClippingEnabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight1.position.set(10, 20, 15);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.4);
    dirLight2.position.set(-10, -10, -10);
    scene.add(dirLight2);

    // Subtle Grid on floor
    const grid = new THREE.GridHelper(20, 20, 0x334155, 0x1e293b);
    grid.position.y = -4;
    scene.add(grid);

    // Group for shapes
    const group = new THREE.Group();
    scene.add(group);
    meshGroupRef.current = group;

    // Render loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (autoRotate && group) {
        rotationRef.current.y += 0.008;
      }

      if (group) {
        group.rotation.x = rotationRef.current.x;
        group.rotation.y = rotationRef.current.y;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle Resize
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight || 450;
      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Update Geometry and Clipping
  useEffect(() => {
    if (!meshGroupRef.current || !sceneRef.current) return;
    const group = meshGroupRef.current;

    // Clear previous meshes
    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    }

    // Determine clipping plane
    let clipPlane: THREE.Plane | null = null;
    let planeNormal = new THREE.Vector3(0, 1, 0);
    let planeConstant = 0;

    const actualHeight = height;
    const yOffset = actualHeight * 0.5 * slicePos;

    if (enableSlice) {
      if (sliceType === 'horizontal') {
        planeNormal = new THREE.Vector3(0, -1, 0);
        planeConstant = yOffset;
      } else if (sliceType === 'vertical') {
        planeNormal = new THREE.Vector3(-1, 0, 0);
        const halfSpan = currentShape === 'trapezoidal_prism' ? trapBottom * 0.5 : width * 0.5;
        planeConstant = halfSpan * slicePos;
      } else {
        // Angled
        planeNormal = new THREE.Vector3(0.5, -0.866, 0).normalize();
        planeConstant = yOffset * 0.8;
      }
      clipPlane = new THREE.Plane(planeNormal, planeConstant);
    }

    // Colors
    const solidColor = 0x3b82f6; // Vibrant sky blue
    const edgeColor = 0x93c5fd;

    // Main material
    const material = new THREE.MeshStandardMaterial({
      color: solidColor,
      roughness: 0.3,
      metalness: 0.15,
      side: THREE.DoubleSide,
      clippingPlanes: clipPlane ? [clipPlane] : [],
      clipShadows: true,
      wireframe: wireframe,
    });

    let geometry: THREE.BufferGeometry;

    switch (currentShape) {
      case 'rectangular_prism': {
        geometry = new THREE.BoxGeometry(width, height, length);
        break;
      }
      case 'triangular_prism': {
        if (triangleType === 'equilateral') {
          // Equilateral triangular prism
          const s = width;
          const triHeight = (Math.sqrt(3) / 2) * s;
          const shape = new THREE.Shape();
          shape.moveTo(-s / 2, -triHeight / 3);
          shape.lineTo(s / 2, -triHeight / 3);
          shape.lineTo(0, (2 * triHeight) / 3);
          shape.closePath();

          geometry = new THREE.ExtrudeGeometry(shape, {
            depth: height,
            bevelEnabled: false,
          });
        } else {
          // General / Isosceles triangular prism with base width and height length
          const b = width;
          const th = length;
          const shape = new THREE.Shape();
          shape.moveTo(-b / 2, -th / 2);
          shape.lineTo(b / 2, -th / 2);
          shape.lineTo(0, th / 2);
          shape.closePath();

          geometry = new THREE.ExtrudeGeometry(shape, {
            depth: height,
            bevelEnabled: false,
          });
        }
        geometry.center();
        geometry.rotateX(Math.PI / 2);
        break;
      }
      case 'trapezoidal_prism': {
        const topW = trapTop;
        const botW = trapBottom;
        const tHeight = trapHeight;

        const shape = new THREE.Shape();
        shape.moveTo(-botW / 2, -tHeight / 2);
        shape.lineTo(botW / 2, -tHeight / 2);
        shape.lineTo(topW / 2, tHeight / 2);
        shape.lineTo(-topW / 2, tHeight / 2);
        shape.closePath();

        geometry = new THREE.ExtrudeGeometry(shape, {
          depth: height,
          bevelEnabled: false,
        });
        geometry.center();
        geometry.rotateX(Math.PI / 2);
        break;
      }
      case 'hexagonal_prism': {
        geometry = new THREE.CylinderGeometry(radius, radius, height, 6);
        break;
      }
      case 'solid_cylinder': {
        geometry = new THREE.CylinderGeometry(radius, radius, height, 48);
        break;
      }
      case 'hollow_cylinder': {
        // Construct hollow pipe using Shape with hole
        const outerR = radius;
        const innerR = Math.min(innerRadius, outerR - 0.3);

        const arcShape = new THREE.Shape();
        arcShape.absarc(0, 0, outerR, 0, Math.PI * 2, false);

        const holePath = new THREE.Path();
        holePath.absarc(0, 0, innerR, 0, Math.PI * 2, true);
        arcShape.holes.push(holePath);

        geometry = new THREE.ExtrudeGeometry(arcShape, {
          depth: height,
          bevelEnabled: false,
          curveSegments: 48,
        });
        geometry.center();
        geometry.rotateX(Math.PI / 2);
        break;
      }
      default:
        geometry = new THREE.BoxGeometry(4, 4, 4);
    }

    const mainMesh = new THREE.Mesh(geometry, material);
    group.add(mainMesh);

    // Add glowing outline edges for high visibility
    if (!wireframe) {
      const edges = new THREE.EdgesGeometry(geometry);
      const edgeMaterial = new THREE.LineBasicMaterial({
        color: edgeColor,
        linewidth: 2,
        clippingPlanes: clipPlane ? [clipPlane] : [],
      });
      const edgeLine = new THREE.LineSegments(edges, edgeMaterial);
      group.add(edgeLine);
    }

    // Slicing Indicator Plane (Golden glowing disc/polygon)
    if (enableSlice && clipPlane) {
      let sliceGeom: THREE.BufferGeometry;
      if (currentShape.includes('cylinder')) {
        sliceGeom = new THREE.CircleGeometry(radius * 1.02, 48);
      } else {
        const maxSpan = Math.max(width, radius * 2, trapBottom, trapTop) * 1.35;
        const maxDepth = Math.max(length, height, trapHeight) * 1.35;
        sliceGeom = new THREE.PlaneGeometry(maxSpan, maxDepth);
      }

      const sliceMat = new THREE.MeshBasicMaterial({
        color: 0xf59e0b, // Amber gold cross-section highlight
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75,
      });

      const slicePlaneMesh = new THREE.Mesh(sliceGeom, sliceMat);

      if (sliceType === 'horizontal') {
        slicePlaneMesh.rotation.x = Math.PI / 2;
        slicePlaneMesh.position.y = yOffset;
      } else if (sliceType === 'vertical') {
        slicePlaneMesh.rotation.y = Math.PI / 2;
        const halfSpan = currentShape === 'trapezoidal_prism' ? trapBottom * 0.5 : width * 0.5;
        slicePlaneMesh.position.x = halfSpan * slicePos;
      } else {
        slicePlaneMesh.rotation.x = Math.PI / 3;
        slicePlaneMesh.position.y = yOffset * 0.8;
      }

      group.add(slicePlaneMesh);
      sliceMeshRef.current = slicePlaneMesh;
    }
  }, [
    currentShape,
    width,
    length,
    height,
    radius,
    innerRadius,
    enableSlice,
    sliceType,
    slicePos,
    wireframe,
    trapTop,
    trapBottom,
    trapHeight,
    triangleType,
  ]);

  // Mouse / Touch Drag handlers for 3D Orbiting
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    prevMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - prevMousePos.current.x;
    const deltaY = e.clientY - prevMousePos.current.y;

    rotationRef.current.y += deltaX * 0.008;
    rotationRef.current.x += deltaY * 0.008;

    // Clamp vertical rotation
    rotationRef.current.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, rotationRef.current.x));

    prevMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleResetCamera = () => {
    rotationRef.current = { x: 0.4, y: 0.6 };
    if (cameraRef.current) {
      cameraRef.current.position.set(12, 10, 14);
      cameraRef.current.lookAt(0, 0, 0);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Top Banner & Shape Picker */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Box className="w-3.5 h-3.5" />
                ห้องปฏิบัติการเรขาคณิต 3 มิติ
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                <Scissors className="w-3 h-3" />
                โหมดตัดขวาง (Cross-section)
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-2">
              แบบจำลอง 3 มิติและการผ่าตัดขวางรูปทรง
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              หมุนสังเกตได้รอบทิศทาง 360° ปรับขนาดได้อิสระ และดูรอยตัดขวางเพื่อทำความเข้าใจที่มาของสูตรปริมาตร (V = ฐาน × สูง)
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              id="shape-select-rect"
              onClick={() => setCurrentShape('rectangular_prism')}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                currentShape === 'rectangular_prism'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              ปริซึมสี่เหลี่ยม
            </button>
            <button
              id="shape-select-tri"
              onClick={() => setCurrentShape('triangular_prism')}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                currentShape === 'triangular_prism'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              ปริซึมสามเหลี่ยม
            </button>
            <button
              id="shape-select-trap"
              onClick={() => setCurrentShape('trapezoidal_prism')}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                currentShape === 'trapezoidal_prism'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              ปริซึมคางหมู
            </button>
            <button
              id="shape-select-hex"
              onClick={() => setCurrentShape('hexagonal_prism')}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                currentShape === 'hexagonal_prism'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              ปริซึมหกเหลี่ยม
            </button>
            <button
              id="shape-select-cyl-solid"
              onClick={() => setCurrentShape('solid_cylinder')}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                currentShape === 'solid_cylinder'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              ทรงกระบอกตัน
            </button>
            <button
              id="shape-select-cyl-hollow"
              onClick={() => setCurrentShape('hollow_cylinder')}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                currentShape === 'hollow_cylinder'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              ทรงกระบอกกลวง / ท่อ
            </button>
          </div>
        </div>
      </div>

      {/* Main 3D Canvas + Control Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Center: Interactive 3D Canvas */}
        <div className="lg:col-span-8 bg-slate-900 rounded-3xl p-4 shadow-lg border border-slate-800 relative overflow-hidden flex flex-col">
          {/* Top Overlays: Controls */}
          <div className="flex items-center justify-between z-10 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300 bg-slate-800/80 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5">
                <RotateCw className="w-3.5 h-3.5 text-indigo-400" />
                คลิก/แตะแล้วลากเพื่อหมุน 360°
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                id="btn-toggle-autorotate"
                onClick={() => setAutoRotate(!autoRotate)}
                className={`p-2 rounded-lg text-xs font-medium border transition-colors ${
                  autoRotate
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
                title="หมุนอัตโนมัติ"
              >
                <RotateCw className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} />
              </button>

              <button
                id="btn-toggle-wireframe"
                onClick={() => setWireframe(!wireframe)}
                className={`p-2 rounded-lg text-xs font-medium border transition-colors ${
                  wireframe
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
                title="แสดงโครงสร้างเส้นขอบ (Wireframe)"
              >
                <Layers className="w-4 h-4" />
              </button>

              <button
                id="btn-reset-camera"
                onClick={handleResetCamera}
                className="p-2 rounded-lg text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors"
                title="รีเซ็ตมุมมอง"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Canvas Element */}
          <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="w-full h-[460px] cursor-grab active:cursor-grabbing rounded-2xl overflow-hidden relative touch-none select-none"
          />

          {/* Cross-section highlight banner at bottom of canvas */}
          {enableSlice && (
            <div className="mt-3 bg-slate-800/90 backdrop-blur rounded-xl p-3 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 z-10">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse inline-block" />
                <div>
                  <span className="text-xs text-amber-300 font-semibold">
                    รอยตัดขวางที่ไฮไลต์ (สีทอง):
                  </span>
                  <span className="text-xs text-slate-200 ml-1.5 font-medium">
                    {calculations.crossSectionName}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-slate-400">สูตรพื้นที่รอยตัด: <code className="text-amber-300 font-mono">{calculations.crossSectionFormula}</code></span>
                <span className="bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-400/40">
                  {calculations.crossSectionArea} ตร.หน่วย
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Dimension Sliders & Cross-Section Lab */}
        <div className="lg:col-span-4 space-y-4">
          {/* Cross-section Controls Card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Scissors className="w-4 h-4 text-indigo-600" />
                <span>จำลองการตัดขวาง (Cross-section)</span>
              </div>
              <button
                id="toggle-slice"
                onClick={() => setEnableSlice(!enableSlice)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  enableSlice
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                }`}
              >
                {enableSlice ? 'เปิดการตัด' : 'ปิดการตัด'}
              </button>
            </div>

            {enableSlice && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                    ทิศทางการตัดของระนาบ
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      id="slice-type-horizontal"
                      onClick={() => setSliceType('horizontal')}
                      className={`px-2 py-1.5 rounded-lg text-xs font-medium text-center transition-colors ${
                        sliceType === 'horizontal'
                          ? 'bg-indigo-100 text-indigo-700 font-semibold border border-indigo-300'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      ขนานฐาน
                    </button>
                    <button
                      id="slice-type-vertical"
                      onClick={() => setSliceType('vertical')}
                      className={`px-2 py-1.5 rounded-lg text-xs font-medium text-center transition-colors ${
                        sliceType === 'vertical'
                          ? 'bg-indigo-100 text-indigo-700 font-semibold border border-indigo-300'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      ตั้งฉากฐาน
                    </button>
                    <button
                      id="slice-type-angled"
                      onClick={() => setSliceType('angled')}
                      className={`px-2 py-1.5 rounded-lg text-xs font-medium text-center transition-colors ${
                        sliceType === 'angled'
                          ? 'bg-indigo-100 text-indigo-700 font-semibold border border-indigo-300'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      แนวเฉียง
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                    <span>ตำแหน่งระนาบตัด:</span>
                    <span className="text-indigo-600 font-bold">{Math.round(slicePos * 50 + 50)}%</span>
                  </div>
                  <input
                    id="slider-slice-pos"
                    type="range"
                    min="-0.95"
                    max="0.95"
                    step="0.05"
                    value={slicePos}
                    onChange={(e) => setSlicePos(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>ล่างสุด / ซ้ายสุด</span>
                    <span>กึ่งกลาง</span>
                    <span>บนสุด / ขวาสุด</span>
                  </div>
                </div>

                <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-xs text-amber-900 space-y-1">
                  <div className="font-semibold flex items-center gap-1 text-amber-800">
                    <Info className="w-3.5 h-3.5" />
                    ข้อสังเกตสำคัญของการตัดขวาง:
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {sliceType === 'horizontal'
                      ? 'การตัดขนานกับฐานจะให้รอยตัดขวางที่มีขนาดและรูปร่างเท่ากับฐานทุกประการตลอดแนวความสูง จึงได้สูตร ปริมาตร = พื้นที่ฐาน × สูง'
                      : sliceType === 'vertical'
                      ? 'การตัดตั้งฉากกับฐานจะให้รอยตัดขวางเป็นรูปสี่เหลี่ยมผืนผ้าเสมอ (ความยาวแปรผันตามระยะตัด)'
                      : 'การตัดเฉียงผ่านทรงกระบอกจะได้รูปวงรี (Ellipse) ซึ่งแกนยาวจะยืดออกตามองศาการเอียง'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Dimension Sliders Card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-3">
            <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>ปรับมิติและขนาดของรูปทรง</span>
            </div>

            {currentShape === 'trapezoidal_prism' ? (
              <>
                <div className="bg-indigo-50/70 rounded-xl p-2.5 border border-indigo-100 text-xs text-indigo-900 space-y-1">
                  <div className="font-semibold text-indigo-800 flex items-center gap-1.5">
                    <span>สูตรฐานสี่เหลี่ยมคางหมู:</span>
                    <code className="bg-white px-1.5 py-0.5 rounded text-[11px] font-mono text-indigo-700 border border-indigo-200">
                      1/2 × (a + b) × h_ฐาน
                    </code>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                    <span>ด้านคู่ขนานด้านบน (a):</span>
                    <span className="font-bold text-indigo-600">{trapTop} หน่วย</span>
                  </div>
                  <input
                    id="slider-trap-top"
                    type="range"
                    min="2"
                    max="8"
                    step="0.5"
                    value={trapTop}
                    onChange={(e) => setTrapTop(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                    <span>ด้านคู่ขนานด้านล่าง (b):</span>
                    <span className="font-bold text-indigo-600">{trapBottom} หน่วย</span>
                  </div>
                  <input
                    id="slider-trap-bottom"
                    type="range"
                    min="2"
                    max="10"
                    step="0.5"
                    value={trapBottom}
                    onChange={(e) => setTrapBottom(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                    <span>ความสูงของฐานคางหมู (h_ฐาน):</span>
                    <span className="font-bold text-indigo-600">{trapHeight} หน่วย</span>
                  </div>
                  <input
                    id="slider-trap-height"
                    type="range"
                    min="2"
                    max="8"
                    step="0.5"
                    value={trapHeight}
                    onChange={(e) => setTrapHeight(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                    <span>ความสูง/ยาวของปริซึม (h_ปริซึม):</span>
                    <span className="font-bold text-indigo-600">{height} หน่วย</span>
                  </div>
                  <input
                    id="slider-trap-prism-height"
                    type="range"
                    min="2"
                    max="9"
                    step="0.5"
                    value={height}
                    onChange={(e) => setHeight(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              </>
            ) : currentShape === 'triangular_prism' ? (
              <>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                    ลักษณะของฐานสามเหลี่ยม
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 mb-3">
                    <button
                      id="btn-tri-general"
                      onClick={() => setTriangleType('general')}
                      className={`px-2 py-1.5 rounded-lg text-xs font-medium text-center transition-colors ${
                        triangleType === 'general'
                          ? 'bg-indigo-100 text-indigo-700 font-semibold border border-indigo-300'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      ทั่วไป (1/2 × ฐาน × สูง)
                    </button>
                    <button
                      id="btn-tri-equilateral"
                      onClick={() => setTriangleType('equilateral')}
                      className={`px-2 py-1.5 rounded-lg text-xs font-medium text-center transition-colors ${
                        triangleType === 'equilateral'
                          ? 'bg-indigo-100 text-indigo-700 font-semibold border border-indigo-300'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      ด้านเท่า ((√3/4) × ด้าน²)
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                    <span>{triangleType === 'equilateral' ? 'ความยาวด้าน (s):' : 'ความยาวฐาน (b):'}</span>
                    <span className="font-bold text-indigo-600">{width} หน่วย</span>
                  </div>
                  <input
                    id="slider-tri-width"
                    type="range"
                    min="2"
                    max="9"
                    step="0.5"
                    value={width}
                    onChange={(e) => setWidth(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                {triangleType === 'general' && (
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                      <span>ความสูงของฐานสามเหลี่ยม (h_ฐาน):</span>
                      <span className="font-bold text-indigo-600">{length} หน่วย</span>
                    </div>
                    <input
                      id="slider-tri-length"
                      type="range"
                      min="2"
                      max="8"
                      step="0.5"
                      value={length}
                      onChange={(e) => setLength(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                )}

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                    <span>ความสูงของปริซึม (h_ปริซึม):</span>
                    <span className="font-bold text-indigo-600">{height} หน่วย</span>
                  </div>
                  <input
                    id="slider-tri-height"
                    type="range"
                    min="2"
                    max="9"
                    step="0.5"
                    value={height}
                    onChange={(e) => setHeight(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              </>
            ) : currentShape.includes('cylinder') ? (
              <>
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                    <span>รัศมีภายนอก (r):</span>
                    <span className="font-bold text-indigo-600">{radius} หน่วย</span>
                  </div>
                  <input
                    id="slider-radius"
                    type="range"
                    min="1.5"
                    max="5.5"
                    step="0.5"
                    value={radius}
                    onChange={(e) => setRadius(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                {currentShape === 'hollow_cylinder' && (
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                      <span>รัศมีภายใน (r_ใน):</span>
                      <span className="font-bold text-indigo-600">{innerRadius} หน่วย</span>
                    </div>
                    <input
                      id="slider-inner-radius"
                      type="range"
                      min="0.5"
                      max={Math.max(1, radius - 0.5)}
                      step="0.2"
                      value={innerRadius}
                      onChange={(e) => setInnerRadius(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                )}

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                    <span>ความสูง (h):</span>
                    <span className="font-bold text-indigo-600">{height} หน่วย</span>
                  </div>
                  <input
                    id="slider-height-cyl"
                    type="range"
                    min="2"
                    max="9"
                    step="0.5"
                    value={height}
                    onChange={(e) => setHeight(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              </>
            ) : currentShape === 'hexagonal_prism' ? (
              <>
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                    <span>ความยาวด้านของหกเหลี่ยม (a):</span>
                    <span className="font-bold text-indigo-600">{radius} หน่วย</span>
                  </div>
                  <input
                    id="slider-hex-a"
                    type="range"
                    min="2"
                    max="6"
                    step="0.5"
                    value={radius}
                    onChange={(e) => setRadius(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                    <span>ความสูงของปริซึม (h):</span>
                    <span className="font-bold text-indigo-600">{height} หน่วย</span>
                  </div>
                  <input
                    id="slider-hex-height"
                    type="range"
                    min="2"
                    max="9"
                    step="0.5"
                    value={height}
                    onChange={(e) => setHeight(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                    <span>ความกว้าง (Width):</span>
                    <span className="font-bold text-indigo-600">{width} หน่วย</span>
                  </div>
                  <input
                    id="slider-width"
                    type="range"
                    min="2"
                    max="8"
                    step="0.5"
                    value={width}
                    onChange={(e) => setWidth(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                    <span>ความยาว (Length):</span>
                    <span className="font-bold text-indigo-600">{length} หน่วย</span>
                  </div>
                  <input
                    id="slider-length"
                    type="range"
                    min="2"
                    max="9"
                    step="0.5"
                    value={length}
                    onChange={(e) => setLength(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                    <span>ความสูง (Height):</span>
                    <span className="font-bold text-indigo-600">{height} หน่วย</span>
                  </div>
                  <input
                    id="slider-height"
                    type="range"
                    min="2"
                    max="8"
                    step="0.5"
                    value={height}
                    onChange={(e) => setHeight(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Realtime Live Mathematical Formula & Value Dashboard */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                ค่าการคำนวณแบบเรียลไทม์ (Live Calculations)
              </h3>
              <p className="text-xs text-slate-500">
                ค่าคำนวณและสูตรจะอัปเดตทันทีตามขนาดมิติที่คุณปรับ
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowFormulaInfo(!showFormulaInfo)}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors border border-indigo-200/60"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            {showFormulaInfo ? 'ซ่อนวิธีแทนค่า' : 'แสดงวิธีแทนค่า'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Base Area Card */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 hover:border-indigo-300 transition-colors">
            <span className="text-xs font-semibold text-slate-600 block">พื้นที่ฐาน (Base Area)</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {calculations.baseArea}{' '}
              <span className="text-xs font-normal text-slate-500">ตร.หน่วย</span>
            </div>
            <div className="text-[11px] text-indigo-600 font-medium mt-1">
              สูตร: {calculations.baseAreaFormula}
            </div>
            {showFormulaInfo && (
              <div className="text-[10px] text-slate-600 font-mono mt-1.5 pt-1.5 border-t border-slate-200/60 bg-white/70 p-1.5 rounded">
                = {calculations.baseAreaSubstitution}
              </div>
            )}
          </div>

          {/* Lateral Area Card */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 hover:border-indigo-300 transition-colors">
            <span className="text-xs font-semibold text-slate-600 block">พื้นที่ผิวข้าง (Lateral Area)</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {calculations.lateralArea}{' '}
              <span className="text-xs font-normal text-slate-500">ตร.หน่วย</span>
            </div>
            <div className="text-[11px] text-indigo-600 font-medium mt-1">
              สูตร: {calculations.lateralAreaFormula}
            </div>
            {showFormulaInfo && (
              <div className="text-[10px] text-slate-600 font-mono mt-1.5 pt-1.5 border-t border-slate-200/60 bg-white/70 p-1.5 rounded">
                = {calculations.lateralAreaSubstitution}
              </div>
            )}
          </div>

          {/* Total Surface Area Card */}
          <div className="bg-indigo-50/60 rounded-xl p-4 border border-indigo-100 hover:border-indigo-300 transition-colors">
            <span className="text-xs font-semibold text-indigo-700 block">พื้นที่ผิวทั้งหมด (Total Surface)</span>
            <div className="text-2xl font-bold text-indigo-900 mt-1">
              {calculations.totalSurfaceArea}{' '}
              <span className="text-xs font-normal text-indigo-600">ตร.หน่วย</span>
            </div>
            <div className="text-[11px] text-indigo-700 font-medium mt-1">
              สูตร: {calculations.totalSurfaceFormula}
            </div>
            {showFormulaInfo && (
              <div className="text-[10px] text-indigo-800 font-mono mt-1.5 pt-1.5 border-t border-indigo-200/60 bg-white/70 p-1.5 rounded">
                = {calculations.totalSurfaceSubstitution}
              </div>
            )}
          </div>

          {/* Volume Card */}
          <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-100 hover:border-emerald-300 transition-colors">
            <span className="text-xs font-semibold text-emerald-700 block">ปริมาตร (Volume)</span>
            <div className="text-2xl font-bold text-emerald-900 mt-1">
              {calculations.volume}{' '}
              <span className="text-xs font-normal text-emerald-600">ลบ.หน่วย</span>
            </div>
            <div className="text-[11px] text-emerald-700 font-medium mt-1">
              สูตร: {calculations.volumeFormula}
            </div>
            {showFormulaInfo && (
              <div className="text-[10px] text-emerald-800 font-mono mt-1.5 pt-1.5 border-t border-emerald-200/60 bg-white/70 p-1.5 rounded">
                = {calculations.volumeSubstitution}
              </div>
            )}
          </div>
        </div>

        {/* Dimension & Geometry Overview Banner */}
        <div className="bg-slate-50/90 rounded-xl p-3 border border-slate-200 text-xs text-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="font-semibold text-slate-900">
              {calculations.baseSummaryText}
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <span>ความยาวรอบฐาน (Perimeter) = <strong className="text-slate-800 font-mono">{calculations.perimeter}</strong> หน่วย</span>
          </div>
        </div>
      </div>
    </div>
  );
};

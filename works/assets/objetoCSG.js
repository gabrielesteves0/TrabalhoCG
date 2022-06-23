import * as THREE from  'three';
import { CSG } from '../libs/other/CSGMesh.js'

export function objCura(){
    // CRIAÇÃO DO OBJETO DE RECARGA ATRAVÉS DE CSG
    var cubeGeometry = new THREE.BoxGeometry(1.5, 4, 4);
    var cube2Geometry = new THREE.BoxGeometry(4, 1.5, 4);
    var material = new THREE.MeshPhongMaterial({color:"rgb(255,0,0)", shininess:200});
    var cube = new THREE.Mesh(cubeGeometry);
    var cube2 = new THREE.Mesh(cube2Geometry);
    var cylinder = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 3, 32));
    cylinder.position.set(0, 3, 0);
    cube.position.set(0.0, 3.0, 0.0);
    cube2.position.set(0.0, 3.0, 0.0);
    cylinder.rotateX(degreesToRadians(90));
    updateObject(cylinder);
    updateObject(cube);
    updateObject(cube2);
  
    let auxMat = new THREE.Matrix4();
  
    let cube1CSG = CSG.fromMesh(cube);
    let cube2CSG = CSG.fromMesh(cube2);
    let cylinderCSG = CSG.fromMesh(cylinder);
  
    let cruzCSG = cube1CSG.union(cube2CSG);
    let objRecargaCSG = cylinderCSG.subtract(cruzCSG);
    let objRecarga;
  
    objRecarga = CSG.toMesh(objRecargaCSG, auxMat);
    objRecarga.material = material;
    objRecarga.position.set = (0, 3, 0);
    return objRecarga;
  }
  
  
  function updateObject(mesh)
  {
     mesh.matrixAutoUpdate = false;
     mesh.updateMatrix();
  }
var canvas;
var ctx;
var width, height;
const FPS = 500;


//rendering parts

meshes = [];


//Camera
var zdist = 20;
var drag = false;
var alpha = 0, beta = 0;
var oldMouse;


window.onload = () => {
    canvas = document.getElementById("canvas")
    ctx = canvas.getContext("2d")

    var main = new Main();

    setInterval(() => {
        canvas.width = width = window.innerWidth
        canvas.height = height = window.innerHeight
        ctx.fillStyle = "black"
        ctx.fillRect(0, 0, width, height)

        main.update();

    }, 1000 / FPS);
}

//Camera

window.addEventListener("wheel", e => {
    zdist += e.deltaY/1000*zdist;
})
window.addEventListener("mousedown", e =>{
    drag = true;
    oldMouse = new Vector(e.pageX, e.pageY);
})
window.addEventListener("mousemove", e => {
    if(drag){
        alpha += 0.002*(oldMouse.x - e.pageX);
        beta += 0.002*(oldMouse.y - e.pageY);

        if(beta < -Math.PI/3){
            beta = -Math.PI/3
        }
        if(beta > Math.PI/3){
            beta = Math.PI/3
        }
        
        oldMouse = new Vector(e.pageX, e.pageY)
    }
})
window.addEventListener("mouseup", e => {
    drag = false;
})

class Main{
    constructor(){
        this.projection = new Projection();

        var rand = Math.random() * 5
        if(rand < 1){
            this.sim = new PlanetSim();
        } else if(rand < 2){
            this.sim = new GravSim();
        } else if(rand < 3) {
            this.sim = new OrbitSim();
        }else if(rand < 4) {
            this.sim = new RepellSim();
        }else if(rand < 5) {
            this.sim = new AsteroidBelt();
        }

    }
    update(){
        meshes = [];
        //Update Render

        this.sim.update();
        this.sim.render();

        //Rendering Part

        //Apply camera
        meshes = meshes.map(mesh => mesh.rotateX(beta).rotateY(alpha).translate(0,0,zdist))
        //Projecting 3D coordinates to 2D coordinates
        var meshes2d = meshes.map(mesh => this.projection.project(mesh))
        //Getting all Mesh Triangles
        var triangles = meshes2d.reduce((acc, val) => acc.concat(val.triangles) , [])
        //Sort them by z-Index (draw farthest ones first)
        triangles.sort((a,b) => b.zIndex - a.zIndex)
        triangles.forEach(triangle => {
            triangle.draw();
        })
    }
}





class Cube{
    constructor(size, color){
        //Define a cube
        this.triangles = [
            new Mesh3DTriangle([
                new Vertex3D(0,0,0),
                new Vertex3D(1,0,0),
                new Vertex3D(1,1,0)
            ], color.add(new Vector(Math.random()*40,Math.random()*40,Math.random()*40)).toColor()),
            new Mesh3DTriangle([
                new Vertex3D(0,0,1),
                new Vertex3D(1,0,1),
                new Vertex3D(1,1,1),
            ], color.add(new Vector(Math.random()*40,Math.random()*40,Math.random()*40)).toColor()),
            new Mesh3DTriangle([
                new Vertex3D(0,0,1),
                new Vertex3D(1,1,1),
                new Vertex3D(0,1,1),
            ], color.add(new Vector(Math.random()*40,Math.random()*40,Math.random()*40)).toColor()),
            new Mesh3DTriangle([
                new Vertex3D(0,0,0),
                new Vertex3D(1,1,0),
                new Vertex3D(0,1,0),
            ], color.add(new Vector(Math.random()*40,Math.random()*40,Math.random()*40)).toColor()),
            new Mesh3DTriangle([
                new Vertex3D(0,0,0),
                new Vertex3D(0,0,1),
                new Vertex3D(0,1,1),
            ], color.add(new Vector(Math.random()*40,Math.random()*40,Math.random()*40)).toColor()),
            new Mesh3DTriangle([
                new Vertex3D(0,0,0),
                new Vertex3D(0,1,0),
                new Vertex3D(0,1,1),
            ], color.add(new Vector(Math.random()*40,Math.random()*40,Math.random()*40)).toColor()),
            new Mesh3DTriangle([
                new Vertex3D(1,0,0),
                new Vertex3D(1,0,1),
                new Vertex3D(1,1,1),
            ], color.add(new Vector(Math.random()*40,Math.random()*40,Math.random()*40)).toColor()),
            new Mesh3DTriangle([
                new Vertex3D(1,0,0),
                new Vertex3D(1,1,0),
                new Vertex3D(1,1,1),
            ], color.add(new Vector(Math.random()*40,Math.random()*40,Math.random()*40)).toColor()),
            new Mesh3DTriangle([
                new Vertex3D(0,0,0),
                new Vertex3D(1,0,0),
                new Vertex3D(1,0,1),
            ], color.add(new Vector(Math.random()*40,Math.random()*40,Math.random()*40)).toColor()),
            new Mesh3DTriangle([
                new Vertex3D(0,0,0),
                new Vertex3D(0,0,1),
                new Vertex3D(1,0,1),
            ], color.add(new Vector(Math.random()*40,Math.random()*40,Math.random()*40)).toColor()),
            new Mesh3DTriangle([
                new Vertex3D(0,1,0),
                new Vertex3D(1,1,0),
                new Vertex3D(1,1,1),
            ], color.add(new Vector(Math.random()*40,Math.random()*40,Math.random()*40)).toColor()),
            new Mesh3DTriangle([
                new Vertex3D(0,1,0),
                new Vertex3D(0,1,1),
                new Vertex3D(1,1,1),
            ], color.add(new Vector(Math.random()*40,Math.random()*40,Math.random()*40)).toColor()),
        ]
        this.mesh = new Mesh3D(this.triangles).scale(size);
        this.size = size;
        this.color = color;
    }
    render(position, normal){
        var rotX = Math.atan2(Math.sqrt(normal.x**2+ normal.z**2),normal.y)
        var rotY = Math.atan2(normal.x, normal.z)
        meshes.push(this.mesh.translate(-this.size/2, -this.size/2,-this.size/2).rotateX(rotX).rotateY(rotY).translate(position.x, -position.y, position.z))
    }
}



/**
 * A 3 dimensional Vector class
 */
class Vertex3D{
    constructor(x, y, z){
        this.x = x;
        this.y = y;
        this.z = z;
    }
    add(x, y, z){
        return new Vertex3D(this.x + x, this.y + y, this. z + z)
    }
    scale(x,y,z){
        return new Vertex3D(this.x * x, this.y * y, this.z * z)
    }
}

/**
 * A 2 dimensional Vector class
 */
class Vertex2D{
    constructor(x,y){
        this.x = x;
        this.y = y
    }
    add(x, y){
        return new Vertex2D(this.x + x, this.y + y)
    }
    scale(x, y){
        return new Vertex2D(this.x * x, this.y * y)
    }
}

/**
 * A collection of 3 3D-Vectors
 */
class Mesh3DTriangle{
    constructor(vector3List, color){
        if(vector3List.length != 3){
            throw "Triangle must have 3 vertices"
        }
        this.vertices = vector3List
        this.mean = this.vertices.reduce((acc, val) => acc.add(val.x, val.y, val.z), new Vertex3D(0,0,0))
        this.zIndex = this.mean.z
        this.color = color
    }
}

/**
 * A collection of 3 2D-Vectors
 */
class Mesh2DTriangle{
    constructor(vector2List, zIndex, color){
        if(vector2List.length != 3){
            throw "Triangle must have 3 vertices"
        }
        this.vector2List = vector2List
        this.zIndex = zIndex
        this.color = color
    }
    /**
     * Draws this 2D Triangle to the screen
     */
    draw(){
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.moveTo(this.vector2List[0].x, this.vector2List[0].y)
        ctx.lineTo(this.vector2List[1].x, this.vector2List[1].y)
        ctx.lineTo(this.vector2List[2].x, this.vector2List[2].y)
        ctx.fill();
    }
}

/**
 * A Collection of many 3D-Triangles wich form a 3D Body
 */
class Mesh3D{
    constructor(mesh3DTriangles){
        this.triangles = mesh3DTriangles
    }
    
    /**
     * Translates all Vertices by the given amount
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} z
     * @returns {Mesh3D} The translated Mesh
     */
    translate(x, y, z) {
        return new Mesh3D(this.triangles.map(triangle => new Mesh3DTriangle(triangle.vertices.map(vector3 => vector3.add(x, y, z)), triangle.color)))
    }

    /**
     * Scales all vertices by the given amount
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} z
     * @returns {Mesh3D} The scaled Mesh
     */
    scale(x, y, z){
        if(!y){
            return new Mesh3D(this.triangles.map(triangle => new Mesh3DTriangle(triangle.vertices.map(vector3 => new Vertex3D(vector3.x * x, vector3.y * x, vector3.z * x)), triangle.color)))
        } else {
            return new Mesh3D(this.triangles.map(triangle => new Mesh3DTriangle(triangle.vertices.map(vector3 => new Vertex3D(vector3.x * x, vector3.y * y, vector3.z * z)), triangle.color)))
        }
    }

    /**
     * Rotates all vertices around the origin via the X-axis
     * @param {Number} alpha in radians
     * @returns {Mesh3D} the rotated Mesh
     */
    rotateX(alpha){
        return new Mesh3D(this.triangles.map(triangle => new Mesh3DTriangle(triangle.vertices.map(vector3 => {
            var x = vector3.x;

            var z = Math.cos(alpha) * vector3.z - Math.sin(alpha) * vector3.y
            var y = Math.sin(alpha) * vector3.z + Math.cos(alpha) * vector3.y

            return new Vertex3D(x,y,z)
        }), triangle.color)))
    }

    /**
     * Rotates all vertices around the origin via the Y-axis
     * @param {Number} alpha in radians
     * @returns {Mesh3D} the rotated Mesh
     */
    rotateY(alpha){
        return new Mesh3D(this.triangles.map(triangle => new Mesh3DTriangle(triangle.vertices.map(vector3 => {
            var y = vector3.y;

            var z = Math.cos(alpha) * vector3.z - Math.sin(alpha) * vector3.x
            var x = Math.sin(alpha) * vector3.z + Math.cos(alpha) * vector3.x

            return new Vertex3D(x,y,z)
        }), triangle.color)))
    }

    /**
     * Rotates all Vertices around the origin via the Z-axis
     * @param {Number} alpha in radians
     * @returns {Mesh3D} the rotated Mesh
     */
    rotateZ(alpha){
        return new Mesh3D(this.triangles.map(triangle => new Mesh3DTriangle(triangle.vertices.map(vector3 => {
            var z = vector3.z;

            var x = Math.cos(alpha) * vector3.x - Math.sin(alpha) * vector3.y
            var y = Math.sin(alpha) * vector3.x + Math.cos(alpha) * vector3.y

            return new Vertex3D(x,y,z)
        }), triangle.color)))
    }
}

/**
 * A collection of 2D Triangles
 */
class Mesh2D{
    constructor(mesh2Dtriangles){
        this.triangles = mesh2Dtriangles;
    }
}

/**
 * A Projection wich transfers 3D-Meshes to 2D-Meshes with screen coordinates
 */
class Projection{
    constructor(){

    }
    /**
     * Projects the given 3D Mesh
     * @param {Mesh3D} mesh to project
     * @returns {Mesh2D} the projected Mesh in screen coordinates
     */
    project(mesh){
        return new Mesh2D(mesh.triangles.map(triangle => new Mesh2DTriangle(triangle.vertices.map(vector3 => {
            var x = 0;
            var y = 0;

            x += vector3.x / vector3.z
            y += vector3.y / vector3.z

            //If vector is behind camera...
            if(vector3.z < 1){
                return new Vertex2D(vector3.x * width/2 + width/2, vector3.y*width/2+ height/2)
            }

            x *= width/2
            y *= width/2

            x += width/2
            y += height/2

            return new Vertex2D(x,y)
        }), triangle.zIndex, triangle.color)))
    }
}



function showTip(message, timeout = 3000){
    var tip = document.getElementById("tip");
    tip.style.top = "0px"
    tip.innerText = message;
    setTimeout(() => {
        tip.style.top = "-100px";
    }, timeout)
}

setTimeout(() => {
    showTip("Use the mouse to drag the scene... Reload for next scene...")
}, 8000)
time = 0;
dt = 0.005;


class OrbitSim{
    constructor(){
        zdist = 20;
        this.body = new Body(20,new Vector(0,0,0), new Vector(10,0,0), 1.5, new Vector(200,0,0))
        this.bodies = []
        for(var i = 0; i < 200; i++){
            this.bodies.push(new Body(2,Vector.random().mul(20).sub(new Vector(10,10,10)),new Vector(),0.2, Vector.random().mul(200)))
        }
    }
    update(){
        this.body.update(() => {
            return [
            new Vector(-90*this.body.position.x,0,0)
        ]})
        this.bodies.forEach(b => {
            b.update(() => {
                return [
                    gravForce(b, this.body, 2, 8)
                ]
            })
        })
    }
    render(){
        this.body.render();
        this.bodies.forEach(b => b.render())
    }
}




class GravSim{
    constructor(){
        this.bodies = []
        for(var i = 0; i < 200; i++){

            var pos = Vector.random().mul(30).sub(new Vector(15,15,15))
            var velocity = new Vector(-pos.y, pos.x, pos.z).mul(3)

            var body = new Body(Math.random()*40,
                pos,
                velocity,
                3,
                Vector.random().mul(200))
            this.bodies.push(body)
        }
        zdist=100;
    }
    update(){
        this.bodies.forEach(b => {
            b.update(() => {
                var forces = [];
                this.bodies.forEach(op => {
                    if(b != op){
                        forces.push(gravForce(b, op, 3, 12))
                    }
                })

                forces.push(b.velocity.mul(-2))
                return forces;
            })
        })
    }
    render(){
        this.bodies.forEach(b => b.render())
    }
}


class PlanetSim{
    constructor(){
        this.bodies = []
        this.bodies.push(new Body(800, new Vector(0,0,0), new Vector(), 5, new Vector(220,200,200)))
        this.bodies.push(new Body(4, new Vector(-9,0,0), new Vector(0,0,20), 1.2, Vector.random().mul(200)))
        this.bodies.push(new Body(4, new Vector(-22,0,0), new Vector(0,0,30), 1.2, Vector.random().mul(200)))
        this.bodies.push(new Body(12, new Vector(-35,7,0), new Vector(0,0,35), 1.6, Vector.random().mul(200)))
        this.bodies.push(new Body(39, new Vector(-50,7,0), new Vector(0,0,40), 3, Vector.random().mul(200)))
        zdist=40
    }
    update(){
        this.bodies.forEach(b => {
            b.update(() => {
                var forces = [];
                this.bodies.forEach(op => {
                    if(b != op){
                        forces.push(gravForce(b, op, 2, 1))
                    }
                })
                return forces;
            })
        })
    }
    render(){
        this.bodies.forEach(b => b.render())
    }
}


class RepellSim{
    constructor(){
        zdist = 80;
        this.body1 = new Body(20,new Vector(0,0,0), new Vector(0,0,0), 1.5, new Vector(0,50,200))
        this.body2 = new Body(80,new Vector(-10,-20,0), new Vector(0,0,0), 1.5, new Vector(200,0,0))
        this.body3 = new Body(80,new Vector(10,-20,0), new Vector(0,0,0), 1.5, new Vector(200,0,0))
        this.bodies = []
        for(var i = 0; i < 200; i++){
            var pos = Vector.random().mul(10).sub(new Vector(5,-10,5))
            pos.z = 0;
            var v = new Vector(0,-45,0)
            this.bodies.push(new Body(5,pos,v,0.2, Vector.random().mul(200)))
        }
    }
    update(){
        this.bodies.forEach(b => {
            b.update(() => {
                return [
                    gravForce(b, this.body1, 3, -250),
                    gravForce(b, this.body2, 2, 20),
                    gravForce(b, this.body3, 2, 20)
                ]
            })
        })
    }
    render(){
        this.body1.render();
        this.body2.render();
        this.body3.render();
        this.bodies.forEach(b => b.render())
    }
}

class AsteroidBelt{
    constructor(){
        zdist = 80;
        this.body1 = new Body(200,new Vector(0,0,0), new Vector(0,0,0), 1.5, new Vector(200,50,100))
        this.bodies = []
        for(var i = 0; i < 200; i++){
            var r = Math.random()*5+25
            var r2 = 2;
            var alpha = Math.random()*Math.PI*2
            var beta = Math.random()*Math.PI*2
            var pos = new Vector(Math.cos(alpha), Math.sin(alpha), 0).mul(r).add(new Vector(Math.cos(alpha)* Math.cos(beta), Math.sin(alpha)*Math.cos(beta), Math.sin(beta)).mul(r2))
            var v = new Vector(-pos.y,pos.x,0).mul(1.3)
            this.bodies.push(new Body(1,pos,v,0.2, Vector.random().mul(200)))
        }
    }
    update(){
        this.bodies.forEach(b => {
            b.update(() => {
                return [
                    gravForce(b, this.body1, 3, 250),
                ]
            })
        })
    }
    render(){
        this.body1.render();
        this.bodies.forEach(b => b.render())
    }
}





class Body{
    constructor(mass, position, velocity, size, color){
        this.mass = mass;
        this.position = position;
        this.velocity = velocity;
        this.acceleration = new Vector();
        this.force = new Vector();

        this.size = size;
        this.color = color;
        this.cube = new Cube(size, color)
    }
    update(forceCalc){
        this.force = forceCalc().reduce((acc, val) => acc.add(val), new Vector())
        this.acceleration = this.force.div(this.mass)
        this.velocity = this.velocity.add(this.acceleration.mul(dt))
        this.position = this.position.add(this.velocity.mul(dt))
    }
    render(){
        this.cube.render(new Vector(this.position.x, this.position.y,this.position.z), this.velocity);
    }
}

class Vector{
    constructor(x = 0, y = 0, z = 0){
        this.x = x;
        this.y = y;
        this.z = z;
    }
    add(vector){
        return new Vector(this.x + vector.x, this.y + vector.y, this.z + vector.z)
    }
    sub(vector){
        return new Vector(this.x - vector.x, this.y - vector.y, this.z - vector.z)
    }
    mul(scalar){
        return new Vector(this.x * scalar, this.y * scalar, this.z*scalar)
    }
    div(scalar){
        return new Vector(this.x / scalar, this.y / scalar, this.z/scalar)
    }
    norm(){
        return Math.sqrt(this.x * this.x + this.y * this.y+ this.z * this.z);
    }
    toColor(){
        return "rgb("+this.x+","+this.y+","+this.z+")"
    }
    static random(){
        return new Vector(Math.random(), Math.random(), Math.random())
    }
}


function gravForce(body1, body2, pot = 3, coeff = 2){
    return body2.position.sub(body1.position).div(body2.position.sub(body1.position).norm() ** pot + 1).mul(body1.mass*body2.mass*coeff)
}

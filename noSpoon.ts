/**
 * The machines are gaining ground. Time to show them what we're really made of...
 **/
 var readline = require('readline');

 const width: number = parseInt(readline()); // the number of cells on the X axis
 const height: number = parseInt(readline()); // the number of cells on the Y axis
 console.error("W: " + width);
 console.error("H: " + height);
 
 let data: String = "";
 for (let i = 0; i < height; i++) {
     const line: string = readline(); // width characters, each either a number or a '.'
     data = data.concat(line)
 }
 
 class MyNode {
     coordinates: Point;
     value: number;
     activeLinks: number;
     nodeToTheRight: Point;
     nodeToTheBottom: Point;
 
     constructor(point: Point){
         this.coordinates = point;
         this.value = Number(point.getPointValue());
         this.activeLinks = 0;
         this.nodeToTheRight = point.findRightNode();
         this.nodeToTheBottom = point.findDownNode()
     }
 }
 
 let nodesState: MyNode[] = [];
 
 class Link{
    node1: Point;
    node2: Point;
    numberOfLinks: number;

    constructor(node1: Point, node2: Point){
        this.node1 = node1;
        this.node2 = node2;
        this.numberOfLinks = 0;
    }
 }

   
let linksArray:Link[] = [];

  

 
class Point{
    x: number;
    y: number;
 
    constructor(x: number, y: number){
        this.x = x;
        this.y = y;
    }
 
    getPointValue():string{
        if(this.x <= width - 1 && this.y <= height - 1){
            const position = this.y * width + this.x + 1;
            return position === data.length ? data.substring(position - 1) : data.substring(position - 1, position)
        } else {
            return "."
        }
    }
 
    isNode(): Boolean{
        if (this.getPointValue().toString() === ".") return false
        else return true
    }
 
     findRightNode(): Point {
         let result = new Point(-1, -1)
         for (let i = this.x + 1; i <= width; i++){
             const p = new Point (i, this.y)
             if (p.isNode()) {
                 console.error("###");
                 console.error("finding right node")
                 console.error(this.x + ":" + this.y)
                 console.error(p);
                 console.error(p.getPointValue().toString());
                 console.error("###");
                 result = p
                 break
             }
         }
         return result;
     }
 
     findDownNode(): Point {
         let result = new Point(-1, -1)
         for (let i = this.y + 1; i <= height; i++){
             const p = new Point (this.x, i);
             if(p.isNode()) {
                 result = p
                 break
             }
         }
         return result
     }

     isValid(): Boolean {
         if(this.x === -1 && this.y === -1) return false
         else return true
     }
 
     // isRightNode(): Boolean {
     //     const testNode = this.findRightNode()
     //     if (testNode.toString() === "-1 -1"){
     //         return false
     //     } else {
     //         return true
     //     }
     // }
 
     toString(){
         return `${this.x} ${this.y}`
     }
 }
 
 function pos2Point(pos: number): Point{
     //pos += 1
     const y = Math.floor(pos / width);
     const x = pos % width;
     return new Point(x,y)
 }
 
 
 
 
 // function isNode (position: Point): Boolean{
 //     return position.getPointValue.toString() !== "." ? true : false;
 // }
 
 // Write an action using console.log()
 // To debug: console.error('Debug messages...');
 
 
 // Two coordinates and one integer: a node, one of its neighbors, the number of links connecting them.
 
 
 
 function findNodes() {
    for (const index in data) {
        const currDataValue = data[index]
        if (currDataValue !== ".") {
            const currPoint = pos2Point(+index);
            console.error(index);
            console.error(currDataValue);
            console.error(currPoint);
            console.error(currPoint.isNode());
            console.error("-----------------");
    
            if (currPoint.isNode()) {
                const node = new MyNode(currPoint);
                //node.value = parseInt(currPosition);
                if (!nodesState.includes(node)) nodesState.push(node);
            }
        }
    }
 }

 function findAllLinks(){
     nodesState.forEach((node)=> {
        if(node.nodeToTheRight.isValid()){
            const link = new Link(node.coordinates, node.nodeToTheRight)
            linksArray.push(link);
        }

        if(node.nodeToTheBottom.isValid()){
            const link = new Link(node.coordinates, node.nodeToTheBottom)
            linksArray.push(link);
        }
     })

     }

function isAddingLinkPossible(n1:Point, n2:Point): Boolean {
    const node1 = nodesState.find(node => node.coordinates === n1)
    const node2 = nodesState.find(node => node.coordinates === n2)
    if (node1.activeLinks < node1.value && node2.activeLinks < node2.value) return true
    else return false
}

function makeConnections(){
    linksArray.forEach(link => {

        // number of links must match the node number (check when linking)
        if (isAddingLinkPossible(link.node1, link.node2)){
        
            // links cannot cross (check if no links)
            if(link.numberOfLinks === 0) {
                checkCrossing()
                addLink()
            }
            if(link.numberOfLinks === 1) {

            }
        }
        // max 2 links per pair (check when linking)
        
        // all nodes connect into one group
    })
}
 
 findNodes();
 findAllLinks();
 makeConnections();

 //-------------CONSTRAINTS-------------
 // links cannot cross (check if no links)
 // max 2 links per pair (check when linking)
 // number of links must match the node number (check when linking)
 // all nodes connect into one group

 console.error(nodesState);
 console.error(linksArray)
 console.log('0 0 2 0 1');
 
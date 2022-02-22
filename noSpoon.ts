 /**
 * The machines are gaining ground. Time to show them what we're really made of...
 **/
//  var readline = require('readline');

const width: number = parseInt(readline()); // the number of cells on the X axis
const height: number = parseInt(readline()); // the number of cells on the Y axis
console.error("W: " + width);
console.error("H: " + height);

let data: String = "";
for (let i = 0; i < height; i++) {
    const line: string = readline(); // width characters, each either a number or a '.'
    data = data.concat(line)
}

interface Position {
    x: number;
    y: number;
}

interface Connections {
    cellA: Cell;
    cellB: Cell;
    connections: 0 | 1 | 2;
}

enum Direction {
    Up = "UP",
    Down = "DOWN",
    Left = "LEFT",
    Right = "RIGHT",
}

class Cell {
   value: number;
   isNode: boolean;
   position: Point;
   availableSlots: number;

   constructor(value: string, position: Point){
       this.value = Number(value);
       this.isNode = value === '.' ? false : true;
       this.position = position;
       this.availableSlots = Number(value);
   }

   toString(){
        return `${this.position.x} ${this.position.y}`
    }
}

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

    isValid(): Boolean {
        if(this.x === -1 && this.y === -1) return false
        else return true
    }

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

const cells = ():Cell[] => {
   let result = new Array<Cell>();
   for (const index in data){
       const pos = pos2Point(+index);
       result.push(new Cell(data[index], pos));
   }
   return result;
}

const board = {
   
    fields: cells(),
    connections: this.getPossibleLinks(),
   
    showAllFields(){
       this.fields.forEach(element => {
           console.error(element)
       });
    },

    getField(pos:Point):Cell{
        for (const f of this.fields){
            if (f.position.x === pos.x && f.position.y === pos.y) return f
        }
    },

    getNearbyCells(field:Cell):Cell[] {
        let result: Cell[] = [];
        
        for (const dir in Direction){
            const d = this.findNearbyCell(field, Direction[dir])
            if (d !== "") result.push(d)
        }
        return result;
    },

    findNearbyCell(cell:Cell, dir: Direction): Cell | string {
        let pos = cell.position
        while (this.isWithinBoard(pos)){
            switch (dir) {
                case Direction.Up: pos = this.moveUp(pos); break;
                case Direction.Down: pos = this.moveDown(pos); break;
                case Direction.Left: pos = this.moveLeft(pos); break;
                case Direction.Right: pos = this.moveRight(pos); break;
            }
            if (this.isWithinBoard(pos)){
                const n = board.getField(pos)
                if (n.isNode) return n
            } 
            else {return "";}
        }
        return "";
    },

    isWithinBoard(pos:Point):boolean{
        let result = false
        for (const f of this.fields){
            if (f.position.x === pos.x && f.position.y === pos.y) {
                result = result || true
            }
            else {
                result = result || false
            }   
        }
        return result;
    },
  
    moveRight(pos: Point): Point{return new Point(pos.x + 1, pos.y)},
    moveLeft(pos: Point): Point{return new Point(pos.x - 1, pos.y)},
    moveUp(pos: Point): Point{return new Point(pos.x, pos.y - 1)},
    moveDown(pos: Point): Point{return new Point(pos.x, pos.y + 1)},

    
    

    getPossibleLinks(){
        let possibleLinks :Array<Connections> = [];
        board.fields.map(element => {
            if(element.isNode){
                board.getNearbyCells(element).forEach(cell => {
                    if (!checkCellsDuplicate(element, cell, possibleLinks)){
                        possibleLinks.push({cellA: element, cellB:cell, connections:0})
                    }
                })
            }
        });
        
        return possibleLinks;
        
        
        // possibleLinks.forEach(c => {
        //     console.error(c[0].position + " : " + c[1].position)
        // })

        function checkCellsDuplicate(cell1:Cell , cell2:Cell, array:Array<Connections>): boolean{
            const candidate = [cell2, cell1];
            let result = false;
            array.forEach(pair => {
                const arrayPair = [pair.cellA, pair.cellB]
                if (JSON.stringify(candidate) === JSON.stringify(arrayPair)) {
                    result = result || true
                } else {
                    result = result || false
                }    
            })
            return result
        }
    },
    
    
}

// Write an action using console.log()
// To debug: console.error('Debug messages...');


// Two coordinates and one integer: a node, one of its neighbors, the number of links connecting them.
 

// function findAllLinks(){
//     nodesState.forEach((node)=> {
//        if(node.nodeToTheRight.isValid()){
//            const link = new Link(node.coordinates, node.nodeToTheRight)
//            linksArray.push(link);
//        }

//        if(node.nodeToTheBottom.isValid()){
//            const link = new Link(node.coordinates, node.nodeToTheBottom)
//            linksArray.push(link);
//        }
//     })

//     }

// function isAddingLinkPossible(n1:Point, n2:Point): Boolean {
//    const node1 = nodesState.find(node => node.coordinates === n1)
//    const node2 = nodesState.find(node => node.coordinates === n2)
//    if (node1.activeLinks < node1.value && node2.activeLinks < node2.value) return true
//    else return false
// }

// function makeConnections(){
//     linksArray.forEach(link => {

//         // number of links must match the node number (check when linking)
//         if (isAddingLinkPossible(link.node1, link.node2)){
       
//             // links cannot cross (check if no links)
//             if(link.numberOfLinks === 0) {
//                 // checkCrossing()
//                 // addLink()
//             }
//             if(link.numberOfLinks === 1) {

//             }
//         }
//         // max 2 links per pair (check when linking)
       
//         // all nodes connect into one group
//     })
// }

//  findNodes();
//  findAllLinks();
//  makeConnections();

//-------------CONSTRAINTS-------------
// links cannot cross (check if no links)
// max 2 links per pair (check when linking)
// number of links must match the node number (check when linking)
// all nodes connect into one group

console.error("vvvvvvvvv")
console.error(board.connections);
console.error("^^^^^^^^^")


console.log('0 0 2 0 1');


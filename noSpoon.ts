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
    add(): void;
    delete(): void;
    cellsBetween(): Point[];
    toString(): string;
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

class Link implements Connections{
   cellA: Cell;
   cellB: Cell;
   connections: 0 | 1 | 2;

   constructor(cellA:Cell, cellB:Cell){
       this.cellA = cellA;
       this.cellB = cellB;
       this.connections = 0;
   }

   add(){
       if (this.connections !== 2
        && this.cellA.availableSlots > 0 && this.cellB.availableSlots >0){
            this.connections++;
            this.cellA.availableSlots--;
            this.cellB.availableSlots--;
        }
   }

   delete(): void {
       if (this.connections === 1 || this.connections === 2){
           this.connections--;
           this.cellA.availableSlots++;
           this.cellB.availableSlots++;
       }
   }

   cellsBetween():Point[]{
       let result: Point[] = [];   
        if ((this.cellA.position.x === this.cellB.position.x
        && Math.abs(this.cellB.position.y - this.cellA.position.y) > 1)){
            const x = this.cellA.position.x;
            const max = Math.max(this.cellA.position.y, this.cellB.position.y);
            const min = Math.min(this.cellA.position.y, this.cellB.position.y);
            for (let y = min + 1;y < max; y++){
                result.push(new Point(x,y))
            }
       }
       if ((this.cellA.position.y === this.cellB.position.y
        && Math.abs(this.cellB.position.x - this.cellA.position.x) > 1)){
            const y = this.cellA.position.y;
            const max = Math.max(this.cellA.position.x, this.cellB.position.x);
            const min = Math.min(this.cellA.position.x, this.cellB.position.x);
            for (let x = min + 1;x < max; x++){
                result.push(new Point(x,y))
            }
       }
       return result;
   }

   toString(){
       return `${this.cellA} ${this.cellB} ${this.connections}`
   }
}

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

class Board  {
   
    fields: Cell[];
    connections: Connections[];
    blockedCells: Cell[];

    constructor(){
        this.fields = cells();
        this.connections = this.getPossibleLinks();
    }
   
    getField(pos:Point):Cell{
        for (const f of this.fields){
            if (f.position.x === pos.x && f.position.y === pos.y) return f
        }
    }

    getNearbyCells(field:Cell):Cell[] {
        let result: Cell[] = [];
        
        for (const dir in Direction){
            const d = this.findNearbyCell(field, Direction[dir])
            if (d !== "") result.push(d as Cell)
        }
        return result;
    }

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
                const n = this.getField(pos)
                if (n.isNode) return n
            } 
            else {return "";}
        }
        return "";
    }

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
    }
  
    moveRight(pos: Point): Point{return new Point(pos.x + 1, pos.y)}
    moveLeft(pos: Point): Point{return new Point(pos.x - 1, pos.y)}
    moveUp(pos: Point): Point{return new Point(pos.x, pos.y - 1)}
    moveDown(pos: Point): Point{return new Point(pos.x, pos.y + 1)}

    getPossibleLinks(){
        let possibleLinks :Array<Connections> = [];
        this.fields.map(element => {
            if(element.isNode){
                this.getNearbyCells(element).forEach(cell => {
                    if (!checkCellsDuplicate(element, cell, possibleLinks)){
                        // possibleLinks.push({cellA: element, cellB:cell, connections:0})
                        possibleLinks.push(new Link(element, cell));
                    }
                })
            }
        });
        
        return possibleLinks;

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
    }

    printLinks(text:"log" | "error"){
        for (const link of this.connections){
            if (text === "log") console.log(link.toString());
            if (text === "error") console.error(link.toString());
        }
    }
    
}

// Write an action using console.log()
// To debug: console.error('Debug messages...');


// Two coordinates and one integer: a node, one of its neighbors, the number of links connecting them.
 
//-------------CONSTRAINTS-------------
// links cannot cross (check if no links)
// max 2 links per pair (check when linking)
// number of links must match the node number (check when linking)
// all nodes connect into one group

const testCell1 = new Cell("2", new Point(2,0));
const testCell2 = new Cell("1", new Point(0,0));
const testConnection: Connections = new Link(testCell2, testCell1);

const board = new Board();
board.printLinks("error")

console.error("vvvvvvvvv")
for (let link of board.connections){
    console.error(link.cellA.position + " : " + link.cellB.position);
    console.error(link.cellsBetween());
    // board.addLink(link.cellA, link.cellB);
    link.add()
}
console.error("^^^^^^^^^")

board.printLinks("log");
// console.log('0 0 2 0 1');


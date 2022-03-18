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
    cellsBetween(): Point[];
    toString(): string;
}

enum Direction {
    Up = "UP",
    Down = "DOWN",
    Left = "LEFT",
    Right = "RIGHT",
}

class PossibleConnection {
    links: Link[];
    tried: boolean;
    active: boolean;

    constructor(links: Link[], tried = false, active = false){
        this.links = links;
        this.tried = tried;
        this.active = active;
    }

    get(){
        return this.links;
    }

    linksSum(): number{
        return this.links.reduce((total, link) => total + link.connections, 0)
    }

    toString(){
        return `${this.links.map(x => x)} ${this.tried} \n`
    }
}

class Cell {
   value: number;
   isNode: boolean;
   position: Point;
   availableSlots: number;
   nearbyCells: Cell[];
   possibleConnections: PossibleConnection[];

   constructor(value: string, position: Point){
       this.value = Number(value);
       this.isNode = value === '.' ? false : true;
       this.position = position;
       this.availableSlots = Number(value);
       this.nearbyCells = [];
       this.possibleConnections = [];
   }

   compare(otherCell:Cell):boolean{
       if (this.position.x === otherCell.position.x && this.position.y === otherCell.position.y) return true;
       else return false;
   }

   toString(){
        return `${this.position.x} ${this.position.y}`
    }
}

class Link implements Connections{
   cellA: Cell;
   cellB: Cell;
   connections: 0 | 1 | 2;

   constructor(cellA:Cell, cellB:Cell, connection: 0 | 1 | 2 = 0){
       this.cellA = cellA;
       this.cellB = cellB;
       this.connections = connection;
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

const populateFields = ():Cell[] => {
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
    blockedCells: Point[];
    nodes: Cell[];

    constructor(){
        this.fields = populateFields();
        this.nodes = this.findNodes();
        this.connections = this.getPossibleLinks();
        this.blockedCells = [];

        for (let n of this.nodes){
                n.nearbyCells = this.getNearbyCells(n);
                n.possibleConnections = this.generatePossibleConnections(n);
            }
    }

    findNodes(){
        let result: Cell[] = [];
        for (const f of this.fields){
            if(f.isNode){
                result.push(f)
            }
        }
        return result;
    }

    isLinkInConnections(link:Link): boolean{
        
        let result = false
        for (const c of this.connections){
            if (
                (c.cellA.compare(link.cellA) && c.cellB.compare(link.cellB)) 
            ||  (c.cellA.compare(link.cellB) && c.cellB.compare(link.cellA)))
            {
                result = result || true
            }
            else {
                result = result || false
            }   
        }
        return result;

    }

    getLink(cellA:Cell, cellB:Cell): Connections{
        for (const c of this.connections){
            if (
                (c.cellA.compare(cellA) && c.cellB.compare(cellB)) 
            ||  (c.cellA.compare(cellB) && c.cellB.compare(cellA)))
            {
                return c;
            }
        }
    }

    activate(link: Link){
        const fieldA = this.getField(link.cellA.position);
        const fieldB = this.getField(link.cellB.position);
        const connection = this.getLink(fieldA, fieldB)
        const bridges = link.connections;
            fieldA.availableSlots -= bridges;
            fieldB.availableSlots -= bridges;
            connection.connections = bridges;
    }

    isLinkingPossible(link: Link): boolean{
        const fieldA = this.getField(link.cellA.position);
        const fieldB = this.getField(link.cellB.position);
        
        // const connection = this.getLink(fieldA, fieldB)
        const bridges = link.connections;
        if (this.slotsAvailable(fieldA, fieldB, bridges)){
                console.error("linking possible ===> " + fieldA.availableSlots + " : " + fieldB.availableSlots);
                return true
            } else {
                return false
            }
    }

    slotsAvailable(cellA: Cell, cellB:Cell, bridges: 0|1|2): Boolean{
        return (cellA.availableSlots > 0 && cellA.availableSlots >= bridges 
            && cellB.availableSlots > 0 && cellB.availableSlots >= bridges)
    }

    generatePossibleConnections(field:Cell){
        const possibleLinks: Link[][] = this.getAllPossibleLinks(field);
        const possibleConnections = this.cartesianProduct(...possibleLinks);
        const removingZeroBridges = possibleConnections.map(el => el.filter(link => link.connections > 0));
        const connections = removingZeroBridges.map(x => new PossibleConnection(x))
        const result = connections.filter(conn => {
            const connectionSum = conn.linksSum()
            return (connectionSum === field.value);
        });
        return result;
    }

    getAllPossibleLinks(field:Cell){
        let linksArray:Link[][] = []
        for (let cell of field.nearbyCells){
            if (cell.value === 1 || field.value === 1) {
                linksArray.push([new Link(field, cell, 1), new Link(field,cell, 0)])
            } else {
                linksArray.push([new Link(field, cell, 2), new Link(field, cell, 1)])
            }
        }
        return linksArray;
    }

    cartesianProduct<T>(...allEntries: T[][]): T[][] {
        return allEntries.reduce<T[][]>(
            (results, entries) =>
            results
                .map(result => entries.map(entry => [...result, entry] ))
                .reduce((subResults, result) => [...subResults, ...result]   , []), 
            [[]]
        )
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
        this.nodes.map(node => {
            this.getNearbyCells(node).forEach(cell => {
                        if (!checkCellsDuplicate(node, cell, possibleLinks)){
                            possibleLinks.push(new Link(node, cell));
                        }
                    })
        })
        
        // this.fields.map(element => {
            // if(element.isNode){
            //     this.getNearbyCells(element).forEach(cell => {
            //         if (!checkCellsDuplicate(element, cell, possibleLinks)){
            //             possibleLinks.push(new Link(element, cell));
            //         }
            //     })
            // }
        // });
        
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

    addBlockedCells(point:Point){
        if(!this.blockedCells.includes(point)) this.blockedCells.push(point)
    }

    isLinkBlocked(points:Point[]):boolean{
        let result = false;
        if(points === []) return result;
        for (let point of points){
            if(this.blockedCells.includes(point)){
                result = result || true;
            } else {
                result = result || false;
            }
        }
        return result;
    }

    getTotalAvailableSlots():number{
        let sum = 0;
        for (const node of this.nodes){
            sum += node.availableSlots;
        }
        
        // for (const field of this.fields){
        //     if(field.isNode){
        //         sum += field.availableSlots
        //     }
        // }
        return sum;
    }

    printLinks(text:"log" | "error"){
        for (const link of this.connections){

            if (text === "log" && link.connections > 0) console.log(link.toString());
            if (text === "error") console.error(link.toString());
        }
    }

    printAvailableSlots(){
        console.error("Node : available slots \n")
        for (const node of this.nodes){
            console.error(node + ":" + node.availableSlots)
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

const board = new Board();
const testCell1 = new Cell("2", new Point(2,0));
const testCell2 = new Cell("1", new Point(0,0));
const testConnection: Connections = new Link(testCell2, testCell1);

// board.printLinks("error")

console.error("vvvvvvvvv")
console.error("Av.slots @ start: " + board.getTotalAvailableSlots());

// TODO: Logic to check all possible combinations of links
// TODO: make an iterator for board fields
// while (board.getTotalAvailableSlots() > 0){
    for (const node of board.nodes){
            console.error("listing possible connections for: " + node.position)
            for (let possConn of node.possibleConnections){
                possConn.links.forEach(link => {
                    // console.error("Connection tried?: " + possConn.tried);
                    // console.error("Connection active?: " + possConn.active);
                    // console.error("Link: " + link + " is in connections: " + board.isLinkInConnections(link))
                    if(board.isLinkingPossible(link)){
                        console.error("Before linking: " + link.cellA.position + "-" +link.cellA.availableSlots + " : " + link.cellB.position + "-" + link.cellB.availableSlots)
                        board.activate(link)
                        console.error("After linking: " + link.cellA.position + "-" +link.cellA.availableSlots + " : " + link.cellB.position + "-" + link.cellB.availableSlots)
                    }
                })
    }
}

    // for (let link of board.connections){
    //     console.error(link.toString());

    //     const blocked = board.isLinkBlocked(link.cellsBetween())
    //     if (!blocked){
    //         const isAdded = link.add()
    //         if (isAdded) {
    //             for (let pos of link.cellsBetween()){
    //                 board.addBlockedCells(pos);
    //             }
    //         }
    //     }
    // }
// }



console.error("Av.slots @ end: " + board.getTotalAvailableSlots());

console.error("vvvvvvvvv")
board.printAvailableSlots();
console.error("^^^^^^^^^")

board.printLinks("log");
// console.log('0 0 2 0 1');


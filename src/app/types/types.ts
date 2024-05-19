import { tetras } from "@/redux/actions/piezasSlice";

abstract class AbstractClass {
    constructor() {
      if (new.target === AbstractClass) {
        throw new Error("Cannot instantiate an abstract class.");
      }
    }
  
    // Método abstracto: debe ser implementado por las clases derivadas.
    abstract establecerPieza(): tetras;
  }

class BigBoy extends AbstractClass{
    constructor() {
        super()
        let initialForm = [
            [0,1,0],
            [0,1,0],
            [0,1,0],
            [0,1,0]
        ]
    }
    
    establecerPieza(): tetras {
        return {x:0, y:0}
    }

}
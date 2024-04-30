'use client'
import { UseAppDispatch, useAppSelector } from "@/redux/hooks";
import styles from "./page.module.css";
import { startEndGame, nextTetra, tetras } from "@/redux/actions/piezasSlice";
import { useEffect, useState } from "react";


export default function Home() {
  const jueguito = useAppSelector((state) => state.playing)
  const dispatch = UseAppDispatch()
  var pieza =  useAppSelector((s) => s.nextTetraedrum)
  const [copyPieza, setCopyPieza] = useState<null|tetras>(null)
  const [tableroMatrix, setTableroMatrix] = useState(Array(20).fill(0).map(() => Array(10).fill(0)))
  

  useEffect(() => {
    if (!pieza && jueguito) {
      dispatch(nextTetra({ playing: true, currentTetraedrum: { x: 0, y: 0 }, nextTetraedrum: { x: 0, y: 1 } }))
    }
    if (pieza && jueguito) {
      setCopyPieza((prev) => {
        if (!prev) {
          console.log('inicializamos copia de pieza', pieza)
          return pieza
        }
        return prev
      })
      disparador(tableroMatrix)
    }
    return()=>{}
  }, [pieza, jueguito, tableroMatrix])

  async function disparador(tablas: number[][]) {
    
    let veces = 0.3
    if (pieza && copyPieza) {
      await goDown(tablas, veces)
      return
    }
    console.log('esto ocurre cada vez que se renueva')  
    return setTableroMatrix(tableroMatrix.slice())
  }

  async function goDown(tablas: number[][], veces: number) {
    if (tablas[0].some(el=> el===1)) {
      const index1 = tablas[0].indexOf(1)
      if (tablas[1][index1] === 1) {
        dispatch(startEndGame(jueguito))
        setTableroMatrix(Array(20).fill(0).map(() => Array(10).fill(0)))
        return alert('GAME OVER')
      }
    }
    let esperame = setTimeout(() => {
      if (!copyPieza) {
        return console.log('chau!')
      }
      setCopyPieza((prevState) => {
        if(!prevState) return null
        return { ...prevState, x: prevState.x + 1 }
      })
      if (copyPieza.x == 20 || tablas[copyPieza.x][copyPieza.y] == 1) {
        dispatch(nextTetra({ playing: jueguito, currentTetraedrum: { x: 1, y: 1 }, nextTetraedrum: { x: 0, y: 5 } }))
        setCopyPieza(null)
        return 
      }
      if (copyPieza && tablas[copyPieza.x][copyPieza.y] == 0 && copyPieza.x < 20 && copyPieza.y < 10) {
        setTableroMatrix(prev => {
          if (!pieza) {
           return prev
          }
          const copyMatrix = prev.slice()
          if(copyPieza.x!==0){copyMatrix[copyPieza.x-1][copyPieza.y] = 0}
          copyMatrix[copyPieza.x][copyPieza.y] = 1
          return copyMatrix.slice()
      })
      }
      clearTimeout(esperame)
    },veces*45)
    }

  
  var startClicked = document.getElementById("event-start");
  startClicked?.addEventListener('upkey', popas)
  function popas() {
    console.log('clickeaste')
    document.addEventListener('upkey', (e) => {
      console.log(`evento ${e.type}`)
    })
  }

  
  return (
    <div style={{display:'flex', alignItems:'center', flexDirection:'row', gap:'1px', flexWrap:'wrap', maxWidth:'22em'}}>
      {!jueguito ? <h1 id="event-start" className={styles['starter-text']} onClick={() => {dispatch(startEndGame(jueguito))}}>Press here to start playing</h1> : null}
      {tableroMatrix && tableroMatrix.map((el, index) => {
        const tot = el as any[]
        return tot.map((pip, ses) => {
          return pip === 0 ? <div style={ {fontSize:'2em'}} key={ses}>🟨</div> : <div style={ {fontSize:'2em'}}  key={ses}>🟦</div> 
        })
      })}
      

     
    </div>
  );
}

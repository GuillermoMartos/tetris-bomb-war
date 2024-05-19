export type bucketIndex={
    array1: number,
    index1: number,
    array2: number,
    index2: number,
    array3: number,
    index3: number,
}

export function randomEmptySpacesChanger(tablero: number[][]): [number[][]|false, bucketIndex|false]{
    let copyMatrix = tablero.slice()
    let indexs: number[] = []
    const emptySpacesLeftForBuckets = emptySpacesChecker(copyMatrix)
    if(emptySpacesLeftForBuckets === 0) return [false, false]
    for (let i = 0; i <  emptySpacesLeftForBuckets; i++){
        const arrayRandomIndex = Math.floor(Math.random() * 20)
        const numberRandomIndex = Math.floor(Math.random() * 10)
        if (copyMatrix[arrayRandomIndex][numberRandomIndex] === 0) {
            indexs.push(arrayRandomIndex, numberRandomIndex)
            copyMatrix[arrayRandomIndex][numberRandomIndex] = 2
        }
        else {
            --i
        }
    }
    return [copyMatrix, {array1:indexs[0], index1:indexs[1], array2:indexs[2], index2:indexs[3], array3:indexs[4], index3:indexs[5]}]
}

function emptySpacesChecker(copyMatrix: number[][]):number {
    const emptySpaces = copyMatrix.flat().filter(el => el === 0).length
    if (emptySpaces > 150) {
        return 3
    }
    if (emptySpaces > 70) {
        return 2
    }
    if (emptySpaces > 40) {
        return 1
    }
    else {
        return 0
    }
}

export function removeBuckets(copyMatrix:number[][], bucketsIndexs:bucketIndex): number[][] {
    for (let i = 1; i < 4; i++) {
        const checkArrayIndex = eval("bucketsIndexs[`array${i}`]");
        const checkIndex = eval("bucketsIndexs[`index${i}`]");
        if (
          checkArrayIndex &&
          checkIndex &&
          copyMatrix[checkArrayIndex][checkIndex] === 2
        ) {
          copyMatrix[checkArrayIndex][checkIndex] = 0;
        }
    }
    return copyMatrix
}
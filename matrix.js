const fs = require('fs');
class SparseMatrix {
    constructor(numRows = 0, numCols = 0) {
        this.numRows = numRows;
        this.numCols = numCols;
        this.data = new Map(); 
    }

    static fromFile(filePath) {
        const matrix = new SparseMatrix();
        const content = fs.readFileSync(filePath, 'utf-8').trim().split('\n');
        const [rowsLine, colsLine] = content.slice(0, 2);
        matrix.numRows = parseInt(rowsLine.split('=')[1].trim());
        matrix.numCols = parseInt(colsLine.split('=')[1].trim());
      

        for (const line of content.slice(2)) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('(') && trimmedLine.endsWith(')')) {
            const [row, col, value] = trimmedLine.slice(1, -1).split(',').map(Number);
            matrix.setElement(row, col, value);
          } else {
            throw new Error(`Invalid format at line ${content.indexOf(line) + 1}`);
          }
        }
      
        return matrix;
      }


    getElement(row, col) {
        const key = `${row},${col}`;
        return this.data.get(key) || 0;
    }


    setElement(row, col, value) {
        const key = `${row},${col}`;
        if (value !== 0) {
            this.data.set(key, value);
        } else {
            this.data.delete(key);
        }
    }

    add(other) {
        if (this.numRows !== other.numRows || this.numCols !== other.numCols) {
            throw new Error('Matrix dimensions do not match for addition');
        }

        const result = new SparseMatrix(this.numRows, this.numCols);
     
        for (let [key, value] of this.data) {
            const [row, col] = key.split(',').map(Number);
            const sum = value + other.getElement(row, col);
            result.setElement(row, col, sum);
        }

        for (let [key, value] of other.data) {
            const [row, col] = key.split(',').map(Number);
            if (!this.data.has(key)) {
                result.setElement(row, col, value);
            }
        }

        return result;
    }


    subtract(other) {
        if (this.numRows !== other.numRows || this.numCols !== other.numCols) {
            throw new Error('Matrix dimensions do not match for subtraction');
        }

        const result = new SparseMatrix(this.numRows, this.numCols);
        
        for (let [key, value] of this.data) {
            const [row, col] = key.split(',').map(Number);
            const difference = value - other.getElement(row, col);
            result.setElement(row, col, difference);
        }

        for (let [key, value] of other.data) {
            const [row, col] = key.split(',').map(Number);
            if (!this.data.has(key)) {
                result.setElement(row, col, -value);
            }
        }

        return result;
    }

 
    multiply(other) {
        if (this.numCols !== other.numRows) {
            throw new Error('Matrix dimensions do not match for multiplication');
        }

        const result = new SparseMatrix(this.numRows, other.numCols);

        for (let [key, value] of this.data) {
            const [row, col] = key.split(',').map(Number);
            for (let k = 0; k < other.numCols; k++) {
                const product = value * other.getElement(col, k);
                const currentValue = result.getElement(row, k) + product;
                result.setElement(row, k, currentValue);
            }
        }

        return result;
    }
    printMatrix(filePath) {
        const fs = require('fs');
        let matrixContent = '';
      
        for (let i = 0; i < this.numRows; i++) {
          let row = [];
          for (let j = 0; j < this.numCols; j++) {
            row.push(this.getElement(i, j));
          }
          matrixContent += row.join(' ') + '\n';
        }
      
        try {
          fs.writeFileSync(filePath, matrixContent);
          console.log('Matrix written to file successfully');
        } catch (err) {
          console.error(err);
        }
      }
    }

function main() {
    const matrix1Path = './sparse_matrix/sample_inputs/matrixfile1.txt';
    const matrix2Path = './sparse_matrix/sample_inputs/matrixfile3.txt';
    const resultPath = './sparse_matrix/sample_outputs/result.txt';
  
    // Load matrices from files
    const matrix1 = SparseMatrix.fromFile(matrix1Path);
    const matrix2 = SparseMatrix.fromFile(matrix2Path);
  
    // Choose operation from the user
    console.log("Choose operation:\n1. Addition \n2. Subtraction\n3. Multiplication");
    const choice = parseInt(prompt("Make a choice (1/2/3): "));
  
    let result;
    try {
      switch (choice) {
        case 1:
          result = matrix1.add(matrix2);
          console.log("Result of addition:");
          break;
        case 2:
          result = matrix1.subtract(matrix2);
          console.log("Result of subtraction:");
          break;
        case 3:
          result = matrix1.multiply(matrix2);
          console.log("Result of multiplication:");
          break;
        default:
          console.log("Invalid choice.");
          return;
      }
      result.printMatrix(resultPath);
    } catch (error) {
      console.error(error.message);
    }
  }
  
  main();

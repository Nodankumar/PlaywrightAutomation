import ExcelJS from 'exceljs';


// Load the workbook from disk and return the worksheet the helpers operate on.
// This keeps the read/modify/write flow in one place so the caller only passes a file path.
export async function getSheet(excelFilePath){
    let workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(excelFilePath);
    const workSheet = workbook.getWorksheet("Sheet1");
    return workSheet;
}

// Walk every row and cell until we find the exact value.
// We return row/column positions instead of a cell reference because later helpers
// need to calculate a related cell position from the match.
export async function getCellPosition(searchCellValue, excelFilePath) {

    let position = {rowNum: -1, columnNum: -1};
    const sheet = await getSheet(excelFilePath);
    sheet.eachRow((row, rowNumber)=>{
        row.eachCell((cell, cellNumber)=>{
            if(cell.value===searchCellValue){
                position.rowNum = rowNumber;
                position.columnNum = cellNumber;
            }
        })
    });
    return position; 
}

// The product name is used as the anchor cell, and the price is expected two
// columns to the right in this sheet layout. Update that target cell and write
// the workbook back to disk.
export async function modifyPrice(newPrice, newPriceProductName, excelFilePath){
    let position = await getCellPosition(newPriceProductName, excelFilePath);
    position.columnNum += 2;
    const wSheet = await getSheet(excelFilePath);
    const cell = wSheet.getCell(position.rowNum, position.columnNum);
    cell.value = newPrice;
    await writeToExcel(wSheet.workbook, excelFilePath);
}

// Persist the in-memory workbook after edits are complete.
export async function writeToExcel(workbook, excelFilePath) {
    await workbook.xlsx.writeFile(excelFilePath);
}
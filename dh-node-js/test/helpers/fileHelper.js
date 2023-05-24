const XlsxPopulate = require('xlsx-populate');

// Define the mock input file structure
async function createMockInputFile() {
    const mockInputFileStructure = {
        headers: [
            'regNumber',
            'firstName',
            'middleName',
            'lastName',
            'issuingAuthority',
            'department',
            'document',
            'startDate',
            'endDate'
        ],
        data: [
            // Add more rows as needed
        ],
    };

    // Create a new workbook and set the header and data
    const workbook = await XlsxPopulate.fromBlankAsync();
    const sheet = workbook.sheet(0).range("A1:I1");
    sheet.value([mockInputFileStructure.headers]);
    // sheet.cell('A2').value(mockInputFileStructure.data);

    // Save the workbook as the mock input file
    await workbook.toFileAsync('empty-data.xlsx');
}

createMockInputFile();


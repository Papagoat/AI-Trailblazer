const { chromium } = require("playwright");
const ExcelJS = require("exceljs");

const convertFirstRowToHeader = (worksheet) => {
  const firstRow = worksheet.getRow(1);

  firstRow.eachCell((cell, colNumber) => {
    worksheet.getColumn(colNumber).key = cell.text;
  });

  worksheet.spliceRows(1, 1);
  return worksheet;
};

const getPdfsInfo = async (filename = "AI Trailblazers Data List.xlsx") => {
  // read from a file
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(`${__dirname}/${filename}`);

  const worksheet = convertFirstRowToHeader(workbook.getWorksheet("Info"));
  const urlCol = worksheet.getColumn("OG URL");
  const typeCol = worksheet.getColumn("Type");
  const descriptionCol = worksheet.getColumn("Description");
  const pdfRowNos = [];
  const pdfsInfo = [];

  // get rowNo that is of type pdf
  typeCol.eachCell((cell, rowNo) => {
    if (cell.value === "PDF") {
      pdfRowNos.push(rowNo);
    }
  });

  // filter out rows of type pdf
  urlCol.eachCell((cell, rowNo) => {
    if (!pdfRowNos.includes(rowNo)) {
      pdfsInfo.push({ rowNo, url: cell.value.text });
    }
  });

  descriptionCol.eachCell((cell, rowNo) => {
    if (!pdfRowNos.includes(rowNo)) {
      const matchingPdfInfo = pdfsInfo.find(
        (pdfInfo) => pdfInfo.rowNo === rowNo
      );
      if (matchingPdfInfo) {
        matchingPdfInfo.description =
          cell.value.toLowerCase() ?? `pdf-${rowNo}`;
      }
    }
  });

  return pdfsInfo;
};

(async () => {
  const browser = await chromium.launch();

  const pdfsInfo = await getPdfsInfo();

  console.log(`[scrape] -- there are ${pdfsInfo.length} pdfs to scrape`);

  const CHUNK_SIZE = 5;
  for (let i = 0; i < pdfsInfo.length; i += CHUNK_SIZE) {
    console.log(
      `[scrape] -- scraping chunked indexes ${i} - ${i + CHUNK_SIZE - 1}...`
    );
    const chunk = pdfsInfo.slice(i, i + CHUNK_SIZE);

    const pdfsPromises = chunk.map(async ({ url, description, rowNo }) => {
      const page = await browser.newPage();
      await page.goto(url);

      await page.pdf({ path: `pdfs/${description}.pdf`, fullPage: true });
      return page.close();
    });

    await Promise.all(pdfsPromises);
  }
  console.log(`[scrape] -- scrape completed`);

  // other actions...
  await browser.close();
})();

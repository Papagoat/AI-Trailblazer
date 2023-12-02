import { chromium } from "playwright";
import ExcelJS, { Cell, Worksheet } from "exceljs";
import { GoogleCloudStorageHelper } from "./googleHelperFile";

const convertFirstRowToHeader = (worksheet: Worksheet) => {
  const firstRow = worksheet.getRow(1);

  firstRow.eachCell((cell, colNumber) => {
    worksheet.getColumn(colNumber).key = cell.text;
  });

  worksheet.spliceRows(1, 1);
  return worksheet;
};

export const getPdfsInfo = async (
  filename = "AI Trailblazers Data List.xlsx"
) => {
  // read from a file
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(`${__dirname}/${filename}`);
  const infoWorksheet = workbook.getWorksheet("Info");

  if (!infoWorksheet) return [];
  const worksheet = convertFirstRowToHeader(infoWorksheet);

  const urlCol = worksheet.getColumn("OG URL");
  const typeCol = worksheet.getColumn("Type");
  const descriptionCol = worksheet.getColumn("Description");
  const pdfRowNos: number[] = [];
  const pdfsInfo: { rowNo: number; url: string; description?: string }[] = [];

  // get rowNo that is of type pdf
  typeCol.eachCell((cell: Cell, rowNo: number) => {
    if (cell.value === "PDF") {
      pdfRowNos.push(rowNo);
    }
  });

  // filter out rows of type pdf
  urlCol.eachCell((cell: Cell, rowNo: number) => {
    if (!pdfRowNos.includes(rowNo)) {
      pdfsInfo.push({ rowNo, url: cell.text });
    }
  });

  descriptionCol.eachCell((cell: Cell, rowNo: number) => {
    if (!pdfRowNos.includes(rowNo)) {
      const matchingPdfInfo = pdfsInfo.find(
        (pdfInfo) => pdfInfo.rowNo === rowNo
      );
      if (matchingPdfInfo) {
        matchingPdfInfo.description = cell.text.toLowerCase() ?? `pdf-${rowNo}`;
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
  const pdfFileList: string[] = [];
  for (let i = 0; i < pdfsInfo.length; i += CHUNK_SIZE) {
    console.log(
      `[scrape] -- scraping chunked indexes ${i} - ${i + CHUNK_SIZE - 1}...`
    );
    const chunk = pdfsInfo.slice(i, i + CHUNK_SIZE);

    const pdfsPromises = chunk.map(async ({ url, description }) => {
      const page = await browser.newPage();
      await page.goto(url);

      const path = `pdfs/${description}.pdf`;
      await page.pdf({ path });
      pdfFileList.push(path);
      return page.close();
    });

    await Promise.all(pdfsPromises);
  }

  console.log(`[scrape] -- scrape completed`);
  await browser.close();

  console.log(
    `[scrape] -- uploading ${pdfsInfo.length} to Cloud Storage bucket`
  );
  const bucketName = "financial-websites-pdfs";
  await new GoogleCloudStorageHelper().uploadPDFsToBucket(
    pdfFileList,
    bucketName
  );

  console.log(`[scrape] --- completed`);
})();

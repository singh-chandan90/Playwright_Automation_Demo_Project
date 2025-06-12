import * as fs from "fs";
import path from "path";
export const CSVToJSON = (
  data: string,
  delimiter = ","
): Record<string, string>[] => {
  const lines = data.trim().split("\n").filter(Boolean);
  if (lines.length < 2) return [];
  const titles = lines[0].split(delimiter).map((t) => t.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(delimiter).map((v) => v.trim());
    return titles.reduce(
      (obj: Record<string, string>, title: string, idx: number) => {
        obj[title] = values[idx] ?? "";
        return obj;
      },
      {}
    );
  });
};

//   console.log(CSVToJSON('col1,col2\na,b\nc,d'));
// Example usage
const currentDir = __dirname;
// Go one level above (project root)
const projectRootDir = path.resolve(currentDir, "..");
// Change to 'testdata' folder
const testdataDir = path.resolve(projectRootDir, "testdata");

export const convertCsvFileToJsonFile = (
  csvFileName: string,
  jsonFileName: string,
  delimiter = ","
): void => {
  try {
    // Read the CSV file
    const csvData = fs.readFileSync(`${testdataDir}/${csvFileName}`, "utf8");
    const jsonData = CSVToJSON(csvData, delimiter);
    fs.writeFileSync(
      `${testdataDir}/${jsonFileName}`,
      JSON.stringify(jsonData, null, 2),
      "utf8"
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error converting CSV to JSON:", error.message);
    } else {
      console.error("Unknown error converting CSV to JSON");
    }
  }
};

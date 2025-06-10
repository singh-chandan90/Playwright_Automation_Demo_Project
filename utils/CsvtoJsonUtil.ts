import * as fs from 'fs';
import path from 'path';
const CSVToJSON = (data: string, delimiter = ','): Record<string, string>[] => {
    const titles = data.slice(0, data.indexOf('\n')).split(delimiter);
    return data
      .slice(data.indexOf('\n') + 1)
      .split('\n')
      .map((v: string) => {
        const values = v.split(delimiter);
        return titles.reduce(
          (obj: Record<string, string>, title: string, index: number) => {
            obj[title.trim()] = values[index]?.trim() ?? '';
            return obj;
          },
          {}
        );
      });
  };



//   console.log(CSVToJSON('col1,col2\na,b\nc,d'));
// Example usage
const currentDir = __dirname;
// Go one level above (back to 'src')
const srcDir = path.resolve(currentDir, "..");

// Change to 'config' folder
const testdataDir = path.resolve(srcDir, "testdata");

 export  const convertCsvFileToJsonFile = (csvFileName: string, jsonFileName: string, delimiter = ','): void => {
    try {
      // Read the CSV file
      const csvData = fs.readFileSync(`${testdataDir}/${csvFileName}`, 'utf8');
      const jsonData = CSVToJSON(csvData, delimiter);
      fs.writeFileSync(`${testdataDir}/${jsonFileName}`, JSON.stringify(jsonData, null, 2), 'utf8');
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error converting CSV to JSON:', error.message);
      } else {
        console.error('Unknown error converting CSV to JSON');
      }
    }
  };
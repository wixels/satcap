export function jsonToCsv(jsonData: any, downloadName: string) {
  const keys = Object.keys(
    jsonData.reduce((a: any, b: any) =>
      Object.keys(a).length > Object.keys(b).length ? a : b
    )
  );
  keys.sort((a, b) => Number(a) - Number(b));
  const csvData = jsonData.map((row: any) =>
    keys.map((key) => row[key]).join(',')
  );
  csvData.unshift(keys.join(','));
  const csvString = csvData.join('\n');

  const download = () => {
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return { csvString, download };
}

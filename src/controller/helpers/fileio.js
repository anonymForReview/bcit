
export async function getFile(accept) {
  return new Promise((resolve) => {
    const fileSelector = document.createElement('input');
    fileSelector.setAttribute('type', 'file');
    fileSelector.setAttribute('accept', accept);
    fileSelector.click();

    fileSelector.addEventListener('change', () => {
      const file = fileSelector.files[0];
      resolve(file);
    });
  });
}

export async function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = reject;
    reader.readAsText(file);
  });
}

// final
export function getXmlFromViewer(viewer) {
  let result;
  viewer.saveXML({ format: true }, (err, xml) => {
    result = xml;
  });
  return result;
}

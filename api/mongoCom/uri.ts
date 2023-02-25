import fs from 'fs';
import path from 'path';

function getURI() {
  if (process.env.AWS_REGION) {
    return process.env.uri as string;
  }
  const uriJsonPath = path.join(__dirname, '../../uri.json');
  const uriJsonData = fs.readFileSync(uriJsonPath, 'utf8');
  const uriJson = JSON.parse(uriJsonData);
  return uriJson.data as string;
}
const uri = getURI();
export default uri;

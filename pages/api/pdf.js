import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
    const { filePath } = req.query;

    // Path to your info directory
    const infoDirectory = path.join(process.cwd(), 'info');
    const fullPath = path.join(infoDirectory, `${filePath}.pdf`);

    fs.readFile(fullPath, (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).end();
        } else {
            res.setHeader('Content-Type', 'application/pdf');
            res.send(data);
        }
    });
}

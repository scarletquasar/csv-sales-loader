import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

type CsvFile = {
    content: Buffer,
    path: string,
    position: number
}

type IndexOptions = {
    currentIndex: number,
    files: Array<{
        position: number,
        path: string
    }>
};

class CsvService {
    public static async getNextFiles(quantity: number): Promise<CsvFile[]> {
        const indexPath = join('.store', 'index.json');
        const index = (await readFile(indexPath)).toString();
        const options = JSON.parse(index) as IndexOptions;

        const start = options.currentIndex;
        const end = options.currentIndex + quantity;
        
        const pickedFiles = options.files.slice(start, end);
        const readPromises = pickedFiles
            .map(file => CsvService.readFileWithMetadata(file.path, file.position));

        const files = await Promise.all(readPromises);
        
        const newOptions: IndexOptions = { ...options, currentIndex: end + 1 };
        await writeFile(indexPath, JSON.stringify(newOptions));

        return files;
}

    private static async readFileWithMetadata(path: string, position: number) {
        const content = await readFile(path);
        return { content, path, position }
    }
}

export { CsvService }
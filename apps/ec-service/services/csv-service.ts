import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { IndexOptions, CsvFile } from 'types';

type CsvReference = IndexOptions['files'][number];

class CsvService {
    private static indexPath = join('/', '.store', 'index.json');

    public static async setupFileStore() {
        const storeFolderPath = join('/', '.store');
        const storeFolderExists = existsSync(storeFolderPath);
        const indexFileExists = existsSync(this.indexPath);

        if (!storeFolderExists) {
            await mkdir(storeFolderPath, { recursive: true });
        }

        if (!indexFileExists) {
            const options: IndexOptions = {
                currentIndex: 0,
                files: []
            }

            await writeFile(this.indexPath, JSON.stringify(options));
        }
    }

    public static async getNextFiles(quantity: number): Promise<CsvFile[]> {
        const index = (await readFile(this.indexPath)).toString();
        const options = JSON.parse(index) as IndexOptions;

        const start = options.currentIndex;
        const end = options.currentIndex + quantity;
        
        const pickedFiles = options.files.slice(start, end);
        const readPromises = pickedFiles
            .map(file => CsvService.readFileWithMetadata(file.path, file.position));

        const files = await Promise.all(readPromises);
        
        const newOptions: IndexOptions = { ...options, currentIndex: end + 1 };
        await writeFile(this.indexPath, JSON.stringify(newOptions));

        return files;
    }

    private static async readFileWithMetadata(path: string, position: number) {
        try {
            const content = await readFile(path);
            return { content, path, position }
        }
        catch {
            return { content: Buffer.from(''), path, position };
        }

    }
}

export { CsvService }
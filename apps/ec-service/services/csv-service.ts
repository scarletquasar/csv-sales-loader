import { readFile } from 'fs/promises';
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
    /**
     *
     *
     * @public
     * @param {number} quantity
     * - The quantity of files to be fetched by that function.
     * @return {Promise<{
     *         files: CsvFile[],
     *         end: number
     *     }>}
     * - The 'end' variable of the return may be processed to update
     * the 'currentIndex' value of the index.json. With that, the
     * 'getNextFiles' function can get in track of the next needed files
     * to properly lazy load the content from storage and keep consistent
     * with the results.
     * @memberof CsvService
     */
    public async getNextFiles(quantity: number): Promise<{
        files: CsvFile[],
        end: number
    }> {
        const indexPath = join('.store', 'index.json');
        const index = (await readFile(indexPath)).toString();
        const options = JSON.parse(index) as IndexOptions;

        const start = options.currentIndex;
        const end = options.currentIndex + quantity;
        
        const pickedFiles = options.files.slice(start, end);
        const readPromises = pickedFiles
            .map(file => this.readFileWithMetadata(file.path, file.position));

        const files = await Promise.all(readPromises);
        
        return { files, end };
        
}

    private async readFileWithMetadata(path: string, position: number) {
        const content = await readFile(path);
        return { content, path, position }
    }

    private normalizeCsv(encodedCsv: string): string {
        return 'data:text/csv;charset=utf-8,%EF%BB%BF';
    }
}
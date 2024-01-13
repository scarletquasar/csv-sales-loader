import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { retry, sleep } from "ts-async-kit";
import { IndexOptions } from "types";

type UploadQueueItem = {
    identifier: string,
    data: Buffer
}

class UploadQueue {
    private items: UploadQueueItem[];
    private indexPath: string;

    constructor() {
        this.items = [];
        this.indexPath = join('/', '.store', 'index.json');
    }

    public async next() {
        if (this.items.length) {
            const first = this.items.shift();
            await this
                .uploadItem(first)
                .catch(e => {
                    console.log(e.message);
                    this.items.push(first);
                });
        }

        await sleep(2000);
        await this.next();
    }

    public add(identifier: string, data: Buffer) {
        this.items.push({ identifier, data });
    }

    private async uploadItem(item: UploadQueueItem) {
        const uploadMethod = async () => {
            const path = join('/', '.store', item.identifier);
            await writeFile(path, item.data);

            const optionsData = (await readFile(this.indexPath)).toString();
            const options: IndexOptions = JSON.parse(optionsData);

            const position = options.files.length 
                ? Math.max(...options.files.map(file => file.position)) + 1
                : 0;
            
            const files = [...options.files, { position, path }];
            const newOptions: IndexOptions = { ...options, files };

            await writeFile(JSON.stringify(newOptions), this.indexPath);
        }

        await retry(uploadMethod, { maxRetries: 5 });
    }
}

type UploadServiceResponse = {
    message: string,
    success: boolean
};

class UploadService {
    private readonly uploadQueue: UploadQueue;

    constructor(uploadQueue: UploadQueue) {
        this.uploadQueue = uploadQueue;
    }

    public addFile(identifier: string, data: Buffer): UploadServiceResponse {
        try {
            this.uploadQueue.add(identifier, data);
            return {
                message: 'File upload queued successfully',
                success: true
            }
        }
        catch(e) {
            return {
                message: e.message,
                success: false
            }
        }
    }
}

export { UploadService }
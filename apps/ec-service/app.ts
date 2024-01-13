import { CsvService } from "services/csv-service";

async function main() {
    await CsvService.setupFileStore();
}

main();
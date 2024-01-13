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

export { CsvFile, IndexOptions }
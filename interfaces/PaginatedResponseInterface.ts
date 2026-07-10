export default interface PaginatedResponseInterface<Row> {
    data: Row[];
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
}

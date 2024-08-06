import { paginationFunction } from "./pagination-function.js";


export class APIFeatures {
    constructor(query, mongooseQuery) {
        this.query = query;
        this.mongooseQuery = mongooseQuery;
    }

    pagination({page,size}){
        const {limit,skip} = paginationFunction({page,size});
        this.mongooseQuery = this.mongooseQuery.limit(limit).skip(skip);
        return this;
    }

    filter(filters){
        this.mongooseQuery = this.mongooseQuery.find(filters);
        return this;
    }
}
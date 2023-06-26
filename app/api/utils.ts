
import { Client } from "typesense";
import {  TypesenseConfig } from "langchain/vectorstores/typesense";

export const getTypesenseClient = () =>{
    return new Client({
        nodes: [
          {
            // Ideally should come from your .env file
            host: (process.env as any).TYPESENSE_HOST,
            port: 443,
            protocol: "https",
          },
        ],
        // Ideally should come from your .env file
        apiKey: (process.env as any).TYPESENSE_API_KEY,
        numRetries: 0,
        connectionTimeoutSeconds: 200,
      });
      
}

export const getTypesenseVectorStoreConfig = () =>{
    return  {
        // Typesense client
        typesenseClient: getTypesenseClient(),
        // Name of the collection to store the vectors in
        schemaName: "satoshi_archive",
        // Optional column names to be used in Typesense
        columnNames: {
          // "vec" is the default name for the vector column in Typesense but you can change it to whatever you want
          vector: "vec",
          // "text" is the default name for the text column in Typesense but you can change it to whatever you want
          pageContent: "text",
          // Names of the columns that you will save in your typesense schema and need to be retrieved as metadata when searching
          metadataColumnNames: ["source", "loc"],
        },
        
      } satisfies TypesenseConfig;
}

import { Typesense, TypesenseConfig } from "langchain/vectorstores/typesense";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { Client } from "typesense";
import { NextResponse } from "next/server";

const vectorTypesenseClient = new Client({
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
  connectionTimeoutSeconds: 10,
});

const typesenseVectorStoreConfig = {
  // Typesense client
  typesenseClient: vectorTypesenseClient,
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

export async function POST(req: Request) {
    const { prompt } = await req.json()
    console.log("got prompt:"+prompt);
    const vectorStore = await getVectorStoreWithTypesense();
    const documents = await vectorStore.similaritySearch("prompt");
    console.log("got docs");
    console.log(JSON.stringify(documents));

    return NextResponse.json(documents,{
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, Authorization",
            "Access-Control-Allow-Methods": "PUT, POST, PATCH, DELETE, GET",
        }
    })
}

const getVectorStoreWithTypesense = async () =>
  new Typesense(new OpenAIEmbeddings(), typesenseVectorStoreConfig);

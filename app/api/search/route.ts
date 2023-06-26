
import { Typesense } from "langchain/vectorstores/typesense";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { NextResponse } from "next/server";
import { getTypesenseVectorStoreConfig } from "../utils";


export async function POST(req: Request) {
    const { prompt } = await req.json()
    const vectorStore = await getVectorStoreWithTypesense();
    const documents = await vectorStore.similaritySearch(prompt);
    console.log("got docs:" + documents.length);

    return NextResponse.json(documents,{
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, Authorization",
            "Access-Control-Allow-Methods": "PUT, POST, PATCH, DELETE, GET",
        }
    })
}

const getVectorStoreWithTypesense = async () =>
  new Typesense(new OpenAIEmbeddings(), getTypesenseVectorStoreConfig());

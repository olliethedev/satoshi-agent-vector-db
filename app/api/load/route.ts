import { GithubRepoLoader } from "langchain/document_loaders/web/github";
import {
  RecursiveCharacterTextSplitter,
} from "langchain/text_splitter";
import { Typesense, TypesenseConfig } from "langchain/vectorstores/typesense";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { Client } from "typesense";
import { Document } from "langchain/document";
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
  connectionTimeoutSeconds: 200,
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

export async function GET() {
    throw new Error("dont use in prod. just an example to populate typesense");
    const docs = await loadGithubDocs();
    console.log("got docs");
    const resultSave = await saveDocsToTypesense(docs);
    console.log(resultSave);

    return NextResponse.json({message: `saved ${docs.length} documents`},{
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, Authorization",
            "Access-Control-Allow-Methods": "PUT, POST, PATCH, DELETE, GET",
        }
    })
}

const loadGithubDocs = async () => {
  const loader = new GithubRepoLoader(
    "https://github.com/wakgill/bitcoin-archive",
    { branch: "main", recursive: true, unknown: "warn", ignorePaths: ["*.yml","*.svg","*.gitignore","*.js","*.json","*.html","!*.md","*/tests/*"] }
  );
  const docs = await loader.loadAndSplit(RecursiveCharacterTextSplitter.fromLanguage("markdown", {
    chunkSize: 4000,
    chunkOverlap: 200,
  }));
  return docs;
};
const getVectorStoreWithTypesense = async () =>
  new Typesense(new OpenAIEmbeddings(), typesenseVectorStoreConfig);

const saveDocsToTypesense = async (docs: Document[]) => {
  console.log("saving docs:" + docs.length)
  const vectorStore = await getVectorStoreWithTypesense();
  await vectorStore.addDocuments(docs);
}
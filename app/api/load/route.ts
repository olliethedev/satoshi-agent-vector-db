import { GithubRepoLoader } from "langchain/document_loaders/web/github";
import {
  RecursiveCharacterTextSplitter,
} from "langchain/text_splitter";
import { Typesense } from "langchain/vectorstores/typesense";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { Document } from "langchain/document";
import { NextResponse } from "next/server";
import { getTypesenseVectorStoreConfig } from "../utils";



export async function GET() {
    if (process.env.NODE_ENV === "production"){
      return NextResponse.json({message: "not in prod"});
    }
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
  new Typesense(new OpenAIEmbeddings(), getTypesenseVectorStoreConfig());

const saveDocsToTypesense = async (docs: Document[]) => {
  console.log("saving docs:" + docs.length)
  const vectorStore = await getVectorStoreWithTypesense();
  await vectorStore.addDocuments(docs);
}
import { NextResponse } from "next/server";
import pdf from "@cyber2024/pdf-parse-fixed"
import { createOrReadVectorStoreIndex } from "@/lib/vector-store";

export async function POST(req: Request){
   try {
    const formData = await req.formData();
    // console.log("formData", formData)
    const file = formData.get("file") as File; // Gets file, cast to type File
    const fileContents = await file.arrayBuffer(); // Gets contents of file, turn file into array Buffer
    const parsedPdf = await pdf(Buffer.from(fileContents)); // Turns arrayBuffer into a buffer, gets parsed PDF

    // Call VectorStoreIndex function
    await createOrReadVectorStoreIndex(parsedPdf.text);

    return NextResponse.json(
        {
        message: "File Uploaded"
    },
    {
        status: 200,
    });
    
} catch (error) {
    return NextResponse.json(
        {
        message: error.message,
        },
    {
        status: 500,
    }
    );
}
}
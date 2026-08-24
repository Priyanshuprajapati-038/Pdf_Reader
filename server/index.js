



const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const fs = require("fs");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");
const { QdrantClient } = require("@qdrant/js-client-rest");

require("dotenv").config();

const app = express();
const PORT = 3000;


// Middleware


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend
app.use(express.static(path.join(__dirname, "../public")));

// Multer


const upload = multer({
    dest: "uploads/"
});


// Gemini

console.log(
    "API Key exists:",
    !!process.env.GEMIN_API_KEY
);

const ai = new GoogleGenAI({
    apiKey: process.env.GEMIN_API_KEY
});


// Qdrant

const qdrant = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY
});


// Create Embedding


async function createEmbedding(text) {

    const response = await ai.models.embedContent({
        model: "gemini-embedding-2",
        contents: text
    });

    return response.embeddings[0].values;
}


// Cosine Similarity


function cosineSimilarity(vecA, vecB) {

    let dotProduct = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
    }

    return dotProduct;
}


// Home Route


app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "../public/index.html")
    );

});
// Create Qdrant Collection


app.get("/create_collection", async (req, res) => {

    try {

        await qdrant.createCollection("pdf-docs", {

            vectors: {
                size: 3072,
                distance: "Cosine"
            }

        });

        res.send("Collection created successfully");

    } catch (err) {

        console.error(err);

        res.status(500).send({
            error: err.message
        });

    }

});


// Upload PDF


app.post(
    "/upload",
    upload.single("pdf"),
    async (req, res) => {

        try {

            console.log("File received:");

            console.log(req.file);

            
            // Check PDF
            

            if (!req.file) {

                return res.status(400).json({
                    error: "Please upload a PDF file."
                });

            }

            
            // Get Question
            

            const question =
                req.body.question ||
                "Summarize this PDF and explain its important points.";

            console.log("Question:", question);

            
            // Read PDF
        

            const dataBuffer =
                fs.readFileSync(req.file.path);

            const pdfData =
                await pdfParse(dataBuffer);

            const text = pdfData.text;

            console.log(
                "PDF text length:",
                text.length
            );

        
            // Check PDF text
            

            if (!text.trim()) {

                return res.status(400).json({
                    error: "No readable text found in PDF."
                });

            }

            
            // Split PDF into chunks
            

            const chunks = text
                .split("\n\n")
                .filter(
                    chunk => chunk.trim() !== ""
                );

            console.log(
                "Total chunks:",
                chunks.length
            );

            
            // Create embeddings
            

            const chunkEmbedding = [];

            for (const chunk of chunks) {

                const embedding =
                    await createEmbedding(chunk);

                chunkEmbedding.push({

                    text: chunk,

                    embedding: embedding

                });

            }

            
            // Convert to Qdrant points
        

            const points =
                chunkEmbedding.map(
                    (item, index) => ({

                        id: index + 1,

                        vector: item.embedding,

                        payload: {

                            text: item.text

                        }

                    })
                );

            
            // Store in Qdrant
            

            await qdrant.upsert(
                "pdf-docs",
                {

                    wait: true,

                    points: points

                }
            );

    
            // Create question embedding
            

            const questionEmbedding =
                await createEmbedding(question);

            
            // Search Qdrant
            
              const searchResult = await qdrant.query(
    "pdf-docs",
    {
        query: questionEmbedding,
        limit: 1,
        with_payload: true
    }
);

console.log("Search result:", searchResult);
          
            console.log(
                "Search result:",
                searchResult
            );

        
            // Get best chunk
            

            if (
                !searchResult ||
                searchResult.length === 0
            ) {

                return res.status(404).json({
                    error:
                        "No relevant information found."
                });

            }

            const bestChunk =
                searchResult[0].payload.text;

    
            // Gemini Answer
        

            const response =
                await ai.models.generateContent({

                    model: "gemini-2.5-flash-lite",

                    contents: `
You are a helpful PDF assistant.

Answer the user's question using ONLY the provided context.

Context:
${bestChunk}

Question:
${question}

Give a clear and useful answer.
`

                });

        
            // Send result to frontend
            

            res.json({

                success: true,

                answer: response.text

            });

        } catch (err) {

            console.error(
                "UPLOAD ERROR:",
                err
            );

            res.status(500).json({

                success: false,

                error: err.message

            });

        }

    }
);


// Start Server


app.listen(PORT, () => {

    console.log(
        `Server is running on http://localhost:${PORT}`
    );

});
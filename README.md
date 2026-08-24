# 📄 PDF Reader AI — Gemini + Qdrant

An AI-powered PDF Reader that allows users to **upload a PDF and ask questions about its content**. The application extracts text from the PDF, converts the content into vector embeddings using Google's Gemini Embedding model, stores the vectors in **Qdrant**, retrieves the most relevant content, and generates an answer using **Gemini 2.5 Flash Lite**.

---

## 🚀 Features

* 📄 Upload PDF documents
* 🔍 Extract text from PDF files
* ✂️ Split PDF content into text chunks
* 🧠 Generate vector embeddings using Gemini
* 🗄️ Store and search embeddings using Qdrant
* 🔎 Retrieve the most relevant PDF content for a question
* 🤖 Generate AI-powered answers using Gemini
* 🌐 Express.js backend
* 🎨 Serve frontend directly from the `public` directory
* 🔐 API keys managed through environment variables

---

## 🏗️ How It Works

The application follows a simple **Retrieval-Augmented Generation (RAG)** workflow:

```text
User
 │
 ▼
Upload PDF + Ask Question
 │
 ▼
PDF Text Extraction
 │
 ▼
Text Chunking
 │
 ▼
Gemini Embedding Model
 │
 ▼
Vector Embeddings
 │
 ▼
Qdrant Vector Database
 │
 ▼
Similarity Search
 │
 ▼
Most Relevant PDF Content
 │
 ▼
Gemini 2.5 Flash Lite
 │
 ▼
AI Generated Answer
 │
 ▼
Frontend
```

---

## 🧠 RAG Pipeline

### 1. PDF Upload

The user uploads a PDF through the frontend.

The backend receives the file using **Multer**.

```javascript
upload.single("pdf")
```

---

### 2. PDF Text Extraction

The application reads the uploaded PDF and extracts its text using `pdf-parse`.

```javascript
const pdfData = await pdfParse(dataBuffer);
const text = pdfData.text;
```

If no readable text is found, the application returns an error.

---

### 3. Text Chunking

The extracted text is divided into smaller chunks:

```javascript
const chunks = text
    .split("\n\n")
    .filter(chunk => chunk.trim() !== "");
```

These chunks are then converted into embeddings.

---

### 4. Generate Embeddings

Google Gemini is used to generate vector embeddings for each text chunk.

```javascript
model: "gemini-embedding-2"
```

The generated vectors represent the semantic meaning of the PDF content.

---

### 5. Store Vectors in Qdrant

The embeddings and their corresponding text are stored in the Qdrant collection:

```text
pdf-docs
```

The collection uses:

```text
Vector Size: 3072
Distance: Cosine
```

Each vector is stored together with its original text as payload.

---

### 6. Question Embedding

When the user asks a question, the question is also converted into an embedding using Gemini.

The application then searches Qdrant for the most relevant PDF content.

```javascript
const searchResult = await qdrant.query(
    "pdf-docs",
    {
        query: questionEmbedding,
        limit: 1,
        with_payload: true
    }
);
```

---

### 7. Generate AI Answer

The most relevant PDF content is provided to Gemini 2.5 Flash Lite along with the user's question.

```text
Context:
Relevant PDF content

Question:
User's question
```

Gemini then generates a clear answer based on the retrieved context.

---

## 🛠️ Tech Stack

| Technology          | Purpose                         |
| ------------------- | ------------------------------- |
| Node.js             | Backend runtime                 |
| Express.js          | Web server and API              |
| Multer              | PDF file upload                 |
| pdf-parse           | PDF text extraction             |
| Google Gemini       | Embeddings and AI answers       |
| Qdrant              | Vector database                 |
| dotenv              | Environment variable management |
| HTML/CSS/JavaScript | Frontend                        |

---

## 📁 Project Structure

```text
Pdf_Reader/
│
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── server/
│   ├── index.js
│   ├── package.json
│   ├── package-lock.json
│   └── uploads/
│
├── .env
├── .gitignore
└── README.md
```

> Do not commit `.env` or uploaded user files to GitHub.

---

## ⚙️ Prerequisites

Before running the project, install:

* Node.js
* npm
* A Google Gemini API key
* A Qdrant account/instance
* Git

---

## 📦 Installation

### 1. Clone the repository

```bash
git clone https://github.com/Priyanshuprajapati-038/Pdf_Reader.git
```

### 2. Move into the project

```bash
cd Pdf_Reader
```

### 3. Install dependencies

```bash
cd server
npm install
```

---

## 🔑 Environment Variables

Create a `.env` file inside the `server` directory.

```env
GEMIN_API_KEY=your_gemini_api_key
QDRANT_URL=your_qdrant_url
QDRANT_API_KEY=your_qdrant_api_key
```

### Important

Never upload your `.env` file to GitHub.

The `.gitignore` file should contain:

```gitignore
.env
.env.*
!.env.example

node_modules/
uploads/
__pycache__/
*.pyc
venv/
.venv/
*.log
```

---

## ▶️ Run the Application

From the `server` directory:

```bash
node index.js
```

You should see:

```text
Server is running on http://localhost:3000
```

Open your browser and visit:

```text
http://localhost:3000
```

---

## 🔌 API Endpoints

### `GET /`

Loads the frontend application.

---

### `GET /create_collection`

Creates the Qdrant collection:

```text
pdf-docs
```

with:

```text
Vector Size: 3072
Distance: Cosine
```

---

### `POST /upload`

Uploads a PDF and generates an AI answer.

The request contains:

```text
pdf       → PDF file
question  → User question
```

Example workflow:

```text
PDF + Question
      ↓
Text Extraction
      ↓
Embeddings
      ↓
Qdrant Search
      ↓
Relevant Context
      ↓
Gemini
      ↓
Answer
```

---

## 💡 Example

### User uploads:

```text
machine_learning.pdf
```

### User asks:

```text
What is supervised learning?
```

### Application:

1. Extracts text from the PDF
2. Splits the text into chunks
3. Creates embeddings
4. Stores embeddings in Qdrant
5. Converts the question into an embedding
6. Searches for the most relevant chunk
7. Sends the retrieved context to Gemini
8. Returns the generated answer

Example response:

```text
Supervised learning is a machine learning approach where
a model learns from labeled training data...
```

---

## 🔐 Security

API credentials are loaded using environment variables:

```javascript
require("dotenv").config();
```

The application uses:

```javascript
process.env.GEMIN_API_KEY
process.env.QDRANT_URL
process.env.QDRANT_API_KEY
```

This prevents sensitive credentials from being hard-coded into the source code.

**Never commit API keys to GitHub.**

---

## ⚠️ Current Limitations

The current implementation is intentionally simple and can be improved further.

### 1. Basic Chunking

The PDF is currently split using:

```javascript
text.split("\n\n")
```

A proper token/character-based text splitter with overlap would provide better retrieval.

### 2. Only One Result

The Qdrant search currently retrieves:

```javascript
limit: 1
```

Retrieving multiple relevant chunks could improve answer quality.

### 3. No Metadata Filtering

The current implementation does not associate chunks with:

* PDF filename
* Page number
* Document ID

Adding metadata would make document-level retrieval more reliable.

### 4. Upload Validation

Additional validation could be added for:

* File type
* File size
* Malicious files

### 5. Temporary Files

Uploaded files should be properly deleted after processing to avoid unnecessary storage usage.

---

## 🚀 Future Improvements

* [ ] Better text chunking with overlap
* [ ] Retrieve Top-K relevant chunks
* [ ] Add page number metadata
* [ ] Add document metadata
* [ ] Support multiple PDFs
* [ ] Add conversation history
* [ ] Add streaming AI responses
* [ ] Add authentication
* [ ] Improve frontend UI
* [ ] Add drag-and-drop PDF upload
* [ ] Add PDF preview
* [ ] Add source citations
* [ ] Add document-specific search
* [ ] Add chat history
* [ ] Deploy the application to the cloud

---

## 📊 Architecture

```text
                ┌─────────────────┐
                │     Frontend    │
                │   HTML/CSS/JS   │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │    Express.js   │
                │     Backend     │
                └────────┬────────┘
                         │
                ┌────────▼────────┐
                │   PDF Parser    │
                │   pdf-parse     │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │ Gemini Embedding│
                │      Model      │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │     Qdrant      │
                │ Vector Database  │
                └────────┬────────┘
                         │
                    Relevant
                     Context
                         │
                         ▼
                ┌─────────────────┐
                │ Gemini 2.5      │
                │ Flash Lite      │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │   AI Response   │
                └─────────────────┘
```

---

## 🎯 Learning Outcomes

This project demonstrates practical experience with:

* REST API development
* Node.js and Express.js
* File upload handling
* PDF processing
* Vector embeddings
* Vector databases
* Semantic search
* Retrieval-Augmented Generation (RAG)
* Generative AI
* Google Gemini APIs
* Qdrant
* Environment variable management
* Backend/frontend integration

---



 AI & Full-Stack Development


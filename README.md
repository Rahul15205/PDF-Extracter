# AI-Powered PDF Invoice Extractor

A web application that authenticates and extracts structured data (Invoice #, Date, Vendor, Line Items, Amounts) from PDF invoices using the **Groq AI API** (Llama 3.3). It features a modern MVC architecture and allows users to export data to CSV.

## Features
- 📄 **PDF Upload**: Drag-and-drop interface for uploading invoice PDFs.
- 🤖 **AI Extraction**: Uses Llama 3.3 via Groq Cloud to intelligently parse unstructured PDF text.
- 🇮🇳 **Indian Invoice Support**: Specialized handling for GSTIN, Indian date formats, and merged text columns.
- 📊 **CSV Export**: Download extracted line items formatted for Excel/Sheets.
- 📝 **Logging**: Auto-logs all upload attempts to `logs.json`.
- 🏗 **MVC Architecture**: Clean code structure (Models, Views, Controllers, Services).

---

## 🛠 Tech Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript.
- **Backend**: Node.js, Express.js.
- **AI/LLM**: Groq API (Model: `llama-3.3-70b-versatile`).
- **Libraries**: 
  - `pdf-parse` (Text extraction)
  - `multer` (File handling)
  - `axios` (API requests)
  - `csv-writer` (Export functionality)

---

## 🚀 Setup & Installation

### 1. Prerequisites
- [Node.js](https://nodejs.org/) installed on your machine.
- A **Groq API Key**. Get one for free at [console.groq.com](https://console.groq.com/).

### 2. Clone/Download Based Code
Navigate to the project folder:
```bash
cd "PDF Extracter"
```

### 3. Install Dependencies
Run the following command to install required packages:
```bash
npm install
```

### 4. Configure Environment Variables
Create a file named `.env` in the root directory and add your API key:
```env
GROQ_API_KEY=gsk_your_actual_api_key_here
```

---

## ▶️ Running the Application

### Development Mode (Auto-restart)
```bash
npm run dev
```

### Production Start
```bash
npm start
```

Once running, open your browser and go to:  
👉 **http://localhost:3000**

---

## 📂 Project Structure (MVC)
```
/
├── controllers/
│   └── invoiceController.js  # Orchestrates Upload -> Extract -> Respond
├── models/
│   └── logModel.js           # Manages logging data (logs.json)
├── routes/
│   └── invoiceRoutes.js      # Defines API Endpoints (/upload, /export-csv)
├── services/
│   └── extractionService.js  # Business Logic: PDF Parsing + Groq AI Prompts
├── public/                   # Frontend Assets
│   ├── index.html
│   ├── style.css
│   └── script.js
├── server.js                 # App Entry Point
├── .env                      # API Credentials (Excluded from Git)
└── package.json              # Project Dependencies
```

---

## 🧪 Testing with Sample Invoice
Included in the project is `sample-invoice.html`.
1. Open `sample-invoice.html` in a browser.
2. Press `Ctrl + P` -> "Save as PDF".
3. Upload the resulting PDF to the application to test extraction.

---

## 📡 API Endpoints

### 1. Upload Invoice
- **URL**: `POST /upload`
- **Body**: `FormData` (Key: `invoice`, Value: File)
- **Response**: JSON object containing extracted fields.

### 2. Export CSV
- **URL**: `POST /export-csv`
- **Body**: JSON object of the invoice data.
- **Response**: Downloadable `.csv` file.

---


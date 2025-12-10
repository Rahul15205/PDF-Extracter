const fileInput = document.getElementById('fileInput');
const dropArea = document.getElementById('dropArea');
const extractBtn = document.getElementById('extractBtn');
const loader = document.getElementById('loader');
const resultsSection = document.getElementById('resultsSection');
const downloadBtn = document.getElementById('downloadBtn');

let currentData = null;

// File Selection Logic
dropArea.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
        document.querySelector('.file-msg').textContent = fileInput.files[0].name;
        extractBtn.disabled = false;
    }
});

// Drag and Drop (Simple)
dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.classList.add('highlight');
});
dropArea.addEventListener('dragleave', () => dropArea.classList.remove('highlight'));
dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.classList.remove('highlight');
    if (e.dataTransfer.files.length > 0) {
        fileInput.files = e.dataTransfer.files;
        document.querySelector('.file-msg').textContent = e.dataTransfer.files[0].name;
        extractBtn.disabled = false;
    }
});

// Extraction Logic
extractBtn.addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (!file) return;

    // UI Updates
    extractBtn.disabled = true;
    loader.classList.remove('hidden');
    resultsSection.classList.add('hidden');

    try {
        const file = fileInput.files[0];
        let fileToSend = file;

        // PDF TO IMAGE CONVERSION (Client-Side)
        if (file.type === 'application/pdf') {
            console.log('Converting PDF to Image...');
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            const page = await pdf.getPage(1); // Extract Page 1

            const viewport = page.getViewport({ scale: 2.0 }); // High Res
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport: viewport }).promise;

            // Convert to Blob
            fileToSend = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
            console.log('Conversion complete. Uploading image...');
        }

        const formData = new FormData();
        formData.append('invoice', fileToSend, 'invoice.jpg');

        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success && result.data) {
            currentData = result.data;
            renderResults(result.data);
        } else {
            alert('Extraction failed: ' + (result.error || 'Unknown error'));
        }

    } catch (error) {
        console.error(error);
        alert('An error occurred during upload.');
    } finally {
        extractBtn.disabled = false;
        loader.classList.add('hidden');
    }
});

function renderResults(data) {
    // Fill Cards
    document.getElementById('invNum').textContent = data.invoiceNumber || '-';
    document.getElementById('invDate').textContent = data.invoiceDate || '-';
    document.getElementById('invVendor').textContent = data.vendorName || '-';
    document.getElementById('invTotal').textContent = data.totalAmount || '-';

    // Fill Table
    const tbody = document.querySelector('#itemsTable tbody');
    tbody.innerHTML = '';

    if (data.lineItems && Array.isArray(data.lineItems)) {
        data.lineItems.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.description || ''}</td>
                <td>${item.quantity || ''}</td>
                <td>${item.rate || ''}</td>
                <td>${item.amount || ''}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    resultsSection.classList.remove('hidden');
}

// Download CSV Logic
downloadBtn.addEventListener('click', async () => {
    if (!currentData) return;

    try {
        const response = await fetch('/export-csv', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentData)
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `invoice-${currentData.invoiceNumber || 'export'}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } else {
            alert('Failed to generate CSV');
        }
    } catch (error) {
        console.error(error);
        alert('Error downloading CSV');
    }
});

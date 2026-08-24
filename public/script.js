const pdfFile = document.getElementById("pdfFile");
const fileName = document.getElementById("fileName");
const analyzeBtn = document.getElementById("analyzeBtn");
const loading = document.getElementById("loading");
const error = document.getElementById("error");
const result = document.getElementById("result");

pdfFile.addEventListener("change", () => {
    if (pdfFile.files.length > 0) {
        fileName.textContent = pdfFile.files[0].name;
    } else {
        fileName.textContent = "No file selected";
    }
});

analyzeBtn.addEventListener("click", async () => {

    if (!pdfFile.files.length) {
        error.textContent = "Please select a PDF first.";
        return;
    }

    error.textContent = "";
    result.textContent = "";
    loading.classList.remove("hidden");

    const formData = new FormData();

    // Must match upload.single("pdf") in backend
    formData.append("pdf", pdfFile.files[0]);

    try {
        const response = await fetch("/upload", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Something went wrong");
        }

        result.textContent = data.answer;

    } catch (err) {
        error.textContent = err.message;
    } finally {
        loading.classList.add("hidden");
    }
});
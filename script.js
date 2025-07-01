document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('image-input');
    const imagePreview = document.getElementById('image-preview');
    const previewImage = document.getElementById('preview-image');
    const previewText = document.getElementById('preview-text');
    const classifyBtn = document.getElementById('classify-btn');
    const resultText = document.getElementById('result-text');

    const API_KEY = "AIzaSyCTHxoGhC3NZ_FP4VCdqX1jODHhZQFFB8c";
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

    const cloudTypes = {
        0: 'Clear Sky',
        1: 'Patterned Clouds',
        2: 'Thin White Clouds',
        3: 'Thick White Clouds',
        4: 'Thick Dark Clouds',
        5: 'Veil Clouds'
    };

    imageInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                previewImage.style.display = 'block';
                previewText.style.display = 'none';
            }
            reader.readAsDataURL(file);
        }
    });

    classifyBtn.addEventListener('click', async () => {
        if (!imageInput.files[0]) {
            alert('Please select an image first.');
            return;
        }

        resultText.textContent = 'Classifying...';

        const file = imageInput.files[0];
        const reader = new FileReader();

        reader.onloadend = async () => {
            const base64Image = reader.result.split(',')[1];

            const requestBody = {
                "contents": [
                    {
                        "parts": [
                            {
                                "text": `Classify the cloud in this image into one of the following categories: ${Object.values(cloudTypes).join(", ")}. Only return the category name.`
                            },
                            {
                                "inline_data": {
                                    "mime_type": file.type,
                                    "data": base64Image
                                }
                            }
                        ]
                    }
                ]
            };

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
                    const classification = data.candidates[0].content.parts[0].text.trim();
                    resultText.textContent = classification;
                } else {
                    resultText.textContent = 'Could not classify the image. Please try another one.';
                }
            } catch (error) {
                console.error("Error:", error);
                resultText.textContent = 'An error occurred during classification.';
            }
        };

        reader.readAsDataURL(file);
    });
});
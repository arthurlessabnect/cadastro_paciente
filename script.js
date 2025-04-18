// --- WEBHOOK CONFIG ---
const WEBHOOK_URL = 'https://workportwebhook.bnect.com.br/webhook/d1705641-9bec-4353-b5c5-2775b118fd67';

// --- FORM HANDLING ---
const patientForm = document.getElementById('patient-form');
const messageDiv = document.getElementById('message');
const submitButton = document.getElementById('submit-button');

patientForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default page reload
    messageDiv.textContent = ''; // Clear previous messages
    messageDiv.className = ''; // Reset message styling
    submitButton.disabled = true;
    submitButton.textContent = 'Enviando...';

    // Get form data into an object
    const formData = new FormData(patientForm);
    const payload = {};
    // Iterate over form entries and build the payload object
    for (const [key, value] of formData.entries()) {
         // Handle potential empty values for optional fields if necessary
         // Here, we just add non-empty values or use null/empty string as needed
         payload[key] = value || null; // Or adjust based on what the webhook expects for empty fields
    }

    // Convert numeric fields explicitly if the webhook expects numbers, not strings
    // FormData values are typically strings.
    if (payload.height_cm) payload.height_cm = parseFloat(payload.height_cm);
    if (payload.initial_weight_kg) payload.initial_weight_kg = parseFloat(payload.initial_weight_kg);
    if (payload.body_fat_percentage) payload.body_fat_percentage = parseFloat(payload.body_fat_percentage);
    if (payload.basal_metabolic_rate) payload.basal_metabolic_rate = parseInt(payload.basal_metabolic_rate);

    // Basic validation (client-side)
    if (!payload.name || !payload.email || !payload.password) {
        showMessage('Por favor, preencha Nome, Email e Senha.', 'error');
        submitButton.disabled = false;
        submitButton.textContent = 'Enviar Cadastro';
        return;
     }

    console.log('Payload to be sent:', payload);

    try {
        // --- Send data to Webhook ---
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add any other required headers here, e.g.:
                // 'Authorization': 'Bearer YOUR_API_KEY'
            },
            body: JSON.stringify(payload) // Convert the JavaScript object to a JSON string
        });

        // Check if the webhook response is successful
        if (!response.ok) {
             // Try to get error message from response body if available
             let errorBody = 'Erro desconhecido do servidor.';
             try {
                const errorData = await response.json(); // Or response.text()
                errorBody = errorData.message || JSON.stringify(errorData);
             } catch (e) {
                 // Ignore if response body cannot be parsed
                 errorBody = await response.text(); // Fallback to raw text
             }
            throw new Error(`Falha no envio (${response.status} ${response.statusText}): ${errorBody}`);
        }

        // Optional: Process the webhook's response if it returns useful data
        const responseData = await response.json(); // Assuming webhook returns JSON
        console.log('Webhook response:', responseData);

        showMessage('Dados enviados com sucesso!', 'success');
        patientForm.reset(); // Clear the form

    } catch (error) {
        console.error('Error sending to webhook:', error);
        showMessage(`Erro ao enviar dados: ${error.message}`, 'error');
    } finally {
        // Re-enable the button regardless of success or failure
        submitButton.disabled = false;
        submitButton.textContent = 'Enviar Cadastro';
    }
});

// Helper function to display messages
function showMessage(message, type = 'info') { // type can be 'info', 'success', 'error'
    messageDiv.textContent = message;
    messageDiv.className = type; // Add class for styling (e.g., .success, .error)
}
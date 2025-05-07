document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const data = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        message: document.getElementById('message').value
    };

    try {
        const response = await fetch('http://localhost:3000/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        document.getElementById('response').textContent = 
            result.message || `Error: ${result.error}`;
        
        if (response.ok) e.target.reset();
    } catch (error) {
        console.error('Error:', error);
    }
});
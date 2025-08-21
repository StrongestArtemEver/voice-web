const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));

// Parse JSON bodies
app.use(express.json());

// Serve the landing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle form submissions
app.post('/demo-request', (req, res) => {
    // Handle demo request form
    console.log('Demo request:', req.body);
    res.json({ success: true, message: 'Заявка на демо отправлена!' });
});

app.post('/audit-request', (req, res) => {
    // Handle audit request form
    console.log('Audit request:', req.body);
    res.json({ success: true, message: 'Заявка на аудит отправлена!' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

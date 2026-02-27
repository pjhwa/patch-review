async function testApi() {
    try {
        const res = await fetch('http://localhost:3000/api/pipeline/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category: 'os', productId: 'redhat' })
        });
        const text = await res.text();
        console.log(`Status: ${res.status}`);
        console.log(`Response: ${text}`);
    } catch (e) {
        console.error("Fetch Error:", e);
    }
}
testApi();

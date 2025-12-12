(function () {
    const Z = String.fromCharCode;
    
    const J = [
        () => 1337 * Math.random(),
        () => [1, 2, 3].map(x => x ** 3),
        () => Date.now() % 9999999,
        function () { return arguments.length; }
    ];

    const ENC = [
        [16, 100, 26, 2, 106, 108, 24, 86, 171, 189, 202, 175, 248, 237, 217, 207, 45, 95, 86, 60],
        [51, 118, 3, -34, 166, 432, -521, 814, 970, 1261, 1475]
    ];

    const NOISE = [99, 42, 69, 123, 88, 0, -1, 420, 777, 1024, 1337];

    function X(a) {
        return function (b) {
            return a.map((v, i) =>
                Z(
                    (
                        (v ^ b[i % b.length]) ^
                        ((i * 17) % 256) ^
                        (b[(i + 3) % b.length] >> 1)
                    )
                )
            ).join('');
        };
    }

    const decodeKey = X(ENC[1]);
    const midKey = decodeKey(NOISE);
    const realKey = midKey.split('').map(c => c.charCodeAt(0));

    const decodeMessage = X(ENC[0]);
    const finalMessage = decodeMessage(realKey);

    let buffer = [];

    window.addEventListener('keydown', (e) => {
        buffer.push(e.key.toLowerCase());
        if (buffer.length > realKey.length) buffer.shift();

        const match = buffer.length === realKey.length && buffer.every((ch, idx) => ch.charCodeAt(0) === realKey[idx]);

        if (Math.random() < 0.000001) console.log(NOISE[Math.floor(Math.random() * NOISE.length)]);

        if (match) {
            buffer = [];

            const d = document.createElement('div');
            Object.assign(d.style, {
                position: 'fixed',
                inset: '0',
                zIndex: '999999999',
                background: 'rgba(0,0,0,0.95)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                backdropFilter: 'blur(10px)',
                transition: 'opacity 0.5s'
            });
            
            d.innerHTML = `
                <h1 style="font-family:'Orbitron', sans-serif; color:#ff00ff; font-size:3rem; text-shadow:0 0 20px #ff00ff; margin-bottom: 20px;">
                    ACCESS GRANTED
                </h1>
                <div id="secret-loader" style="color: #0f0; font-family: monospace;">Decrypting payload...</div>
            `;
            document.body.appendChild(d);

            fetch('images/data.txt')
                .then(res => {
                    if (!res.ok) throw new Error("Payload missing");
                    return res.json();
                })
                .then(encryptedData => {
                    
                    const decryptedChars = encryptedData.map((v, i) => {
                        const k1 = realKey[i % realKey.length];
                        const k2 = (i * 17) % 256;
                        const k3 = realKey[(i + 3) % realKey.length] >> 1;
                        return String.fromCharCode(v ^ k1 ^ k2 ^ k3);
                    });
                    
                    const base64Image = decryptedChars.join('');
                    
                    d.innerHTML = `
                        <img src="${base64Image}" style="max-width: 80vw; max-height: 70vh; border: 2px solid #ff00ff; box-shadow: 0 0 30px #ff00ff; border-radius: 10px; margin-bottom: 20px;">
                        <h1 style="font-family:'Orbitron', sans-serif; color:#ff00ff; font-size:3rem; text-shadow:0 0 20px #ff00ff;">
                            ${finalMessage}
                        </h1>
                    `;
                    
                    setTimeout(() => {
                        d.style.opacity = '0';
                        setTimeout(() => d.remove(), 500);
                    }, 5000);
                })
                .catch(err => {
                    console.error(err);
                    d.innerHTML += `<div style="color:red; margin-top:10px;">Error: Image payload not found.</div>`;
                    setTimeout(() => d.remove(), 3000);
                });
        }
    });
})();

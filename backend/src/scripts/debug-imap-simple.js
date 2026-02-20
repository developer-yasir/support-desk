import imaps from 'imap-simple';

const config = {
    imap: {
        user: 'yasirraeesit@gmail.com',
        password: 'bmgv lere pgnq rsmn',
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
        authTimeout: 10000,
        tlsOptions: { rejectUnauthorized: false }
    }
};

const test = async () => {
    try {
        const connection = await imaps.connect(config);
        console.log('Connected!');

        const boxes = await connection.getBoxes();

        // Function to recursively print boxes
        const printBoxes = (boxes, indent = '') => {
            for (const key in boxes) {
                console.log(`${indent}- ${key}`);
                if (boxes[key].children) {
                    printBoxes(boxes[key].children, indent + '  ');
                }
            }
        };

        console.log('Available Mailboxes:');
        printBoxes(boxes);

        connection.end();
    } catch (err) {
        console.error('Connection failed:', err);
    }
};

test();

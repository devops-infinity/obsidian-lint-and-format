import React, { useState } from 'react';

interface FormatSettingsModalProps {
    onClose: () => void;
}

export const FormatSettingsModal: React.FC<FormatSettingsModalProps> = ({ onClose }) => {
    const [message, setMessage] = useState('Welcome to Markdown Lint & Format!');
    const [count, setCount] = useState(0);

    const handleClick = () => {
        setCount(count + 1);
        setMessage(`Button clicked ${count + 1} times!`);
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Format Settings</h2>
            <p>{message}</p>
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <button onClick={handleClick}>
                    Click Me ({count})
                </button>
                <button onClick={onClose} style={{ marginLeft: '10px' }}>
                    Close Modal
                </button>
            </div>
            <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
                <p>This is a React component running inside an Obsidian plugin!</p>
                <p>It demonstrates:</p>
                <ul>
                    <li>React state management with hooks</li>
                    <li>Event handling</li>
                    <li>Component styling</li>
                    <li>Integration with Obsidian's Modal system</li>
                </ul>
            </div>
        </div>
    );
};
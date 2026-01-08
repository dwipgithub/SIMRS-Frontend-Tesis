import React, { useEffect, useState } from 'react';

// Reusable typing animation component
// Animates text character-by-character with configurable delays
const TypingText = ({ text = '', charDelay = 40, startDelay = 0 }) => {
    const [display, setDisplay] = useState('');

    useEffect(() => {
        let mounted = true;
        let timer = null;
        let idx = 0;

        const begin = setTimeout(() => {
            const type = () => {
                if (!mounted) return;
                if (idx <= String(text).length - 1) {
                    setDisplay(String(text).slice(0, idx + 1));
                    idx += 1;
                    timer = setTimeout(type, charDelay);
                }
            };
            type();
        }, startDelay);

        return () => {
            mounted = false;
            clearTimeout(begin);
            clearTimeout(timer);
        };
    }, [text, charDelay, startDelay]);

    return (
        <span aria-live="polite" style={{ whiteSpace: 'nowrap' }}>
            {display}
        </span>
    );
};

export default TypingText;

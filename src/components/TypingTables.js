import { useEffect, useRef } from 'react';

// Typing animation applied to table cells.
// - Observes DOM to handle tables populated asynchronously
// - Animates text-only parts of <tbody td> elements
// - If cell contains mostly inline marker spans, those are preserved
// - Uses per-word heuristic: if cell contains multiple words, animate word-by-word

const TypingTables = ({ perCellDelay = 120, charDelay = 40, startDelay = 300 }) => {
    const observerRef = useRef(null);

    useEffect(() => {
        const timers = new Set();

        const scheduleTypingForCell = (td, offsetStart) => {
            if (!td) return 0;
            // Only skip if explicitly marked as done (true). Apply animation if false or undefined
            if (td.dataset.typingDone === 'true' || td.dataset.typingStarted === 'true') return 0;

            // gather text nodes
            const textParts = [];
            const childNodes = Array.from(td.childNodes);
            childNodes.forEach((node) => {
                if (node.nodeType === Node.TEXT_NODE) {
                    const v = node.textContent.replace(/\s+/g, ' ').trim();
                    if (v) textParts.push(v);
                }
            });

            const fullText = textParts.join(' ').trim();
            if (!fullText) return 0;

            // remove direct text nodes
            childNodes.forEach((node) => {
                if (node.nodeType === Node.TEXT_NODE) td.removeChild(node);
            });

            const typingSpan = document.createElement('span');
            typingSpan.className = 'typing-text';
            typingSpan.style.whiteSpace = 'nowrap';
            td.appendChild(typingSpan);

            const startAt = offsetStart;

            const startTimer = setTimeout(() => {
                let idx = 0;
                typingSpan.textContent = fullText.slice(0, 1);
                const charStep = () => {
                    if (idx < fullText.length) {
                        typingSpan.textContent = fullText.slice(0, idx + 1);
                    }
                    idx += 1;
                    if (idx < fullText.length) {
                        const t = setTimeout(charStep, charDelay);
                        timers.add(t);
                    }
                };
                charStep();
            }, startAt);

            timers.add(startTimer);
            td.dataset.typingStarted = 'true';

            // approximate duration returned for offset progression
            const approx = Math.max(fullText.length * charDelay, fullText.split(' ').length * Math.max(charDelay * 6, 120));

            // mark done after approx duration
            const doneTimer = setTimeout(() => {
                try {
                    td.dataset.typingDone = 'true';
                    delete td.dataset.typingStarted;
                } catch (e) {}
            }, approx + 80);
            timers.add(doneTimer);

            return approx;
        };

        const scheduleTypingForTable = (table) => {
            if (!table) return;
            const tds = Array.from(table.querySelectorAll('tbody td'));
            let localOffset = startDelay;
            tds.forEach((td) => {
                const duration = scheduleTypingForCell(td, localOffset);
                if (duration > 0) localOffset += perCellDelay + duration / 4;
            });
        };

        const runOnExisting = () => {
            const tables = Array.from(document.querySelectorAll('table'));
            tables.forEach((t) => scheduleTypingForTable(t));
        };

        // observe for new tables or tbody content changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((m) => {
                if (m.type === 'childList') {
                    // check added nodes for tables, tbody, or direct text inside td
                    m.addedNodes.forEach((n) => {
                        if (!n) return;
                        if (n.nodeType === Node.TEXT_NODE) {
                            const td = n.parentElement && n.parentElement.closest && n.parentElement.closest('td');
                            if (td) scheduleTypingForCell(td, startDelay);
                            return;
                        }

                        if (n.nodeType !== 1) return;
                        if (n.tagName && n.tagName.toLowerCase() === 'table') {
                            scheduleTypingForTable(n);
                        } else {
                            const td = n.closest && n.closest('td');
                            if (td) {
                                scheduleTypingForCell(td, startDelay);
                            }
                            const tables = Array.from(n.querySelectorAll ? n.querySelectorAll('table') : []);
                            tables.forEach((t) => scheduleTypingForTable(t));
                        }
                    });
                }

                if (m.type === 'characterData') {
                    // text node changed — find nearest td ancestor and schedule typing if needed
                    const txtNode = m.target;
                    if (txtNode && txtNode.parentElement) {
                        const td = txtNode.parentElement.closest && txtNode.parentElement.closest('td');
                        if (td) scheduleTypingForCell(td, startDelay);
                    }
                }
            });
        });

        observer.observe(document.body, { childList: true, subtree: true, characterData: true });
        observerRef.current = observer;

        // initial run
        runOnExisting();

        return () => {
            observer.disconnect();
            timers.forEach((t) => clearTimeout(t));
        };
    }, [perCellDelay, charDelay, startDelay]);

    return null;
};

export default TypingTables;

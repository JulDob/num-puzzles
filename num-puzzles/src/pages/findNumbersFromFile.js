import React, { useState, useCallback, useEffect } from 'react'; // Import useEffect

function FindNumbersFromFile() {
    const [fileArray, setFileArray] = useState([]);
    const [connections, setConnections] = useState([]); // State to hold pairs of connections (still useful for initial finding)
    const [sequence, setSequence] = useState([]); // New state to hold the sequence

    const handleFileChange = (event) => {
        const file = event.target.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = (event) => {
                const text = event.target.result;
                const lines = text.split('\n');
                // Convert lines to Numbers immediately after loading
                const numbers = lines.map(line => Number(line.trim())).filter(num => !isNaN(num));
                setFileArray(numbers); // Store numbers in fileArray state
            };

            reader.onerror = (error) => {
                console.error("Error reading file:", error);
            };

            reader.readAsText(file);
            console.log("file", file);
        }
    };

    const numberSlice = useCallback((num1, num2) => {
        const num1Str = String(num1);
        const num2Str = String(num2);

        if (num1Str.length < 2 || num2Str.length < 2) {
            return false;
        }

        const num1FirstTwo = num1Str.slice(0, 2);
        const num1LastTwo = num1Str.slice(-2);
        const num2FirstTwo = num2Str.slice(0, 2);
        const num2LastTwo = num2Str.slice(-2);

        return (num1FirstTwo === num2LastTwo) || (num1LastTwo === num2FirstTwo);
    }, []);

    const findConnections = useCallback(() => {
        if (!fileArray || fileArray.length < 2) {
            console.log("Not enough numbers in fileArray to find connections.");
            setConnections([]);
            setSequence([]); // Clear sequence too
            return;
        }

        const foundConnections = [];
        for (let i = 0; i < fileArray.length; i++) {
            for (let j = i + 1; j < fileArray.length; j++) {
                if (numberSlice(fileArray[i], fileArray[j])) {
                    foundConnections.push([fileArray[i], fileArray[j]]);
                }
            }
        }
        setConnections(foundConnections); // Keep storing pairs for potential pair-wise display if needed
        return foundConnections; // Return foundConnections to be used for sequence finding
    }, [fileArray, numberSlice]);


    // Function to find a sequence of connected numbers
    const findNumberSequence = useCallback(() => {
        const foundConnections = findConnections(); // Get the pairs of connections

        if (!fileArray || fileArray.length === 0) {
            return []; // No numbers, no sequence
        }

        let numbers = [...fileArray]; // Create a copy to avoid modifying original fileArray
        let possibleSequence = [];
        let usedIndices = new Set(); // Track indices of used numbers in original fileArray

        function getNextConnectedNumber(currentNumber, usedIndices) {
            for (let i = 0; i < numbers.length; i++) {
                if (!usedIndices.has(i) && numberSlice(currentNumber, numbers[i])) {
                    return { number: numbers[i], index: i }; // Return number and its original index
                }
            }
            return null;
        }


        if (numbers.length > 0) {
            let currentNumber = numbers[0]; // Start with the first number
            let currentIndex = 0;
            possibleSequence.push(currentNumber);
            usedIndices.add(currentIndex);

            let nextConnection;
            while ((nextConnection = getNextConnectedNumber(currentNumber, usedIndices))) {
                possibleSequence.push(nextConnection.number);
                usedIndices.add(nextConnection.index);
                currentNumber = nextConnection.number;
            }
        }
        return possibleSequence;

    }, [fileArray, numberSlice, findConnections]); // Dependencies: fileArray, numberSlice, findConnections


    // Effect to calculate and set the sequence when connections or fileArray changes
    useEffect(() => {
        const sequenceResult = findNumberSequence();
        setSequence(sequenceResult);
    }, [findNumberSequence]); // Run when findNumberSequence changes (which depends on fileArray)

    return (
        <>
            <div>
                {sequence.length > 0 ? (
                    <div>
                        <h3>Number Sequence:</h3>
                        <p>{sequence.join(" -> ")}</p>
                    </div>
                ) : (
                    <div>
                        <h3>NO Number Sequence Found</h3>
                    </div>
                )}
            </div>


            <div>
                <input type="file" accept=".txt" onChange={handleFileChange} />
                {fileArray.length > 0 && (
                    <div>
                        <h3>File successfully loaded</h3>
                    </div>
                )}
            </div>

        </>
    );
}

export default FindNumbersFromFile;
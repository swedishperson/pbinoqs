import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// To support __dirname in ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function updateJsonFiles(pb, ino, qs) {
    const currentDateTime = new Date().toLocaleString('en-US', { hour12: false });

    const updateFile = (fileName, value) => {
        const filePath = path.join(__dirname, fileName);
        console.log(`Updating file: ${filePath}`);

        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error(`Error reading ${fileName}:`, err);
                return;
            }

            console.log(`Original data from ${fileName}: ${data}`);

            let jsonData = [];
            if (data) {
                try {
                    jsonData = JSON.parse(data);
                } catch (parseErr) {
                    console.error(`Error parsing ${fileName}:`, parseErr);
                    return;
                }
            }

            // Append new data to jsonData
            jsonData.push({ value, timestamp: currentDateTime });
            console.log(`Updated data for ${fileName}: ${JSON.stringify(jsonData, null, 2)}`);

            // Check if it's time to calculate growth
            if (jsonData.length >= 14 && shouldCalculateGrowth(jsonData)) {
                const growth = calculateGrowth(jsonData);
                jsonData[jsonData.length - 1].growth = growth;

                console.log(`Calculated growth for ${fileName}: ${growth}`);
            }

            // Check if it's time to check for surpassing
            if (fileName === 'pb.json' && jsonData.length >= 2) {
                const surpassDate = findSurpassDate(jsonData, 'ino.json');
                if (surpassDate) {
                    jsonData[jsonData.length - 1].surpass = surpassDate;
                    console.log(`Found surpassing date for pb.json: ${surpassDate}`);
                }
            }

            fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf8', (writeErr) => {
                if (writeErr) {
                    console.error(`Error writing ${fileName}:`, writeErr);
                } else {
                    console.log(`${fileName} updated successfully.`);
                }
            });
        });
    };

    updateFile('pb.json', pb);
    updateFile('ino.json', ino);
    updateFile('qs.json', qs);
}

// Function to check if it's time to calculate growth (every 2 weeks)
function shouldCalculateGrowth(jsonData) {
    const lastTimestamp = new Date(jsonData[jsonData.length - 1].timestamp);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    return lastTimestamp >= twoWeeksAgo;
}

// Function to calculate growth
function calculateGrowth(jsonData) {
    const currentValue = jsonData[jsonData.length - 1].value;
    const previousValue = jsonData[jsonData.length - 14].value;
    return currentValue - previousValue;
}

// Function to find the surpassing date
function findSurpassDate(pbData, inoFilename) {
    const pbLastValue = pbData[pbData.length - 1].value;
    const inoFilePath = path.join(__dirname, inoFilename);

    let inoData = [];
    try {
        const inoFileContent = fs.readFileSync(inoFilePath, 'utf8');
        inoData = JSON.parse(inoFileContent);
    } catch (err) {
        console.error(`Error reading or parsing ${inoFilename}:`, err);
        return null;
    }

    const pbDate = new Date(pbData[pbData.length - 1].timestamp);
    let growthRate = calculateGrowthRate(pbData);
    if (growthRate === 0) {
        console.warn('Growth rate is zero, cannot predict surpass date.');
        return null;
    }

    let projectedValue = pbLastValue;
    let projectedDate = new Date(pbDate);

    while (projectedValue <= inoData[inoData.length - 1].value) {
        projectedValue += growthRate;
        projectedDate.setDate(projectedDate.getDate() + 14); // Increment by 2 weeks
    }

    return projectedDate.toLocaleString('en-US', { hour12: false });
}

// Function to calculate average growth rate over time
function calculateGrowthRate(data) {
    let totalGrowth = 0;
    let count = 0;

    for (let i = 1; i < data.length; i++) {
        const growth = data[i].value - data[i - 1].value;
        totalGrowth += growth;
        count++;
    }

    return count > 0 ? totalGrowth / count : 0;
}

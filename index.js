import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { updateJsonFiles } from './update.mjs';

const app = express();
const PORT = process.env.PORT || 2052;

// Get the directory name of the current module file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve files from 'main'
app.use(express.static(path.join(__dirname, 'main')));

// Endpoint to fetch group data
app.get('/group-data', async (req, res) => {
    const groupIds = [159511, 2847031, 157764];

    try {
        // Fetch data for all group IDs concurrently
        const groupDataPromises = groupIds.map(groupId => {
            const url = `https://groups.roblox.com/v1/groups/${groupId}`;
            return fetch(url).then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            });
        });

        // Wait for all fetch operations to complete
        const groupData = await Promise.all(groupDataPromises);

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).json(groupData);
    } catch (error) {
        console.error('Error fetching group data:', error);
        res.status(500).json({ error: 'Error fetching group data' });
    }
});

// Endpoint to fetch growth data
app.get('/growth-data', async (req, res) => {
    const files = ['pb.json', 'ino.json', 'qs.json'];
    try {
        const dataPromises = files.map(async (file) => {
            const filePath = path.join(__dirname, file);
            const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
            console.log(data)
            data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            return data[0]; // Most recent entry
        });

        const growthData = await Promise.all(dataPromises);

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).json(growthData);
    } catch (error) {
        console.error('Error fetching growth data:', error);
        res.status(500).json({ error: 'Error fetching growth data' });
    }
});

// Endpoint to fetch value fields in chronological order
app.get('/json-data', async (req, res) => {
    const files = ['pb.json', 'ino.json', 'qs.json'];
    try {
        const valueDataPromises = files.map(async (file) => {
            const filePath = path.join(__dirname, file);
            const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
            data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            return data.map(entry => entry.value); // Extract and return the value field
        });

        const valueData = await Promise.all(valueDataPromises);

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).json(valueData);
    } catch (error) {
        console.error('Error fetching JSON data:', error);
        res.status(500).json({ error: 'Error fetching JSON data' });
    }
});

// Endpoint to fetch timestamp fields in chronological order from pb.json
app.get('/json-time-data', async (req, res) => {
    const filePath = path.join(__dirname, 'pb.json');
    try {
        const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
        data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        const timestamps = data.map(entry => entry.timestamp); // Extract and return the timestamp field

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).json(timestamps);
    } catch (error) {
        console.error('Error fetching JSON time data:', error);
        res.status(500).json({ error: 'Error fetching JSON time data' });
    }
});

// Catch-all route to serve index.html for any other requests
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'main', 'index.html'));
});

async function updateInfo() {
    const urls = {
        QS: 'https://groups.roblox.com/v1/groups/2847031',
        INO: 'https://groups.roblox.com/v1/groups/157764',
        PB: 'https://groups.roblox.com/v1/groups/159511',
    };

    try {
        const responses = await Promise.all(
            Object.values(urls).map(url => fetch(url).then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            }))
        );

        const [qsData, inoData, pbData] = responses;
        const qsMemberCount = qsData.memberCount;
        const inoMemberCount = inoData.memberCount;
        const pbMemberCount = pbData.memberCount;

        // Call updateJsonFiles with the fetched member counts
        updateJsonFiles(pbMemberCount, inoMemberCount, qsMemberCount);
    } catch (error) {
        console.error('Error fetching member counts:', error);
    }
}
updateInfo()

import { CronJob } from 'cron';

const cronPattern = '0 0 * * *';

const job = new CronJob(cronPattern, async () => {
    console.log('Running updateInfo() at 00:00 UTC');
    await updateInfo();
}, null, true, 'UTC');

job.start();

console.log('Scheduler started.');

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
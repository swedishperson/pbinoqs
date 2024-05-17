async function fetchGroupData() {
    const url = '/group-data';
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data)
        return data;
    } catch (error) {
        console.error('Error fetching group data:', error);
    }
}

async function fetchGrowthData() {
    const url = '/growth-data';
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data)
        return data;
    } catch (error) {
        console.error('Error fetching growth data:', error);
    }
}

async function fetchArrayData() {
    const url = '/json-data';
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data)
        return data;
    } catch (error) {
        console.error('Error fetching json data:', error);
    }
}

async function fetchTimestampData() {
    const url = '/json-time-data';
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data)
        return data;
    } catch (error) {
        console.error('Error fetching json data:', error);
    }
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

async function start() {

const groupData = await fetchGroupData()
document.getElementById('pb-members').innerHTML = `${numberWithCommas(groupData[0].memberCount)} members`
document.getElementById('ino-members').innerHTML = `${numberWithCommas(groupData[2].memberCount)} members`
document.getElementById('qs-members').innerHTML = `${numberWithCommas(groupData[1].memberCount)} members`
const growthData = await fetchGrowthData()
document.getElementById('pb-growth').innerHTML = `Growth: ${growthData[0].growth}`
document.getElementById('ino-growth').innerHTML = `Growth: ${growthData[1].growth}`
document.getElementById('qs-growth').innerHTML = `Growth: ${growthData[2].growth}`
document.getElementById('pb-surpass').innerHTML = `Surpass: ${growthData[0].surpass || 'N/A'}`

const lineData = await fetchArrayData()
const timeData = await fetchTimestampData()

const xValues = timeData;
const yValues = lineData[0];
const yValues2 = lineData[1];
const yValues3 = lineData[2];

new Chart("myChart", {
    type: "line",
    data: {
      labels: xValues,
      datasets: [
        {
          label: "Pinewood",
          backgroundColor: "rgba(0, 0, 255, 0)",
          borderColor: "rgba(0, 0, 255, 1)",
          data: yValues // Data for PB
        },
        {
          label: "Innovation",
          backgroundColor: "rgba(0, 255, 0, 0)",
          borderColor: "rgba(0, 255, 0, 1)",
          data: yValues2 // Data for ino
        },
        {
          label: "Quantum",
          backgroundColor: "rgba(255, 0, 0, 0)",
          borderColor: "rgba(255, 0, 0, 1)",
          data: yValues3 // Data for qs
        }
      ]
    },
    options: {}
  });
}

start()
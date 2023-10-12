let input = document.getElementById("input"),
timeDisplay = document.getElementById("time"),
bestTimeDisplay = document.getElementById("bestTime"),
lettersTable = document.getElementById("letters-table"), 
expectedText = "abcdefghijklmnopqrstuvwxyz",
bestTimesArray = JSON.parse(localStorage.getItem("bestTimesArray")) || [], currentIndex = 0,
calculateTotal = (obj) => Object.values(obj).reduce((acc, val) => acc + parseFloat(val), 0).toFixed(2),
letterTimes = bestTimesArray[0] || {}, previousTime = 0.00, startTime, timerInterval

function updateTimer() {
	timeDisplay.textContent = ((Date.now() - startTime) / 1000).toFixed(2);
}

input.addEventListener("input", function (event) {
	if (!startTime) startTime = Date.now(), timerInterval = setInterval(updateTimer, 10);
	if (input.value === expectedText.slice(0, input.value.length) && event.data != null) {
		letterTimes[expectedText[currentIndex]] = ((Date.now() - startTime - previousTime) / 1000).toFixed(2);
		previousTime = Date.now() - startTime;
	} else input.value = expectedText.slice(0, currentIndex);
	if (input.value === expectedText) {
		input.disabled = true
		clearInterval(timerInterval);
		timeDisplay.textContent = ((Date.now() - startTime) / 1000).toFixed(2);
		bestTimesArray.push(letterTimes)
		bestTimesArray = bestTimesArray.filter((a, i) => !bestTimesArray.some((b, k) => i != k && Object.keys(a).every(key => parseFloat(a[key]) >= parseFloat(b[key]))))
		localStorage.setItem("bestTimesArray", JSON.stringify(bestTimesArray.sort((a, b) => calculateTotal(a) - calculateTotal(b))));
		displayLetterTimes();
		bestTimeDisplay.textContent = calculateTotal(bestTimesArray[0])
	}
	currentIndex = input.value.length;
});

function displayLetterTimes() {
	while (lettersTable.firstChild) lettersTable.removeChild(lettersTable.firstChild);
	var bestTimes = bestTimesArray.reduce((result, obj) => Object.assign(result, ...Object.keys(obj).map(key => ({[key]: Math.min(result[key] || Infinity, parseFloat(obj[key]))}))),{});
	lettersTable.innerHTML += `<tr><th>Letters</th><th>Times (s)</th><th>Best Possible Times (s)</th></tr>
	${Object.entries(letterTimes).sort().map(([letter, time]) => `<tr>
		<td>${letter}</td>
		<td style="background-color: rgb(${77*(time/Math.max(...Object.values(letterTimes)))+34},34,34)">${time+(time==bestTimes[letter]?'*':'')}</td>
		<td style="background-color: rgb(${77*(bestTimes[letter]/Math.max(...Object.values(bestTimes)))+34},34,34)">${bestTimes[letter]}</td>
	</tr>`).join('')}
	<tr><th>Total</th><th>${calculateTotal(letterTimes)}</th><th>${calculateTotal(bestTimes)}</th></tr>`;
}

document.getElementById("reset-button").addEventListener("click", function () {
	input.value = "", input.disabled = false, timeDisplay.textContent = "0.00", letterTimes = {}, previousTime = 0, currentIndex = 0, startTime = null
	input.focus();
	clearInterval(timerInterval);
});

document.getElementById("download-button").addEventListener("click", () => {
	const url = URL.createObjectURL(new Blob([JSON.stringify(bestTimesArray)], {type: "application/json"}));
	Object.assign(document.createElement("a"), { href: url, download: "bestTimes.json" }).click();
	URL.revokeObjectURL(url);
});
	
document.getElementById("upload-input").addEventListener("change", () => {
	if (window.confirm("This will erase all previously saved times, are you sure?")) {
		const reader = new FileReader();
		reader.onload = () => {
			const uploadedData = JSON.parse(reader.result);
			if (Array.isArray(uploadedData)) localStorage.setItem("bestTimesArray", JSON.stringify(uploadedData));
			else alert("Invalid JSON file. Please select a valid JSON file.");
			location.reload();
		};
		reader.readAsText(event.target.files[0]);
	}
});

document.getElementById("upload-button").addEventListener("click", function () {
	document.getElementById("upload-input").click();
});

window.onload = () => {
	input.onpaste = e => e.preventDefault();
}

if (bestTimesArray.length > 0) bestTimeDisplay.textContent = calculateTotal(bestTimesArray[0])
displayLetterTimes()
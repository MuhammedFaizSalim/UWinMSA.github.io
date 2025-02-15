
document.addEventListener("DOMContentLoaded", function () {
    fetch('prayer_times.json')
        .then(response => response.json())
        .then(data => {
            const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            const todayData = data.find(entry => entry.Date === today);
            if (!todayData) {
                console.error("No prayer time data found for today.");
                return;
            }

            let maghribAdhanTime = todayData["Maghrib Adhan"];
            let [hours, minutes, period] = maghribAdhanTime.match(/(\d+):(\d+) (\wM)/).slice(1);
            hours = parseInt(hours);
            minutes = parseInt(minutes) + 5;

            if (minutes >= 60) {
                minutes -= 60;
                hours += 1;
            }

            if (period === "PM" && hours !== 12) hours += 12;
            if (period === "AM" && hours === 12) hours = 0;

            const maghribIqamaTime = new Date();
            maghribIqamaTime.setHours(hours, minutes, 0);

            document.getElementById("maghrib-time").innerText = maghribAdhanTime + " + 5 min";

            const iqamaTimes = {
                "Fajr": "6:30 AM",
                "Dhuhr": "12:50 PM",
                "Asr": "4:00 PM",
                "Maghrib": maghribIqamaTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                "Isha": "7:30 PM"
            };

            let now = new Date();
            let nextPrayer = null;
            let nextIqamaTime = null;

            Object.keys(iqamaTimes).forEach(prayer => {
                let [h, m, p] = iqamaTimes[prayer].match(/(\d+):(\d+) (\wM)/).slice(1);
                h = parseInt(h);
                m = parseInt(m);
                if (p === "PM" && h !== 12) h += 12;
                if (p === "AM" && h === 12) h = 0;

                let iqamaTime = new Date();
                iqamaTime.setHours(h, m, 0);

                if (iqamaTime > now && (!nextIqamaTime || iqamaTime < nextIqamaTime)) {
                    nextPrayer = prayer;
                    nextIqamaTime = iqamaTime;
                }
            });

            if (nextPrayer) {
                document.getElementById("next-iqama");
                updateCountdown(nextIqamaTime, nextPrayer);
                setInterval(() => updateCountdown(nextIqamaTime, nextPrayer), 1000);
            } else {
                document.getElementById("countdown").innerText = "No more prayers today.";
            }
        })
        .catch(error => console.error("Error loading prayer times:", error));
});

function updateCountdown(targetTime, nextPrayer) {
    let now = new Date();
    let diff = Math.floor((targetTime - now) / 1000);
    const countdownElement = document.getElementById("countdown");
    countdownElement.style.padding = "10px 20px";
    countdownElement.style.borderRadius = "8px";
    countdownElement.style.background = "rgba(0, 0, 0, 0.1)";
    countdownElement.style.display = "inline-block";
    countdownElement.style.fontWeight = "bold";

    if (diff <= 0) {
        countdownElement.innerText = "Establish the Prayer!";
        countdownElement.classList.remove("pulsing");
        return;
    }

    let hours = Math.floor(diff / 3600);
    let minutes = Math.floor((diff % 3600) / 60);
    let seconds = diff % 60;

    countdownElement.innerText = `${nextPrayer} is in: ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    if (minutes === 0 && seconds <= 59) {
        countdownElement.classList.add("pulsing");
    } else {
        countdownElement.classList.remove("pulsing");
    }
}

const style = document.createElement('style');
style.innerHTML = `
    .pulsing {
        animation: pulse 1s infinite;
    }
    @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.7; }
        100% { transform: scale(1); opacity: 1; }
    }
`;
document.head.appendChild(style);

